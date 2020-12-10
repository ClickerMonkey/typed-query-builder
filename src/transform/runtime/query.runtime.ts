

interface QueryTransformRuntimeInput {
  [source: string]: any[];
}
interface QueryTransformRuntimeRow {
  [source: string]: {
    [field: string]: any;
  };
}
interface QueryTransformRuntimeState {
  rows: QueryTransformRuntimeRow[];
  row: QueryTransformRuntimeRow;
  group: QueryTransformRuntimeRow[];
  groups: QueryTransformRuntimeRow[][];
}
interface QueryTransformRuntimeFunction<T> {
  (sources: QueryTransformRuntimeInput, params?: Record<string, any>, state?: QueryTransformRuntimeState): T;
}
interface QueryTransformRuntimeTransformer{
  <T>(value: QueryValue<T>): QueryTransformRuntimeFunction<T>;
}

const compare = (a: any, b: any, ignoreCase: boolean = false): number => {
  if (a === null) {
    a = undefined;
  }
  if (b === null){ 
    b = undefined;
  }
  if (a === b) {
    return 0;
  }
  if (isString(a) && isString(b)) {
    return (ignoreCase ? a.toLowerCase() : a).localeCompare(ignoreCase ? b.toLowerCase() : b);
  }
  if (isNumber(a) && isNumber(b)) {
    return a - b;
  }
  if (isDate(a) && isDate(b)) {
    return a.getTime() - b.getTime();
  }
  if (isBoolean(a) && isBoolean(b)) {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }
  return -1;
};

const QueryTransformerRuntime = new QueryTransformer<QueryTransformRuntimeTransformer>();
QueryTransformerRuntime.setTransformer(
  QueryConstant, 
  (v) => () => v.value === null ? undefined : v.value
);
QueryTransformerRuntime.setTransformer(
  QueryNot, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => !value(sources, params, state);
  }
);
QueryTransformerRuntime.setTransformer(
  QueryCase, 
  (v, transform) => {
    const value = transform(v.value);
    const cases = v.cases.map(([caseValue, caseResult]) => [transform(caseValue), transform(caseResult)]);
    const otherwise = v.otherwise ? transform(v.otherwise) : () => undefined;

    return (sources, params, state) => {
      const x = value(sources, params, state);

      for (const [caseValue, caseResult] of cases) {
        if (x === caseValue(sources, params, state)) {
          return caseResult(sources, params, state);
        }
      }

      return otherwise(sources, params, state);
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QueryOperationBinary, 
  (v, transform) => {
    const first = transform(v.first);
    const second = transform(v.second);

    return (sources, params, state) => {
      const a = first(sources, params, state);
      const b = second(sources, params, state);
      
      if (a === undefined || b === undefined) {
        return undefined;
      }

      switch (v.type) {
        case '%': return a % b;
        case '&': return a & b;
        case '*': return a * b;
        case '+': return a + b;
        case '-': return a - b;
        case '/': return a / b;
        case '<<': return a << b;
        case '>>': return a >> b;
        case 'MOD': return a % b;
        case '^': return a ^ b;
        case '|': return a | b;
      }
    }
  }
);
QueryTransformerRuntime.setTransformer(
  QueryOperationUnary, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => {
      const a = value(sources, params, state);

      if (a === undefined) {
        return undefined;
      }

      switch (v.type) {
        case '-': return -a;
        case '~': return ~a;
      }
    }
  }
);
QueryTransformerRuntime.setTransformer(
  QueryOperationCompare, 
  (v, transform) => {
    const value = transform(v.value);
    const test = transform(v.test);

    return (sources, params, state) => {
      const a = value(sources, params, state);
      const b = test(sources, params, state);

      if (a === undefined || b === undefined) {
        return false;
      }

      switch (v.type) {
        case '=':
        case '<=>': return compare(a, b) === 0;
        case '!=':
        case '<>': return compare(a, b) !== 0;
        case '<': return compare(a, b) < 0;
        case '<=': return compare(a, b) <= 0;
        case '>': return compare(a, b) > 0;
        case '>=': return compare(a, b) >= 0;
        case 'LIKE': return new RegExp('^' + String(b).replace(/%/g, '.*') + '$').test(String(a));
        case 'ILIKE': return new RegExp('^' + String(b).replace(/%/g, '.*') + '$', 'i').test(String(a));
        case 'NOT LIKE': return !new RegExp('^' + String(b).replace(/%/g, '.*') + '$').test(String(a));
        case 'NOT ILIKE': return !new RegExp('^' + String(b).replace(/%/g, '.*') + '$', 'i').test(String(a));
      }
    }
  }
);
QueryTransformerRuntime.setTransformer(
  QueryFunctionCall, 
  (v, transform) => {
    const args = v.args.map(transform);

    return (sources, params, state) => {
      const values = args.map(p => p(sources, params, state));

      switch (v.func) {
        case 'abs': Math.abs(values[0] as number);
      }
    }
  }
);
QueryTransformerRuntime.setTransformer(
  QueryConditions, 
  (v, transform) => {
    const conditions = v.conditions.map(transform);

    if (v.type === 'AND') {
      return (sources, params, state) => !conditions.some((c) => !c(sources, params, state));
    } else {
      return (sources, params, state) => conditions.some((c) => c(sources, params, state));
    }
  }
);
QueryTransformerRuntime.setTransformer(
  QueryIn, 
  (v, transform) => {
    const value = transform(v.value);
    const list = isArray(v.list)
      ? v.list.map(transform)
      : transform(v.list);
    
    return (sources, params, state) => {
      const test = value(sources, params, state);

      return isArray(list)
        ? v.not !== list.some((item) => compare(item(sources, params, state), test))
        : v.not !== list(sources, params, state).some((item) => compare(item, test));
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QueryBetween, 
  (v, transform) => {
    const value = transform(v.value);
    const low = transform(v.low);
    const high = transform(v.high);

    return (sources, params, state) => {
      const v = value(sources, params, state);

      return compare(v, low(sources, params, state)) >= 0 && compare(v, high(sources, params, state)) <= 0;
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QueryExists, 
  (v, transform) => {
    const sub = transform(v.value);

    return (sources, params, state) => !sub(sources, params, state) === v.not;
  }
);
QueryTransformerRuntime.setTransformer(
  QueryAggregateValue, 
  (v, transform) => {
    const getValue = v.value ? transform(v.value) : undefined;
    
    return (sources, params, state) => {
      if (!state) {
        return 0;
      }

      if (state.group.length === 0) {
        switch (v.type) {
          case 'AVG':
          case 'MAX':
          case 'MIN':
          case 'STDEV':
          case 'VAR':
            return undefined;
          case 'COUNT':
          case 'SUM':
            return 0;
        }
      }

      if (!getValue) {
        if (v.type === 'COUNT') {
          return state.group.length;
        } else {
          return 0;
        }
      }

      const previousRow = state.row;
      const values: any[] = state.group.map((row) => {
        state.row = row;

        return getValue(sources, params, state);
      });
      state.row = previousRow;

      const numbers: number[] = values.filter(isNumber);

      if (v.distinct) {
        for (let i = 0; i < numbers.length; i++) {
          for (let k = numbers.length - 1; k > i; k--) {
            if (numbers[k] === numbers[i]) {
              numbers.splice(k, 1);
            }
          }
        }
      }
      
      switch (v.type) {
        case 'COUNT':
          return values.reduce((count, v) => Boolean(v) ? count + 1 : count, 0);
        case 'AVG':
          return numbers.reduce((sum, v) => sum + v, 0) / numbers.length;
        case 'SUM':
          return numbers.reduce((sum, v) => sum + v, 0);
        case 'MAX':
          return numbers.reduce((max, v) => Math.max(max, v));
        case 'MIN':
          return numbers.reduce((min, v) => Math.min(min, v));
        case 'STDEV':
        case 'VAR':
          return 0;
      }
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QueryParam, 
  (v) => (_, params) => {
    const result = params?.[v.param];

    return result === null ? undefined : result;
  }
);
QueryTransformerRuntime.setTransformer(
  QueryField, 
  (v) => (_, __, state) => {
    const result = state?.row?.[v.source]?.[v.field];

    return result === null ? undefined : result;
  }
);

interface QueryDataTypeConfigObject<T> {
  parser: (value: any) => T,
  isValid: (value: T) => boolean;
  clamp?: (value: T, length?: number, precision?: number) => T | undefined,
}

function parseDate(x: any) {
  if (isDate(x)) {
    return x;
  }
  if (isNumber(x)) {
    return new Date(x);
  }
  if (isString(x)) {
    return new Date(Date.parse(x));
  }
  return new Date();
}

const QueryDataTypeConfig: {
  [K in keyof QueryDataTypeTypes]: QueryDataTypeConfigObject<QueryDataTypeTypes[K]>
} = {
  'BIGINT': {
    parser: parseInt,
    isValid: isFinite,
  },
  'INT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-2147483648, Math.min(2147483647, x)),
  },
  'MEDIUMINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-8388608, Math.min(8388607, x)),
  },
  'SMALLINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-32768, Math.min(32767, x)),
  },
  'TINYINT': {
    parser: parseInt,
    isValid: isFinite,
    clamp: (x) => Math.max(-128, Math.min(127, x)),
  },
  'BITS': {
    parser: parseInt,
    isValid: isFinite,
  },
  'BIT': {
    parser: (x: any) => !/^(0|false)$/i.test(String(x)),
    isValid: () => true,
  },
  'BOOLEAN': {
    parser: (x: any) => !/^(0|false)$/i.test(String(x)),
    isValid: () => true,
  },
  'FLOAT': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'NUMERIC': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'DOUBLE': {
    parser: parseFloat,
    isValid: isFinite,
  },
  'DATE': {
    parser: parseDate,
    isValid: (d) => isFinite(d.getTime()),
  },
  'TIME': {
    parser: (x) => String(x),
    isValid: () => true,
  },
  'DATETIME': {
    parser: parseDate,
    isValid: (d) => isFinite(d.getTime()),
  },
  'TIMESTAMP': {
    parser: parseDate,
    isValid: (d) => isFinite(d.getTime()),
  },
  'YEAR': {
    parser: parseInt,
    isValid: isFinite,
  },
  'CHAR': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'VARCHAR': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'TEXT': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'UUID': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'BINARY': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'VARBINARY': {
    parser: (x) => String(x),
    isValid: isString,
    clamp: (x, length) => isNumber(length)
      ? x.substring(0, length)
      : x,
  },
  'BLOB': {
    parser: (x) => String(x),
    isValid: isString,
  },
  'JSON': {
    parser: (x) => isString(x) ? JSON.parse(x) : x,
    isValid: () => true,
  },
};
QueryTransformerRuntime.setTransformer(
  QueryCast, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => {
      const result = value(sources, params, state);
      const typeName: keyof QueryDataTypeTypes = isString(v.type) ? v.type : v.type[0];
      const typeLength = isString(v.type) ? undefined : v.type[1];
      const typePrecision = isString(v.type) ? undefined : v.type[2];
      const typeConfig: QueryDataTypeConfigObject<any> = QueryDataTypeConfig[typeName];
      const cast = typeConfig.parser(result);

      return typeConfig.isValid(cast)
        ? typeConfig.clamp
          ? typeConfig.clamp(cast, typeLength, typePrecision)
          : cast
        : undefined;
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QueryValueCheck, 
  (v, transform) => {
    const value = transform(v.value);

    return (sources, params, state) => {
      const x = value(sources, params, state);

      switch (v.type) {
        case 'FALSE':
          return !x;
        case 'TRUE':
          return Boolean(x);
        case 'NOT NULL':
          return x !== null && x !== undefined;
        case 'NULL':
          return x === null || x === undefined;
      }
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QuerySelect, 
  (v, transform) => {
    const handler = handleQuery(v, transform);
    const selects = {};
    for (const selectAlias in v._selects) {
      selects[selectAlias] = transform(v._selects[selectAlias]);
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
QueryTransformerRuntime.setTransformer(
  QuerySelectFirst, 
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
QueryTransformerRuntime.setTransformer(
  QuerySelectExistential, 
  (v, transform) => {
    const handler = handleQuery(v, transform);

    return (sources, params) => {
      const state = handler(sources, params);

      return state.groups.length > 0;
    };
  }
);
QueryTransformerRuntime.setTransformer(
  QuerySelectList, 
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
QueryTransformerRuntime.setTransformer(
  QuerySelectFirstValue, 
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


function buildSelection(sources: QueryTransformRuntimeInput, params: Record<string, any> | undefined, state: QueryTransformRuntimeState, selects: Record<string, QueryTransformRuntimeFunction<any>>): any {
  const out: any = {};

  for (const prop in selects) {
    out[prop] = selects[prop](sources, params, state);
  }

  return out;
}

function handleQuery(base: QuerySelectBase<any, any, any>, transform: QueryTransformRuntimeTransformer): QueryTransformRuntimeFunction<QueryTransformRuntimeState>
{
  const wheres = base._where.map( transform );
  const orderBy = base._orderBy.map((by) => ({ order: by.order, value: transform(by.value) }));
  const groupBys = base._groupBy.map( transform );
  const having = base._having ? transform(base._having) : undefined;
  
  const sources: {
    source: QuerySource<any>,
    alias: string,
    type: QueryJoinType,
    condition: QueryTransformRuntimeFunction<boolean>,
    getRows: QueryTransformRuntimeFunction<any[]>,
  }[] = [];

  for (const sourceName in base._sources) {
    const source = base._sources[sourceName];
    const alias = source.alias;
    let type: QueryJoinType = 'OUTER';
    let condition: QueryTransformRuntimeFunction<boolean> = () => true;
    let getRows: QueryTransformRuntimeFunction<any> | undefined;

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
    let state: QueryTransformRuntimeState = {
      rows: [],
      row: {},
      group: [],
      groups: [],
    };

    for (const source of sources) {
      const joinRows = source.getRows(input, params, state);
      const resultRows: QueryTransformRuntimeRow[] = [];

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
        const resultGroups: QueryTransformRuntimeRow[][] = [];
        for (const group of state.groups) {
          const byMap = new Map<any, QueryTransformRuntimeRow[]>();
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

/**
 * count(*) = state.rows.length
 * count(condition) = for each state.rows, set row, if condition is true then count it
 * sum(value) = for each state.rows, set row, add result of value into sum
 * 
 * 
 * select count(*), done, creator
 * from task
 * groupBy done, creator
 * 
 * Tasks: true,pmd - true,nad - true,pmd - false,pmd => 2,true,pmd - 1,true,nad - 1,false,pmd
 * 
 * [
 *  { task: { done: true, creator: 'pmd' } },
 *  { task: { done: true, creator: 'nad' } },
 *  { task: { done: true, creator: 'pmd' } },
 *  { task: { done: false, creator: 'pmd' } }
 * ]
 * 
 * GROUP by done
 * [
 *  { task: { done: [true, true, true], creator: ['pmd', 'nad', 'pmd'] } },
 *  { task: { done: [false], creator: ['pmd'] } }
 * ]
 * 
 * GROUP by creator
 * [
 *  { task: { done: [true, true], creator: ['pmd', 'pmd'] } },
 *  { task: { done: [true], creator: ['nad'] } },
 *  { task: { done: [false], creator: ['pmd'] } }
 * ]
 * 
 */