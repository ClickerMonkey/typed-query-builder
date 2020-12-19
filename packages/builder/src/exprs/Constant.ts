import { ExprKind } from '../Kind';
import { ExprScalar } from './Scalar';


export class ExprConstant<T> extends ExprScalar<T> 
{
  
  public static readonly id = ExprKind.CONSTANT;

  public constructor(
    public value: T
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.CONSTANT;
  }

  public isSimple(): boolean {
    return true;
  }

}