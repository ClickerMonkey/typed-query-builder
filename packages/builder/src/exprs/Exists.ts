import { ExprKind } from '../Kind';
import { Select } from '../select';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprExists extends ExprScalar<boolean> 
{
  
  public static readonly id = 'exists';

  public constructor(
    public value: Expr<[Select<any, 1 | null>]> | Expr<1 | null>,
    public not: boolean = false
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.EXISTS;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}