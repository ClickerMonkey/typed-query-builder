import { Database, DatabaseQueryProvider, DatabaseParameters, DatabaseQueryResult, DatabaseStreamListener, DatabaseProcResult, DatabaseResultProvider } from '@typed-query-builder/builder';
import { prepare, exec } from './core';
import { RunInput } from './State';


export interface RunDatabaseOptions<D extends RunInput>
{

  /**
   * If text comparison should be case insensitive.
   */
  ignoreCase?: boolean;

  /**
   * Use the column/table names instead of the aliases?
   */ 
  useNames?: boolean;

  /**
   * Global parameters to pass to all queries.
   */
  params?: Record<string, any>;

  /**
   * A function that handles when a raw query is sent to the database.
   */
  query?: (data: D, query: string, parameters?: DatabaseParameters, output?: any) => Promise<DatabaseQueryResult<any, any>>;

  /**
   * A dictionary of procedures for when a proc is called on the database.
   */
  procs?: Record<string, (data: D, parameters?: DatabaseParameters, output?: any) => Promise<DatabaseProcResult<any, any>>>;

  /**
   * A dictionary of functions that return tables.
   */
  funcs?: Record<string, (data: D, params: Record<string, any>) => any>

}

/**
 * Creates a Database for interacting with the given input.
 * 
 * @param db 
 * @param options 
 */
export function createDatabase<D extends RunInput>(db: D, options?: RunDatabaseOptions<D>): Database
{
  const extendParams = (options: RunDatabaseOptions<D>, params?: DatabaseParameters): RunDatabaseOptions<D> => ({
    ...options,
    params: {
      ...(options.params || {}),
      ...(params || {}),
    },
  });

  const handleStream = <R, A>(batchSize: number, result: any[]) => {
    return async (listener: DatabaseStreamListener<R, A>) => {
      const accumulated: A[] = [];
      let batchCount = 0;

      for (let i = 0; i < result.length; i += batchSize) {
        const batch = result.splice(i, Math.min(result.length, i + batchSize));

        for (let batchIndex = 0; batchIndex < batch.length; batchIndex++) {
          const accumulateResult = await listener(batch[batchIndex], batchIndex, batchCount, batch);

          if (accumulateResult !== undefined) {
            accumulated.push(accumulateResult);
          }
        }
      }

      return accumulated;
    };
  };

  const deepCopy = (source: any): any => {
    const map = new Map<any, any>();

    const copier = (source: any): any => {
      const copied = map.get(source);
      if (copied !== undefined) {
        return copied;
      }
      if (source instanceof Date) {
        return new Date(source.getTime());
      }
      if (Array.isArray(source)) {
        const target: any[] = [];
        map.set(source, target);
        for (const item of source) {
          target.push(copier(item));
        }
        return target;
      }
      if (typeof source === 'object') {
        const target: any = {};
        map.set(source, target);
        for (const prop in source) {
          target[prop] = copier(source[prop]);
        }
        return target;
      }

      return source;
    };

    return copier(source);
  };

  const getQueryProvider = (db: D, options: RunDatabaseOptions<D>): DatabaseQueryProvider => ({
    prepare: (initialParams, referenceName) => {
      const compiled = prepare(db, extendParams(options, initialParams));

      return async (expr) => {
        const prepared = compiled(expr);

        return {
          exec: async (params: any) => prepared(params) as any,
          release: async () => {},
        };
      };
    },
    count: (params) => {
      const compiled = exec(db, {
        ...extendParams(options, params),
        affectedCount: true,
      });

      return async (expr) => compiled(expr);
    },
    countTuples: (params) => {
      const compiled = exec(db, {
        ...extendParams(options, params),
        arrayMode: true,
        affectedCount: true,
      });

      return async (expr) => compiled(expr) as any;
    },
    get: (params) => {
      const compiled = exec(db, extendParams(options, params));

      return async (expr) => compiled(expr);
    },
    tuples: (params) => {
      const compiled = exec(db, {
        ...extendParams(options, params),
        arrayMode: true,
      });

      return async (expr) => compiled(expr);
    },
    stream: (batchSize, params) => {
      const compiled = exec(db, extendParams(options, params));

      return (expr) => {
        const result = compiled(expr) as any[];

        return handleStream(batchSize, result);
      };
    },
    streamTuples: (batchSize, params) => {
      const compiled = exec(db, {
        ...extendParams(options, params),
        arrayMode: true,
      });

      return (expr) => {
        const result = compiled(expr) as any[];

        return handleStream(batchSize, result);
      };
    },
  });

  const getResultProvider = (db: D, options: RunDatabaseOptions<D>): DatabaseResultProvider => ({
    ...getQueryProvider(db, options),
    params: (parameters) => {
      return getQueryProvider(db, extendParams(options, parameters));
    },
    proc: (name, parameters, output) => {
      const proc = options.procs?.[name];

      if (!proc){ 
        throw new Error(`The procedure ${name} was not defined in the createDatabase options.`);
      }

      return proc(db, parameters, output);
    },
    query: (query, parameters, output) => {
      if (!options.query) {
        throw new Error(`The query handler was not defined in the createDatabase options.`);
      }

      return options.query(db, query, parameters, output);
    },
  });
  
  return {
    ...getResultProvider(db, options || {}),
    transaction: async (run) => {
      const copy = deepCopy(db);
      const trans = getResultProvider(copy, options || {});

      try {
        const result = await run(trans, () => {
          throw new Error('#ABORT');
        });

        Object.assign(db, copy);

        return result;
      } catch (e) {
        if (e.message !== '#ABORT') {
          throw e;
        }

        return undefined as any;
      }
    },
  };
}

