import { ExprKind, ExprScalar, Traverser, Expr, Select } from '../internal';


export class ExprExists extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.EXISTS;

  public constructor(
    public value: Expr<[Select<any, 1 | null>]> | Expr<1 | null>,
    public not: boolean = false
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.EXISTS;
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