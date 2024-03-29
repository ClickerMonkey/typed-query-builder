import { Select, ExprKind, ExprScalar, Traverser, Expr, PredicateBinaryListPass, PredicateBinaryListType, isArray, _Boolean } from '../internal';


export class ExprPredicateBinaryList<T> extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.PREDICATE_BINARY_LIST;

  public constructor(
    public type: PredicateBinaryListType,
    public pass: PredicateBinaryListPass,
    public value: ExprScalar<T>,
    public test: ExprScalar<T[]> | ExprScalar<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PREDICATE_BINARY_LIST;
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
      traverse.step('test', () => 
      {
        const test = this.test;
        if (isArray(test)) {
          for (let i = 0; i < test.length; i++) {
            traverse.step(i, test[i], (replace) => test[i] = replace as any);
          }
        } else {
          traverse.step(0, test, (replace) => this.test = replace as any);
        }
      });
    });
  }

}