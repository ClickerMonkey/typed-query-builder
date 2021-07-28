import { ExprKind, Traverser, Expr, ExprScalar, OperationBinaryType, _Numbers } from '../internal';


export class ExprOperationBinary extends ExprScalar<_Numbers> 
{
  
  public static readonly id = ExprKind.OPERATION_BINARY;

  public constructor(
    public type: OperationBinaryType,
    public first: ExprScalar<_Numbers>,
    public second: ExprScalar<_Numbers>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.OPERATION_BINARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('first', this.first, (replace) => this.first = replace as any);
      traverse.step('second', this.second, (replace) => this.second = replace as any);
    });
  }

}