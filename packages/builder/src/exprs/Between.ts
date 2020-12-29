import { ExprKind, ExprScalar, Traverser, Expr } from '../internal';


export class ExprBetween<T> extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.BETWEEN;

  public constructor(
    public value: ExprScalar<T>,
    public low: ExprScalar<T>,
    public high: ExprScalar<T>,
    public not: boolean = false,
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.BETWEEN;
  }

  public isPredicate(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
      traverse.step('low', this.low, (replace) => this.low = replace as any);
      traverse.step('high', this.high, (replace) => this.high = replace as any);
    });
  }

}