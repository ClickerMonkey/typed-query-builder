import { Expr, ExprValueObjects, ExprValueTuples } from '@typed-query-builder/builder';
import { RunTransformers } from './Transformers';
import { RunState, RunInput } from "./State";
import { RunCompiler } from "./Compiler";


/**
 * Options 
 */
export interface RunOptions<P>
{
  /**
   * Named parameters to pass to the query.
   */
  params?: P;

  /**
   * If text comparison should be case insensitive.
   */
  ignoreCase?: boolean;

  /**
   * Use the column/table names instead of the aliases?
   */ 
  useNames?: boolean;

  /**
   * If the affected count should be returned, transforming the result into { affected: number, result: any }.
   */
  affectedCount?: boolean;
  
  /**
   * If any records to be returned should be arrays instead of objects.
   */
  arrayMode?: boolean;
}


export type AffectedResult<R> = { affected: number, result: R };



/**
 * Executes an expression and returns the result.
 * 
 * **Example:**
 * ```ts
 * const result = expr.run( exec(DB) );
 * ```
 * 
 * @param db The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 */
export function exec<P = any>(db: RunInput, options: RunOptions<P> & { affectedCount: true }): <R>(expr: Expr<R>) => AffectedResult<ExprValueObjects<R>>
export function exec<P = any>(db: RunInput, options: RunOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<R>) => AffectedResult<ExprValueTuples<R>>
export function exec<P = any>(db: RunInput, options: RunOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => ExprValueTuples<R>
export function exec<P = any>(db: RunInput, options?: RunOptions<P>): <R>(expr: Expr<R>) => ExprValueObjects<R>
export function exec<P = any>(db: RunInput, options?: RunOptions<P>): <R>(expr: Expr<R>) => any
{
  return <R>(e: Expr<R>) =>
  {
    const compiling = new RunCompiler(RunTransformers.transform);
    const compiled = RunTransformers.transform(e, compiling, !!options?.arrayMode);
    const state = new RunState({ sources: db, params: options?.params, ignoreCase: options?.ignoreCase, useNames: options?.useNames });
    const result = compiled(state);

    return options?.affectedCount
      ? { affected: state.affected, result }
      : result;
  };
}



/**
 * A prepared query that can be executed multiple times. It MUST be released, ideally in a try-finally block.
 */
export type PreparedQuery<R, P = any> = (params?: P) => R;

/**
 * Creates a prepared statement for the given expression. This is useful when you need to invoke the same query over and over
 * with different parameters. A prepared statement MUST be released, ideally in a try-finally block.
 * 
 * **Example:**
 * ```ts
 * const prepared = expr.run( prepare(DB) );
 * 
 * try {
 *  prepared.exec({ id: 12 });
 *  prepared.exec({ id: 34 });
 * } finally {
 *  await prepared.release();
 * }
 * ```
 * 
 * @param access The connection, transaction, or prepared statement to stream the expression results from.
 * @param options Options that control how the query is built or the results returned.
 * @returns An object that can be executed multiple times, once finished it must be released.
 */
export function prepare<P = any>(db: RunInput, options: RunOptions<P> & { affectedCount: true }): <R>(expr: Expr<any>) => PreparedQuery<AffectedResult<ExprValueObjects<R>>, P>
export function prepare<P = any>(db: RunInput, options: RunOptions<P> & { affectedCount: true, arrayMode: true }): <R>(expr: Expr<any>) => PreparedQuery<AffectedResult<ExprValueTuples<R>>, P>
export function prepare<P = any>(db: RunInput, options: RunOptions<P> & { arrayMode: true }): <R>(expr: Expr<R>) => PreparedQuery<ExprValueTuples<R>, P>
export function prepare<P = any>(db: RunInput, options?: RunOptions<P>): <R>(expr: Expr<R>) => PreparedQuery<ExprValueObjects<R>, P>
export function prepare<P = any>(db: RunInput, options?: RunOptions<P>): <R>(expr: Expr<R>) => PreparedQuery<any, P>
{
  return <R>(e: Expr<R>) =>
  {
    const compiling = new RunCompiler(RunTransformers.transform);
    const compiled = RunTransformers.transform(e, compiling, !!options?.arrayMode);
    const optionsParams = options?.params || {};
    
    return (params): any =>
    { 
      const state = new RunState({ sources: db, params: { ...optionsParams, ...(params || {})}, ignoreCase: options?.ignoreCase, useNames: options?.useNames });
      const result = compiled(state);

      return options?.affectedCount
        ? { affected: state.affected, result }
        : result;
    };
  };
}