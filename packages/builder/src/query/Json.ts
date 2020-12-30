import { ExprKind, Traverser, Expr, ExprScalar, Selects } from '../internal';


export class QueryJson<S extends Selects, V> extends ExprScalar<V> 
{
  
  public static readonly id = ExprKind.JSON;

  public constructor(
    public json: Expr<S> | Expr<S[]> | Expr<V>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.JSON;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('json', this.json, (replace) => this.json = replace as any);
    });
  }
  
}