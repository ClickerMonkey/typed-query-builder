import {
  FunctionArgumentValues, FunctionResult, Functions, ExprKind, Traverser, Expr, ExprScalar
} from '../internal';


export class ExprFunction<F extends keyof Funcs, Funcs = Functions> extends ExprScalar<FunctionResult<F, Funcs>> 
{
  
  public static readonly id = ExprKind.FUNCTION;

  public constructor(
    public func: F,
    public args: FunctionArgumentValues<F, Funcs>
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.FUNCTION;
  }
  
  public isSimple(): boolean 
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<any>, R>): R 
  { 
    return traverse.enter(this, () => 
    {
      traverse.step('args', () => 
      {
        for (let i = 0; i < this.args.length; i++) 
        {
          traverse.step(i, this.args[i], (replace) => this.args[i] = replace as any);
        }
      });
    });
  }

}