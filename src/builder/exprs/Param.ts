import { Expr } from './Expr';


export class ExprParam<T> extends Expr<T> 
{
  
  public static readonly id = '?';

  public constructor(
    public param: string
  ) {
    super();
  }

  public isSimple(): boolean {
    return true;
  }

}