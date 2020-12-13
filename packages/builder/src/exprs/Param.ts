import { ExprScalar } from '..';
import { ExprKind } from '../Kind';


export class ExprParam<T> extends ExprScalar<T> 
{
  
  public static readonly id = '?';

  public constructor(
    public param: string
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.PARAM;
  }

  public isSimple(): boolean {
    return true;
  }

}