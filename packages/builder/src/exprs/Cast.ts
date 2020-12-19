import { DataTypeInputs, DataTypeInputType } from '../DataTypes';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprCast<I extends DataTypeInputs> extends ExprScalar<DataTypeInputType<I>> 
{
  
  public static readonly id = ExprKind.CAST;

  public constructor(
    public type: I,
    public value: ExprScalar<any>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CAST;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}