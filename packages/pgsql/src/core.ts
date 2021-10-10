import { ExprValueTuples, Expr, ExprValueObjects, QueryFirst, QueryFirstValue, QueryList, QueryJson, isArray, isString, isPlainObject } from '@typed-query-builder/builder';
import { DialectPgsql } from '@typed-query-builder/sql-pgsql';
import { Client, Pool, QueryConfig, QueryArrayConfig, QueryResult, PoolClient } from 'pg';
import Cursor from 'pg-cursor';



export type PgsqlConnection = Client | Pool | PoolClient;

/**
 * Options 
 */
export interface PgsqlOptions<P>
{

  /**
   * Named parameters to pass to the query.
   */
  params?: P;

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
  batchSize?: number;

  /**
   * If true all strings in results will be inspected for JSON values and be automatically parsed.
   */
  detectJson?: boolean;

  /**
   * If the affected count should be returned, transforming the result into { affected: number, result: any }.
   */
  affectedCount?: boolean;
  
  /**
   * If any records to be returned should be arrays instead of objects.
   */
  arrayMode?: boolean;

  /**
   * The name for the prepared statement. If not given, one will be generated.
   */
  preparedName?: string;

  /**
   * Don't bother parsing any results, I don't care!
   */
  ignoreResults?: boolean;

}


export type AffectedResult<R> = { affected: number, result: R };

/**
 * Executes an expression and returns the result.
 * 
 * **Example:**
 * ```ts
 * const result = await expr.run( exec(conn) );
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 */
export function exec<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<R>) => Promise<AffectedResult<ExprValueTuples<R>>>
export function exec<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true }): <R>(expr: Expr<R>) => Promise<AffectedResult<ExprValueObjects<R>>>
export function exec<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => Promise<ExprValueTuples<R>>
export function exec<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => Promise<ExprValueObjects<R>>
export function exec<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => Promise<any>
{
  return async <R>(e: Expr<R>) =>
  {
    const outputFactory = DialectPgsql.output(options);
    const output = outputFactory(e);

    const query: QueryConfig | QueryArrayConfig = {
      text: output.query,
      values: options?.params ? output.getParams(options.params) : undefined,
      rowMode: options?.arrayMode ? 'array' : undefined,
    };
    
    try
    {
      const results = await access.query<ExprValueObjects<R>>(query);

      return parseResult(e, results, options);
    }
    catch (ex)
    {
      throw new Error(ex + '\n\nQuery: ' + output.query);
    }
  };
}


/**
 * Executes an expression and returns the result.
 * 
 * **Example:**
 * ```ts
 * const result = await expr.run( exec(conn) );
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 */
 export function execMany<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true, arrayMode: true }): <E extends Expr<any>[]>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? AffectedResult<ExprValueTuples<R>> : unknown }>
 export function execMany<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true }): <E extends Expr<any>[]>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? AffectedResult<ExprValueObjects<R>> : unknown }>
 export function execMany<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { arrayMode: true }): <E extends Expr<any>[]>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? ExprValueTuples<R> : unknown }>
 export function execMany<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { ignoreResults: true }): <E extends Expr<any>[]>(...exprs: E) => Promise<void>
 export function execMany<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <E extends Expr<any>[]>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? ExprValueObjects<R> : unknown }>
 export function execMany<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <E extends Expr<any>[]>(...exprs: E) => Promise<any>
 {
   return async <E extends Expr<any>[]>(...exprs: E) =>
   {
     const outputFactory = DialectPgsql.output(options);
     const outputs = exprs.map(outputFactory);

     return await Promise.all(outputs.map(output => {
      const query: QueryConfig | QueryArrayConfig = {
        text: output.query,
        values: output.getParams(options?.params),
        rowMode: options?.arrayMode ? 'array' : undefined,
      };

      return access.query(query)
        .then(results => parseResult(output.expr, results, options))
        .catch(ex => new Error(ex + '\n\nQuery: ' + output.query))
     }));
   };
 }

/**
 * The result passed to a stream listener.
 */
export type StreamListenerResult<R> = R extends Array<infer E> ? E : R;

/**
 * A listener to results.
 */
export type StreamListener<R, A> = (result: StreamListenerResult<R>, batchIndex: number, batchCount: number, batch: StreamListenerResult<R>[]) => A | Promise<A>;

/**
 * A handler that triggers the query and each result is passed to the listener.
 */
export type StreamHandler<R> = <A>(listener: StreamListener<R, A>) => Promise<A[]>;

/**
 * Generates a way to stream the results of a query for the processing of large datasets.
 * When batch size is given > 1, the given number are collected in memory and once that size is 
 * reached or there are no more results the request is paused to avoid memory exhaustion and calls 
 * the function in quick succession with all collected results.
 * 
 * **Example:**
 * ```ts
 * const streamer = expr.run( stream(conn, { streamBatchSize: 100 }) );
 * 
 * const accumulated = await streamer(async (record) => {
 *  // handle record, can be async, can return a value to be returned in accumulated array
 * });
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 * @returns A function which when invoked with another function will execute the expression and for each result returned will call the given function.
 */
export function stream<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => StreamHandler<ExprValueTuples<R>>
export function stream<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => StreamHandler<ExprValueObjects<R>>
export function stream<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => StreamHandler<any>
{
  return <R>(e: Expr<R>) =>
  {
    return async (listener: StreamListener<any, any>) =>
    {
      const batchSize = options?.batchSize || 1;
      
      const outputFactory = DialectPgsql.output(options);
      const output = outputFactory(e);
      
      const params = options?.params ? output.getParams(options.params) : [];
      const cursor = new Cursor(output.query, params, {
        rowMode: options?.arrayMode ? 'array' : undefined,
      });

      try
      {
        const batcher = access.query(cursor);

        const accumulated: any[] = [];
        let batchCount = 0;

        const processBatch = async (batch: any[]) =>
        {
          for (let batchIndex = 0; batchIndex < batch.length; batchIndex++)
          {
            const accumulateResult = await listener(batch[batchIndex], batchIndex, batchCount, batch);
            
            if (accumulateResult !== undefined)
            {
              accumulated.push(accumulateResult);
            }
          }

          batchCount++;
        };

        return new Promise((resolve, reject) => 
        {
          const readBatch = () => 
          {
            batcher.read(batchSize, async (err, rows, result) => {
              if (err) {
                return reject(err);
              }

              if (rows.length === 0) {
                resolve(accumulated);
              } else {
                const parsedRows = parseResult(e, result, options);

                await processBatch(parsedRows);

                readBatch();
              }
            });
          };

          readBatch();
        });
      }
      catch (e)
      {
        throw new Error(e + '\n\nQuery: ' + output.query);
      }
    };
  };
}



/**
 * A prepared query that can be executed multiple times. It MUST be released, ideally in a try-finally block.
 */
export interface PreparedQuery<R, P = any>
{
  exec(params: P): Promise<R>;
  release(): Promise<void>;
}

/**
 * Creates a prepared statement for the given expression. This is useful when you need to invoke the same query over and over
 * with different parameters. A prepared statement MUST be released, ideally in a try-finally block.
 * 
 * **Example:**
 * ```ts
 * const prepared = expr.run( prepare(conn) );
 * 
 * try {
 *  await prepared.exec({ id: 12 });
 *  await prepared.exec({ id: 34 });
 * } finally {
 *  await prepared.release();
 * }
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 * @returns An object that can be executed multiple times, once finished it must be released.
 */
export function prepare<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true }): <R>(expr: Expr<any>) => Promise<PreparedQuery<AffectedResult<ExprValueObjects<R>>, P>>
export function prepare<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<any>) => Promise<PreparedQuery<AffectedResult<ExprValueTuples<R>>, P>>
export function prepare<P = any>(access: PgsqlConnection, options: PgsqlOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => Promise<PreparedQuery<ExprValueTuples<R>, P>>
export function prepare<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<ExprValueObjects<R>, P>>
export function prepare<P = any>(access: PgsqlConnection, options?: PgsqlOptions<P>): <R>(expr: Expr<R>) => Promise<PreparedQuery<any, P>>
{
  return async <R>(e: Expr<R>) =>
  {
    const outputFactory = DialectPgsql.output(options);
    const output = outputFactory(e);
    const defaults: Partial<P> = {};

    for (const paramName in output.paramIndices) 
    {
      const paramIndex = output.paramIndices[paramName];
      const paramValue = output.params[paramIndex];

      defaults[paramName] = paramValue;
    }

    let preparedName = options?.preparedName || '';

    if (!preparedName)
    {
      const N = output.query.length - 1;
      const L = Math.min(32, N);
      const J = N / L;

      for (let i = 1; i <= L; i++) 
      {
        const d = Math.min(N, Math.floor(i * J));
        preparedName += output.query.charAt(d);
      }
    }

    const preparedQuery: PreparedQuery<any, P> = 
    {
      async exec(params): Promise<any> 
      { 
        const query: QueryConfig | QueryArrayConfig = {
          name: preparedName,
          text: output.query,
          rowMode: options?.arrayMode ? 'array' : undefined,
          values: output.getParams({
            ...defaults,
            ...(options?.params || {}),
            ...(params || {})
          }),
        };

        const result = await access.query<ExprValueObjects<R>>(query);

        return parseResult(e, result, options);
      },
      async release(): Promise<void> 
      {
        
      },
    };

    return preparedQuery;
  };
}

export function parseResult<R, P>(expr: Expr<R>, queryResult: QueryResult<ExprValueObjects<R>>, options?: PgsqlOptions<P>)
{
  if (options?.ignoreResults)
  {
    return;
  }

  let result = DialectPgsql.getResult(expr, handleResult(expr, queryResult));

  if (options && options.detectJson)
  {
    const traverse = (value: any, onValue: (value: any) => any) => 
    {
      value = onValue(value);

      if (isArray(value)) 
      {
        for (let i = 0; i < value.length; i++) 
        {
          value[i] = traverse(value[i], onValue);
        }
      } 
      else if (isPlainObject(value)) 
      {
        for (const prop in value) 
        {
          value[prop] = traverse(value[prop], onValue);
        }
      }

      return value;
    };

    if (options.detectJson)
    {
      result = traverse(result, (value) => 
      {
        if (isString(value) && value.match(/^({|true$|false$|\[|null$|[+-]?\d|")/)) 
        {
          try {
            return JSON.parse(value);
          } catch (e) {}
        }

        return value;
      });
    }
  }

  return options?.affectedCount
    ? { affected: queryResult.rowCount, result }
    : result;
}

export function handleResult<R, P>(expr: Expr<R>, result: QueryResult<ExprValueObjects<R>>, resultIndex: number = 0): any
{
  if (expr instanceof QueryFirst)
  {
    return result.rows[resultIndex] || null;
  }

  if (expr instanceof QueryFirstValue)
  {
    for (const prop in result.rows[resultIndex])
    {
      return result.rows[resultIndex][prop];
    }
  }

  if (expr instanceof QueryList)
  {
    return result.rows.map( r => (r as any).item );
  }

  if (expr instanceof QueryJson)
  {
    return result.rows[resultIndex];
  }

  return result.rows;
}
