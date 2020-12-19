import { ExprScalar } from './Scalar';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';


export class ExprNot extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.NOT;

  public constructor(
    public value: ExprScalar<boolean>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.NOT;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }
  
}