import { isArray, ExprKind, Traverser, Expr, ExprScalar, Select, _Boolean } from '../internal';


export class ExprIn<T> extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.IN;

  public constructor(
    public value: ExprScalar<T>,
    public list: ExprScalar<T[]> | ExprScalar<T>[] | Expr<T[]> | Expr<[Select<any, T>][]>,
    public not: boolean = false
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.IN;
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
      traverse.step('list', () => 
      {
        const list = this.list;

        if (isArray(list)) 
        {
          for (let i = 0; i < list.length; i++) 
          {
            traverse.step(i, list[i], (replace) => list[i] = replace as any);
          }
        } 
        else 
        {
          traverse.step(0, list, (replace) => this.list = replace as any);
        }
      });
    });
  }
  
}