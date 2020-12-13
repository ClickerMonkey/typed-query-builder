import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';


export class ExprRow<V extends any[]> extends Expr<V>
{

  public static readonly id = 'row';

  public constructor(
    public elements: Expr<any>[]
  ) {
    super(); 
  }

  public getKind(): ExprKind {
    return ExprKind.ROW;
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