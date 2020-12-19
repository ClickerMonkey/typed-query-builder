import { ExprKind, ExprScalar, Traverser, Expr, DataTypeInputs, DataTypeInputType } from '../internal';


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