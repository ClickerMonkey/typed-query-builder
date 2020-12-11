import { Expr, ExprInput } from './Expr';


export class ExprCase<I, O> extends Expr<O> 
{
  
  public static readonly id = 'case';
  
  public constructor(
    public value: Expr<I>, 
    public cases: Array<[Expr<I>, Expr<O>]> = [],
    public otherwise?: Expr<O>
  ) {
    super();
  }

  public else(result: ExprInput<O>): this {
    this.otherwise = Expr.parse(result);

    return this;
  }

}