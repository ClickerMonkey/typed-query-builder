import { ExprKind, Traverser, Expr, ExprScalar, OperationUnaryType, _Numbers } from '../internal';


export class ExprOperationUnary extends ExprScalar<_Numbers> 
{
  
  public static readonly id = ExprKind.OPERATION_UNARY;
  
  public constructor(
    public type: OperationUnaryType,
    public value: ExprScalar<_Numbers>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.OPERATION_UNARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}