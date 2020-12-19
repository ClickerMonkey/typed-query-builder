import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';
import { ExprInput, ExprScalar } from './Scalar';


export class ExprCase<I, O> extends ExprScalar<O> 
{
  
  public static readonly id = ExprKind.CASE;
  
  public constructor(
    public value: ExprScalar<I>, 
    public cases: Array<[ExprScalar<I>, ExprScalar<O>]> = [],
    public otherwise?: ExprScalar<O>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CASE;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('value', this.value, (replace) => this.value = replace as any);
      traverse.step('cases', () => {
        for (let i = 0; i < this.cases.length; i++) {
          traverse.step(i, () => {
            traverse.step('input', this.cases[i][0], (replace) => this.cases[i][0] = replace as any);
            traverse.step('output', this.cases[i][1], (replace) => this.cases[i][1] = replace as any);
          });
        }
      });
      if (this.otherwise) {
        traverse.step('otherwise', this.otherwise, (replace) => this.otherwise = replace as any, () => this.otherwise = undefined);
      }
    });
  }

  public else(result: ExprInput<O>): this {
    this.otherwise = ExprScalar.parse(result);

    return this;
  }

}