import { ExprKind, ExprScalar } from '../internal';


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