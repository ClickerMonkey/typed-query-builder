import { ExprKind, ExprScalar, Traverser, Expr, ConditionUnaryType } from '../internal';


export class ExprConditionUnary extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.CONDITION_UNARY;

  public constructor(
    public type: ConditionUnaryType,
    public value: ExprScalar<any>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONDITION_UNARY;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}