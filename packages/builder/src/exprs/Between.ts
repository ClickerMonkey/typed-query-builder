 import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprBetween<T> extends ExprScalar<boolean> 
{
  
  public static readonly id = 'between';

  public constructor(
    public value: ExprScalar<T>,
    public low: ExprScalar<T>,
    public high: ExprScalar<T>,
    public not: boolean = false,
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.BETWEEN;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
      traverse.step('low', this.low, (replace) => this.low = replace as any);
      traverse.step('high', this.high, (replace) => this.high = replace as any);
    });
  }

}