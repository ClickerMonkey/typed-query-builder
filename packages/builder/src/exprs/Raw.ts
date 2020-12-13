import { ExprScalar } from '..';
import { ExprKind } from '../Kind';


export class ExprRaw extends ExprScalar<any> 
{

  public static readonly id = 'raw';

  public constructor(
    public expr: any,
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.RAW;
  }

}