import { Expr } from './Expr';


export class ExprConstant<T> extends Expr<T> 
{
  
  public static readonly id = 'const';

  public constructor(
    public value: T
  ) {
    super();
  }

  public isSimple(): boolean {
    return true;
  }

}