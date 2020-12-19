import { ExprScalar } from './Scalar';
import { ExprKind } from '../Kind';


export class ExprRaw extends ExprScalar<any> 
{

  public static readonly id = ExprKind.RAW;

  public constructor(
    public expr: any,
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.RAW;
  }

}