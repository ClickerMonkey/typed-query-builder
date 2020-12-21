import {
  FunctionArgumentInputs, FunctionArgumentValues, FunctionProxy, FunctionResult, Functions, ExprKind, Traverser,
  Expr, ExprScalar
} from '../internal';


export class ExprFunction<F extends keyof Funcs, Funcs = Functions> extends ExprScalar<FunctionResult<F, Funcs>> 
{
  
  public static createProxy<Funcs>(): FunctionProxy<Funcs> {
    return new Proxy({}, {
      get: <K extends keyof Funcs>(target: {}, func: K, reciever: any) => {
        return (...args: FunctionArgumentInputs<K, Funcs>): ExprScalar<FunctionResult<K, Funcs>> => {
          return new ExprFunction(func, (args as any).map( ExprScalar.parse ));
        };
      },
    }) as FunctionProxy<Funcs>;
  }
    
  public static readonly id = ExprKind.FUNCTION;

  public constructor(
    public func: F,
    public args: FunctionArgumentValues<F, Funcs>
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

export const fns = ExprFunction.createProxy<Functions>();