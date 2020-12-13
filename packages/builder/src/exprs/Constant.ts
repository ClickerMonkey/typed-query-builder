import { ExprKind } from '../Kind';
import { ExprScalar } from './Scalar';


export class ExprConstant<T> extends ExprScalar<T> 
{
  
  public static readonly id = 'const';

  public constructor(
    public value: T
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONSTANTS;
  }

  public isSimple(): boolean {
    return true;
  }

}