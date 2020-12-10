import { FunctionArgumentValues, FunctionResult, Functions } from '../../Functions';
import { Expr } from './Expr';


export class ExprFunction<F extends keyof Functions> extends Expr<FunctionResult<F>> 
{
  
  public static readonly id = 'f';

  public constructor(
    public func: F,
    public args: FunctionArgumentValues<F>
  ) {
    super();
  }
  
  public isSimple(): boolean {
    return true;
  }

}