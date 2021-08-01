import { ExprKind, Traverser, Expr, ExprScalar, _Boolean } from '../internal';


export class ExprNot extends ExprScalar<_Boolean> 
{
  
  public static readonly id = ExprKind.NOT;

  public constructor(
    public predicate: ExprScalar<_Boolean>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.NOT;
  }

  public isPredicate(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  {
    return traverse.enter(this, () => 
    {
      traverse.step('predicate', this.predicate, (replace) => this.predicate = replace as any);
    });
  }
  
}