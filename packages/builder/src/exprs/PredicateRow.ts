import { isArray, ExprScalarTuple, ExprKind, ExprScalar, Traverser, Expr, PredicateRowType, SelectsFromValues, _Boolean } from '../internal';


export class ExprPredicateRow<T extends any[]> extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.PREDICATE_ROW;

  public constructor(
    public type: PredicateRowType,
    public value: Expr<T> | Expr<SelectsFromValues<T>> | ExprScalarTuple<T>,
    public test: Expr<T> | Expr<SelectsFromValues<T>> | ExprScalarTuple<T>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PREDICATE_ROW;
  }

  public isPredicate(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      const { value, test } = this;

      if (isArray(value)) {
        traverse.step('value', () => {
          for (let i = 0; i < value.length; i++) {
            traverse.step('value', value[i], (replace) => value[i] = replace as any);    
          }
        });
      } else {
        traverse.step('value', value, (replace) => this.value = replace as any);
      }

      if (isArray(test)) {
        traverse.step('test', () => {
          for (let i = 0; i < test.length; i++) {
            traverse.step('test', test[i], (replace) => test[i] = replace as any);    
          }
        });
      } else {
        traverse.step('test', test, (replace) => this.test = replace as any);
      }
    });
  }

}