import { isArray, ExprInputTuple, ExprPredicateRow, SelectsFromValues, ExprScalar, PredicateRowType, ExprKind, Traverser, Expr, toExpr } from '../internal';


export class ExprRow<V extends any[]> extends Expr<V>
{

  public static readonly id = ExprKind.ROW;

  public constructor(
    public elements: Expr<any>[]
  ) {
    super(); 
  }

  public getKind(): ExprKind {
    return ExprKind.ROW;
  }

  public is(type: PredicateRowType, row: Expr<V> | Expr<SelectsFromValues<V>> | ExprInputTuple<V>): ExprScalar<boolean> {
    return new ExprPredicateRow<V>(type, this, isArray(row) ? row.map( toExpr ) : row as any);
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('elements', () => {
        for (let i = 0; i < this.elements.length; i++) {
          traverse.step(i, this.elements[i], (replace) => this.elements[i] = replace as any);
        }
      });
    });
  }

}