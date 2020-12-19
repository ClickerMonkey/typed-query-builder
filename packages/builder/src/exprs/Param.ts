import { ExprScalar } from './Scalar';
import { ExprKind } from '../Kind';


export class ExprParam<T> extends ExprScalar<T> 
{
  
  public static readonly id = ExprKind.PARAM;

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