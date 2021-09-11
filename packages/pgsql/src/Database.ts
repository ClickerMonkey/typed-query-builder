import { Pool, Client } from 'pg';
import { Database, DatabaseQueryProvider, DatabaseParameters, DatabaseResultProvider } from '@typed-query-builder/builder';
import { prepare, exec, stream, execMany } from './index';
import { loadTypes } from './types';


export interface PgsqlDatabaseOptions
{

  /**
   * Named parameters to pass to the query.
   */
   params?: DatabaseParameters;

   /**
    * If errors should be thrown when building the SQL when an unsupported feature is being used.
    */
   throwError?: boolean;
 
   /**
    * If constants should avoided being passed in SQL string and passed as parameters instead.
    */
   constantsAsParams?: boolean;
 
   /**
    * If the SQL string generated should remove redudant table/source references to columns that are unique in their context.
    */
   simplifyReferences?: boolean;
 
   /**
    * If the raw expression should be executed, otherwise if it's not a SELECT, INSERT, DELETE, or UPDATE it will be wrapped as a SELECT.
    */
   raw?: boolean;
 
   /**
    * When calling stream, if the stream should take pauses between batch sizes to process a batch at once.
    */
   streamBatchSize?: number;
 
   /**
    * If true all strings in results will be inspected for JSON values and be automatically parsed.
    */
   detectJson?: boolean;

   /**
    * Don't bother parsing any results, I don't care!
    */
   ignoreResults?: boolean;

}

/**
 * Creates a Database for interacting with the given input.
 * 
 * @param db 
 * @param options 
 */
export function createDatabase(db: Pool | Client, options?: PgsqlDatabaseOptions): Database
{
  const extendParams = (options: PgsqlDatabaseOptions, params?: DatabaseParameters): PgsqlDatabaseOptions => ({
    ...options,
    params: {
      ...(options.params || {}),
      ...(params || {}),
    },
  });

  const getQueryProvider = (db: Pool | Client, options: PgsqlDatabaseOptions): DatabaseQueryProvider => ({
    prepare: (initialParams, preparedName) => {
      const finalOptions = extendParams(options, initialParams);
    
      return prepare(db, { ...finalOptions, preparedName }) as any;
    },
    count: (params) => {
      const finalOptions = extendParams(options, params);

      return exec(db, { ...finalOptions, affectedCount: true });
    },
    countMany: (params) => {
      const finalOptions = extendParams(options, params);

      return execMany(db, { ...finalOptions, affectedCount: true });
    },
    countTuples: (params) => {
      const finalOptions = extendParams(options, params);

      return exec(db, { ...finalOptions, arrayMode: true, affectedCount: true });
    },
    get: (params) => {
      return exec(db, extendParams(options, params));
    },
    many: (params) => {
      return execMany(db, extendParams(options, params));
    },
    tuples: (params) => {
      const finalOptions = extendParams(options, params);

      return exec(db, { ...finalOptions, arrayMode: true });
    },
    stream: (batchSize, params) => {
      const finalOptions = {
        ...extendParams(options, params),
        batchSize,
      };

      return stream(db, finalOptions);
    },
    streamTuples: (batchSize, params) => {
      const finalOptions = {
        ...extendParams(options, params),
        batchSize,
      };

      return stream(db, { ...finalOptions, arrayMode: true });
    },
    run: (params) => {
      const finalOptions = extendParams(options, params);
      const many = execMany(db, { ...finalOptions, ignoreResults: true });

      return (exprs) => many(...exprs);
    },
  });

  const getResultProvider = (db: Pool | Client, options: PgsqlDatabaseOptions): DatabaseResultProvider => ({
    ...getQueryProvider(db, options),
    params: (parameters) => {
      return getQueryProvider(db, extendParams(options, parameters));
    },
    proc: async (name, parameters, output) => {
      const sql =`CALL ${name}(${Object.values(parameters || {}).join(', ')})`;
      const result = await db.query(sql);

      return {
        value: result.rows[0],
        result: result.rows as any,
        output: {} as any,
      };
    },
    query: async (query, parameters, output) => {
      const result = await db.query({
        text: query,
        values: Object.values(parameters || {}),
      });

      return {
        result: result.rows as any,
        output: {} as any,
        affected: result.rowCount,
      };
    },
  });

  const resultProvider = getResultProvider(db, options || {});
  
  return {
    ...resultProvider,
    initialize: async () => {
      await loadTypes(db);
    },
    transaction: async (run) => {
      try {
        await db.query('BEGIN');

        const result = await run(resultProvider, () => {
          throw new Error('#ABORT');
        });

        await db.query('COMMIT');

        return result;
      } catch (e) {
        await db.query('ROLLBACK')

        if (e.message !== '#ABORT') {
          throw e;
        }

        return undefined as any;
      }
    },
  };
}

