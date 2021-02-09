import { Expr, ExprNull, isFunction, isNumber, isObject } from '@typed-query-builder/builder';
import { RunTransformerFunction, RunTransformerTransformer } from './Transformers';



/**
 * A expression thats been compiled (given an id and transform function).
 */
export interface RunExpr<T>
{
  expr: Expr<T>;
  id: number;
  get: RunTransformerFunction<T>;
  select?: string;
}


export const RunExprNoop: RunExpr<any> = 
{
  expr: new ExprNull(),
  id: -1,
  get: () => undefined,
};


export function isRunExpr<T>(x: any): x is RunExpr<T>
{
  return isObject(x) && x.expr instanceof Expr && isFunction(x.get) && isNumber(x.id);
}

export class RunCompiler 
{

  public exprs: RunExpr<any>[] = [];

  public transform: RunTransformerTransformer;

  public constructor(transform: RunTransformerTransformer) 
  {
    this.transform = transform;
  }

  public eval<T>(expr: Expr<T>, select?: string, tuples: boolean = false): RunExpr<T> 
  {
    const { exprs, transform } = this;
    let found = exprs.find(e => e.expr === expr);

    if (!found) 
    {
      found = {
        expr,
        id: exprs.length,
        get: () => {},
        select,
      };

      exprs.push(found);

      found.get = transform(expr, this, tuples);
    }
    else if (select && !found.select)
    {
      found.select = select;
    }

    return found;
  }

}
