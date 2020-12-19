import { ExprKind, Traverser, Expr, ExprScalar, OperationBinaryType } from '../internal';


export class ExprOperationBinary extends ExprScalar<number> 
{
  
  public static readonly id = ExprKind.OPERATION_BINARY;

  public constructor(
    public type: OperationBinaryType,
    public first: ExprScalar<number>,
    public second: ExprScalar<number>
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