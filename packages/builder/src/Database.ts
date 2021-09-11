import { Tuple } from '.';
import { Expr, ExprValueObjects, ExprValueTuples, DataTypeInputs, DataTypeInputType } from './internal';

/**
 * Get the result of an expression and the number of records that were affected by it.
 */
export interface DatabaseAffected<R>
{
  affected: number;
  result: R;
}

/**
 * The result passed to a stream listener.
 */
export type DatabaseStreamListenerResult<R> = R extends Array<infer E> ? E : R;

/**
 * A listener to results.
 */
export type DatabaseStreamListener<R, A> = (result: DatabaseStreamListenerResult<R>, batchIndex: number, batchCount: number, batch: DatabaseStreamListenerResult<R>[]) => A | Promise<A>;

/**
 * A handler that triggers the query and each result is passed to the listener.
 */
export type DatabaseStreamHandler<R> = <A>(listener: DatabaseStreamListener<R, A>) => Promise<A[]>;
 
/**
 * Parameters that can be passed when executing queries, prepared statements, or stored procedures.
 */
export type DatabaseParameters = Record<string, any>;

/**
 * A dictionary with parameter names and their data types as values.
 */
export type DatabaseTypeMap = Record<string, DataTypeInputs>;

/**
* A prepared statement for a database. Needs to be released in a try-finally.
*/
export interface DatabasePrepared<R, P extends DatabaseParameters>
{
  /**
   * Execute the prepared statement with the given parameters.
   */
  exec(params: Partial<P>): Promise<R>;

  /**
   * Release must be called after the prepared statement is no longer needed.
   */
  release(): Promise<void>;
}

/**
 * Results of a stored procedure execution. 
 */
 export interface DatabaseProcResult<R, O extends DatabaseTypeMap>
 {
   value: any;
   result: R;
   output: { [K in keyof O]: DataTypeInputType<O[K]> };
 }
 
/**
 * Results of a raw execution. 
 */
export interface DatabaseQueryResult<R, O extends DatabaseTypeMap>
{
  result: R;
  output: { [K in keyof O]: DataTypeInputType<O[K]> };
  affected: number;
}
 

/**
 * Provides resolves to pass to Expr.run to process an expression and return results.
 */
export interface DatabaseQueryProvider
{

  /**
   * Gets a prepared query designed for executing the same query many times but with different parameters.
   * 
   * @param initialParams Default parameters to send to the query if they aren't specified in a given call.
   * @param referenceName A name for the prepared statement. Some implementations may perform better with this specified.
   * @returns A function to be passed to Expr.run to return a promise of a prepared statement.
   */
  prepare<P extends DatabaseParameters>(initialParams?: Partial<P>, referenceName?: string): <R>(expr: Expr<R>) => Promise<DatabasePrepared<R, P>>;

  /**
   * Executes the query and returns the number of affected rows with the results.
   * 
   * @param params The parameter values in the query, if any.
   * @returns A function to be passed to Expr.run to return a promise of results and the number of affected records.
   */
  count<P extends DatabaseParameters>(params?: P): <R>(expr: Expr<R>) => Promise<DatabaseAffected<ExprValueObjects<R>>>;

  /**
   * Executes the query and returns the number of affected rows with the results.
   * 
   * @param params The parameter values in the query, if any.
   * @returns A function to be passed to Expr.run to return a promise of results and the number of affected records.
   */
  countMany<P extends DatabaseParameters>(params?: P): <E extends Tuple<Expr<any>>>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? DatabaseAffected<ExprValueObjects<R>> : unknown }>;

  /**
   * Executes the query and returns the number of affected rows with the results as tuples.
   * 
   * @param params The parameter values in the query, if any.
   * @returns A function to be passed to Expr.run to return a promise of results and the number of affected records.
   */
  countTuples<P extends DatabaseParameters>(params?: P): <R>(expr: Expr<R>) => Promise<DatabaseAffected<ExprValueTuples<R>>>;

  /**
   * Executes the query and returns the results.
   * 
   * @param params The parameter values in the query, if any.
   * @returns A function to be passed to Expr.run to return a promise of results.
   */
  get<P extends DatabaseParameters>(params?: P): <R>(expr: Expr<R>) => Promise<ExprValueObjects<R>>;

   /**
    * Executes multiple queries and returns the results.
    * 
    * @param params The parameter values in the query, if any.
    * @returns A function to be passed to Expr.run to return a promise of results.
    */
  many<P extends DatabaseParameters>(params?: P): <E extends Tuple<Expr<any>>>(...exprs: E) => Promise<{ [I in keyof E]: E[I] extends Expr<infer R> ? ExprValueObjects<R> : unknown }>;

  /**
   * Executes the query and returns the results as tuples.
   * 
   * @param params The parameter values in the query, if any.
   * @returns A function to be passed to Expr.run to return a promise of results.
   */
  tuples<P extends DatabaseParameters>(params?: P): <R>(expr: Expr<R>) => Promise<ExprValueTuples<R>>;

  /**
   * Executes the query and returns a stream handler to handle large sets of results.
   * 
   * @param params The parameter values in the query, if any.
   * @param batchSize The size of the batches of results.
   * @returns A function to be passed to Expr.run to generate a stream handler.
   */
  stream<P extends DatabaseParameters>(batchSize: number, params?: P): <R>(expr: Expr<R>) => DatabaseStreamHandler<ExprValueObjects<R>>;

  /**
   * Executes the query and returns a stream handler to handle large sets of results as tuples.
   * 
   * @param params The parameter values in the query, if any.
   * @param batchSize The size of the batches of results.
   * @returns A function to be passed to Expr.run to generate a stream handler.
   */ 
  streamTuples<P extends DatabaseParameters>(batchSize: number, params?: P): <R>(expr: Expr<R>) => DatabaseStreamHandler<ExprValueTuples<R>>;

  /**
   * Runs one or more queries.
   * 
   * @param params The parameter values in the queries, if any.
   * @returns A function to be passed the expressions to run.
   */
  run<P extends DatabaseParameters>(params?: P): (exprs: Expr<any>[]) => Promise<void>;

}

/**
 * Provides resolves to pass to Expr.run to process an expression and return results.
 */
export interface DatabaseResultProvider extends DatabaseQueryProvider
{

  /**
   * Gets a query provider that uses the given parameters for all subsequent calls.
   * 
   * @param parameters The parameters to pass to each query called on the returned provider.
   */
  params(parameters: DatabaseParameters): DatabaseQueryProvider;

  /**
   * Executes a stored procedure with the given name and parameters and returns the results.
   * 
   * @param procedure The name of the stored procedure.
   * @param parameters The parameter values to send to the stored procedure.
   * @param output The output parameters and their data types.
   * @returns The results of the stored procedure.
   */
  proc<T, O extends DatabaseTypeMap = {}>(procedure: string, parameters?: DatabaseParameters, output?: O): Promise<DatabaseProcResult<T, O>>;

  /**
   * Runs a raw query optionally with parameters and output.
   * 
   * @param query The query to run.
   * @param parameters The parameter values in the query.
   * @param output The output parameters and their data types.
   * @returns The results of the query.
   */
  query<T, O extends DatabaseTypeMap = {}>(query: string, parameters?: DatabaseParameters, output?: O): Promise<DatabaseQueryResult<T, O>>;

}
 
/**
 * An extensible list of transaction modes.
 */
export interface DatabaseTransactionModes
{ 
  READ_UNCOMMITTED: never;
  READ_COMMITTED: never;
  REPEATABLE_READ: never;
  SERIALIZABLE: never;
  SNAPSHOT: never;
}

/**
 * A database provides query resolvers and a way to do transactions. 
 */
export interface Database extends DatabaseResultProvider
{
  
  /**
   * Starts a transaction and commits it if no errors occur while running. If an
   * error is caught during the transaction it is rolled back and the error is passed
   * off onto the caller of this function.
   * 
   * @param run Execute logic in transaction using provided resolvers.
   * @returns The value returned by `run`.
   */
  transaction<T>(run: (provider: DatabaseResultProvider, abort: () => any) => Promise<T>, mode?: keyof DatabaseTransactionModes): Promise<T>;

  /**
   * Initializes the database. This should be done once before any querying is done.
   */
  initialize(): Promise<void>;
  
}
