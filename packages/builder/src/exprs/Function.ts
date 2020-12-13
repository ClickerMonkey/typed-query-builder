import { FunctionArgumentValues, FunctionResult, Functions } from '../Functions';
import { ExprKind } from '../Kind';
import { Traverser } from '../Traverser';
import { Expr } from './Expr';
import { ExprScalar } from './Scalar';


export class ExprFunction<F extends keyof Functions> extends ExprScalar<FunctionResult<F>> 
{
  
  public static readonly id = 'f';

  public constructor(
    public func: F,
    public args: FunctionArgumentValues<F>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.FUNCTION;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R {
    return traverse.enter(this, () => {
      traverse.step('args', () => {
        for (let i = 0; i < this.args.length; i++) {
          traverse.step(i, this.args[i], (replace) => this.args[i] = replace as any);
        }
      });
    });
  }
  
  public isSimple(): boolean {
    return true;
  }

}