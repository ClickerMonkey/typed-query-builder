import { ExprKind, ExprScalar, Traverser, Expr, PredicateUnaryType, _Boolean } from '../internal';


export class ExprPredicateUnary extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.PREDICATE_UNARY;

  public constructor(
    public type: PredicateUnaryType,
    public value: ExprScalar<any>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PREDICATE_UNARY;
  }

  public isPredicate(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
    });
  }

}