import { ExprKind, ExprScalar, Traverser, Expr, ExprInput, toExpr } from '../internal';


export class ExprCase<I, O> extends ExprScalar<O> 
{
  
  public static readonly id = ExprKind.CASE;
  
  public constructor(
    public value: ExprScalar<I>, 
    public cases: Array<[ExprScalar<I>, ExprScalar<O>]> = [],
    public otherwise?: ExprScalar<O>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.CASE;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('value', this.value, (replace) => this.value = replace as any);

      traverse.step('cases', () => 
      {
        for (let i = 0; i < this.cases.length; i++) 
        {
          traverse.step(i, () => 
          {
            traverse.step('input', this.cases[i][0], (replace) => this.cases[i][0] = replace as any);
            traverse.step('output', this.cases[i][1], (replace) => this.cases[i][1] = replace as any);
          });
        }
      });

      if (this.otherwise) 
      {
        traverse.step('otherwise', this.otherwise, (replace) => this.otherwise = replace as any, () => this.otherwise = undefined);
      }
    });
  }

  /**
   * Adds another value to compare to the original, and the result to return if true.
   * 
   * @param value The value to compare to.
   * @param result The result to return if the value is equal.
   * @returns This case expression.
   */
  public elseWhen(value: ExprInput<I>, result: ExprInput<O>): this
  {
    const valueResult: [ExprScalar<I>, ExprScalar<O>] = [toExpr(value), toExpr(result)];

    this.cases.push(valueResult);

    return this;    
  }

  /**
   * Sets the expression to return if this case does not have a passing condition.
   * 
   * @param result The default result to return.
   * @returns This case expression.
   */
  public else(result?: ExprInput<O>): this 
  {
    this.otherwise = result === undefined ? undefined : toExpr(result);

    return this;
  }

  public required(): ExprCase<I, Exclude<O, null | undefined>>
  {
    return this as any;
  }

  public optional(): ExprCase<I, O | null | undefined>
  {
    return this as any;
  }

  public nullable(): ExprCase<I, O | null>
  {
    return this as any;
  }

  public undefinable(): ExprCase<I, O | undefined>
  {
    return this as any;
  }

}