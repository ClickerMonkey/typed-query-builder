import { 
  JoinType, QuerySelect, QueryList, QueryFirstValue, QueryFirst, QuerySet, 
  StatementDelete, StatementInsert, StatementUpdate,
} from '@typed-query-builder/builder';

import { RunTransformerFunction, RunTransformers } from './Transformers';





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

// withs
// froms
// joins
// where
// group by & having
// calculate selects
  // apply windows, for each aggregate with a custom window and each defined window - calculate those selects
    // when order by is specified, window frame is by default from start to last row that has same value as current row based on orderBy
    // when order is not specified, window frame is complete partition
  // terms
    // partition = rows with same partition by value
    // window frame = window defines start and end of frame (default start=1, end=last peer of current)
    // peers = rows with same order by value in partition, without order by no peers
  // window functions
    // rowNumber = number of current row within partition, starting at 1
    // rank = rowNumber of first row in peer group (peer group is rows with same orderby value)
    // denseRank = counts peer groups in partition (how many unique orderby values)
    // percentRank = (rank - 1) / (total partition rows - 1)
    // cumeDist = (number of partition rows preceding or peers with current row) / (total partition rows)
    // ntile(buckets) = floor((rowNumber - 1) / buckets) + 1 ??????
    // lag(value, offset=1, default=NULL) = value of row offset rows before in partition
    // lead(value, offset=1, default=NULL) = value of row offset rows after in partition
    // firstValue(value) = value of first row in window frame
    // lastValue(value) = value of last row in window frame
    // nthValue(value, n) = value of row that is the nth row of the window frame (start at 1), NULL if no row
  // window without partition is full results (ie: count(*) over ())
// distinct & distinct on
// order by
  // take order by exprs that are aggregates over windows, order by window name, compute results
// limit & offset

// ntile  2   3   4   5   6,7,8,9   10
// 1      1   1   1   1   1         1
// 2      1   1   1   1   1         2
// 3      1   1   1   2   2         3
// 4      1   1   2   2   2         4
// 5      1   2   2   3   3         5
// 6      2   2   2   3   3         6
// 7      2   2   3   4   4         7
// 8      2   2   3   4   4         8
// 9      2   3   3   5   5         9
// 10     2   3   4   5   5         10

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
    source: NamedSource<any, any>,
    alias: string,
    type: JoinType,
    condition: RunTransformerFunction<boolean>,
    getRows: RunTransformerFunction<any[]>,
  }[] = [];

  for (const sourceName in base._sources) {
    const source = base._sources[sourceName];
    const alias = source.alias;
    let type: JoinType = 'FULL';
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
