import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { ConditionsType } from '../Types';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprConditions extends ExprScalar<boolean> 
{
  
  public static readonly id = '&|';

  public constructor(
    public type: ConditionsType,
    public conditions: ExprScalar<boolean>[]
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONDITIONS;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('conditions', () => {
        for (let i = 0; i < this.conditions.length; i++) {
          traverse.step(i, this.conditions[i], (replace) => this.conditions[i] = replace as any);
        }
      });
    });
  }

}