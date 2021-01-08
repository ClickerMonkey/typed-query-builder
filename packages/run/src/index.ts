import { 
  Expr, Transformer, isString, isNumber, isDate, isBoolean, isArray,
  ExprConstant, ExprNot, ExprCase, ExprOperationBinary, ExprOperationUnary, ExprAggregate, ExprBetween, ExprCast,
  ExprDeep, ExprExists, ExprDefault, ExprField, ExprFunction, ExprIn, ExprRow, ExprPredicateBinary, ExprPredicateBinaryList,
  ExprPredicateRow, ExprPredicateUnary, ExprPredicates, QuerySelect, QueryFirstValue, QueryFirst, QueryWindow, QuerySet, 
  QueryGroup, OrderBy, QueryExistential, QueryCriteria, QueryJson, QueryList, StatementInsert, StatementDelete, StatementUpdate,
  AggregateFunctions, ExprParam, DataTypeTypes, getDataTypeFromInput, getDataTypeMeta, PredicateBinaryType, isPlainObject, 
  mapRecord, Functions
} from '@typed-query-builder/builder';

import * as fns from './Functions';
























RunTransformers.setTransformer(
  QuerySelect, 
  (v, transform) => {
    const handler = handleQuery(v, transform);
    const selects = {};
    for (const selectAlias in v._criteria.selects) {
      selects[selectAlias] = transform(v._criteria.selects[selectAlias]);
    }

    return (sources, params) => {
      const state = handler(sources, params);
      let page = state.groups;

      // https://www.postgresql.org/docs/13/sql-select.html#id-1.9.3.171.7
      // TODO DISTINCT or DISTINCT ON

      if (isNumber(v._offset)) {
        page = page.slice(v._offset);
      }
      if (isNumber(v._limit)) {
        page = page.slice(0, v._limit);
      }

      return page.map((group) => {
        state.group = v._groupBy.length > 0 ? group : state.rows;
        state.row = group[0];

        return buildSelection(sources, params, state, selects);
      });
    };
  }
);

RunTransformers.setTransformer(
  QueryFirst, 
  (v, transform) => {
    const handler = handleQuery(v, transform);
    const selects = {};
    for (const selectAlias in v._selects) {
      selects[selectAlias] = transform(v._selects[selectAlias]);
    }

    return (sources, params) => {
      const state = handler(sources, params);

      state.group = v._groupBy.length > 0 ? state.groups[0] : state.rows;
      state.row = v._groupBy.length > 0 ? state.group[0] : state.rows[0];

      return buildSelection(sources, params, state, selects);
    };
  }
);

RunTransformers.setTransformer(
  QueryExistential, 
  (v, transform) => {
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);

      return state.groups.length > 0;
    };
  }
);

RunTransformers.setTransformer(
  QueryList, 
  (v, transform) => {
    const item = transform(v.item);
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);
      let page = state.groups;

      if (isNumber(v._offset)) {
        page = page.slice(v._offset);
      }
      if (isNumber(v._limit)) {
        page = page.slice(0, v._limit);
      }

      return page.map((group) => {
        state.group = group;
        state.row = group[0];

        return item(sources, params, state);
      });
    };
  }
);

RunTransformers.setTransformer(
  QueryFirstValue, 
  (v, transform) => {
    const item = transform(v.value);
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);

      state.group = v._groupBy.length > 0 ? state.groups[0] : state.rows;
      state.row = v._groupBy.length > 0 ? state.group[0] : state.rows[0];

      return item(sources, params, state);
    };
  }
);


function buildSelection(sources: RunTransformerInput, params: Record<string, any> | undefined, state: RunTransformerState, selects: Record<string, RunTransformerFunction<any>>): any {
  const out: any = {};

  for (const prop in selects) {
    out[prop] = selects[prop](sources, params, state);
  }

  return out;
}

function handleQuery(base: QuerySelectBase<any, any, any>, transform: RunTransformerTransformer): RunTransformerFunction<RunTransformerState>
{
  const wheres = base._where.map( transform );
  const orderBy = base._orderBy.map((by) => ({ order: by.order, value: transform(by.value) }));
  const groupBys = base._groupBy.map( transform );
  const having = base._having ? transform(base._having) : undefined;
  
  const sources: {
    source: QuerySource<any>,
    alias: string,
    type: QueryJoinType,
    condition: RunTransformerFunction<boolean>,
    getRows: RunTransformerFunction<any[]>,
  }[] = [];

  for (const sourceName in base._sources) {
    const source = base._sources[sourceName];
    const alias = source.alias;
    let type: QueryJoinType = 'OUTER';
    let condition: RunTransformerFunction<boolean> = () => true;
    let getRows: RunTransformerFunction<any> | undefined;

    if (source instanceof QuerySourceQuery) {
      getRows = transform(source.query);
    }
    else if (source instanceof QuerySourceTable) {
      getRows = (sources) => sources[source.table];
    }
    else if (source instanceof QuerySourceConstant) {
      getRows = () => source.constants;
    }
    else if (source instanceof QuerySourceJoin) {
      const innerSource = source.source;
      
      if (innerSource instanceof QuerySourceQuery) {
        getRows = transform(innerSource.query);
      }
      else if (innerSource instanceof QuerySourceTable) {
        getRows = (sources) => sources[innerSource.table];
      }
      else if (innerSource instanceof QuerySourceConstant) {
        getRows = () => innerSource.constants;
      }
      else {
        getRows = () => [];
      }

      type = source.type;
      condition = transform(source.condition);
    }
    else {
      getRows = () => [];
    }

    sources.push({ source, alias, type, condition, getRows });
  }

  return (input, params) => {
    let state: RunTransformerState = {
      rows: [],
      row: {},
      group: [],
      groups: [],
    };

    for (const source of sources) {
      const joinRows = source.getRows(input, params, state);
      const resultRows: RunTransformerRow[] = [];

      switch (source.type) {
        case 'OUTER':
          if (state.rows.length > 0) {
            for (const row of state.rows) {
              for (const joinRow of joinRows) {
                state.row = {
                  ...row,
                  [source.alias]: joinRow,
                };
                const match = source.condition(input, params, state);
  
                if (match) {
                  resultRows.push(state.row);
                }
              }
            }
          } else {
            for (const joinRow of joinRows) {
              state.row = {
                [source.alias]: joinRow,
              };
              const match = source.condition(input, params, state);
  
              if (match) {
                resultRows.push(state.row);
              }
            }
          }
          break;
        case 'INNER':
          for (const row of state.rows) {
            state.row = row;
            for (const joinRow of joinRows) {
              state.row[source.alias] = joinRow;

              const match = source.condition(input, params, state);

              if (match) {
                resultRows.push(state.row);
                break;
              }
            }
          }
          break;
        case 'LEFT':
          for (const row of state.rows) {
            let matched = false;
            for (const joinRow of joinRows) {
              state.row = {
                ...row,
                [source.alias]: joinRow,
              };

              const match = source.condition(input, params, state);

              if (match) {
                resultRows.push(state.row);
                matched = false;
              }
            }
            if (!matched) {
              resultRows.push(row);
            }
          }
          break;
        case 'RIGHT':
          for (const joinRow of joinRows) {
            let matched = false;
            for (const row of state.rows) {  
              state.row = {
                ...row,
                [source.alias]: joinRow,
              };

              const match = source.condition(input, params, state);

              if (match) {
                resultRows.push(state.row);
                matched = false;
              }
            }
            if (!matched) {
              resultRows.push(joinRow);
            }
          }
          break;
      }

      state.rows = resultRows;
    }

    for (const where of wheres) {
      state.rows = state.rows.filter((row) => {
        state.row = row;

        return where(input, params, state);
      });
    }

    if (groupBys.length > 0) {
      state.groups = [state.rows];

      for (const grouper of groupBys) {
        const resultGroups: RunTransformerRow[][] = [];
        for (const group of state.groups) {
          const byMap = new Map<any, RunTransformerRow[]>();
          for (const row of group) {
            state.group = group;
            state.row = row;

            const by = grouper(input, params, state);

            const newGroup = byMap.get(by);
            if (newGroup) {
              newGroup.push(row);
            } else {
              byMap.set(by, [row]);
            }
          }

          for (const newGroup of byMap.values()) {
            resultGroups.push(newGroup);
          }
        }
        state.groups = resultGroups;
      }
      
      if (having) {
        state.groups = state.groups.filter((group) => {
          state.group = group;
          state.row = group[0];
  
          return having(input, params, state);
        });
      }
    } else {
      state.groups = state.rows.map((row) => [row]);
    }

    if (orderBy.length > 0) {
      state.groups.sort((a, b) => {
        for (const orderer of orderBy) {
          state.group = a;
          state.row = a[0];
          const av = orderer.value(input, params, state);

          state.group = b;
          state.row = b[0];
          const bv = orderer.value(input, params, state);

          const cmp = compare(av, bv);

          if (cmp !== 0) {
            return cmp;
          }
        }

        return 0;
      });
    }

    return state;
  };
}
