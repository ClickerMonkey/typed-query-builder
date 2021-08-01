import { ExprKind, ExprScalar, Traverser, Expr, PredicateBinaryType, _Boolean } from '../internal';


export class ExprPredicateBinary<T> extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.PREDICATE_BINARY;

  public constructor(
    public type: PredicateBinaryType,
    public value: ExprScalar<T>,
    public test: ExprScalar<T>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PREDICATE_BINARY;
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
      traverse.step('test', this.test, (replace) => this.test = replace as any);
    });
  }

}