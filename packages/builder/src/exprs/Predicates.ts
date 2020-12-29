import { ExprKind, ExprScalar, Traverser, Expr, PredicatesType } from '../internal';


export class ExprPredicates extends ExprScalar<boolean> 
{
  
  public static readonly id = ExprKind.PREDICATES;

  public constructor(
    public type: PredicatesType,
    public predicates: ExprScalar<boolean>[]
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PREDICATES;
  }

  public isPredicate(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('predicates', () => {
        for (let i = 0; i < this.predicates.length; i++) {
          traverse.step(i, this.predicates[i], (replace) => this.predicates[i] = replace as any);
        }
      });
    });
  }

}