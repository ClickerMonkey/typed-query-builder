import { DataTypeInputs, ExprKind, ExprScalar } from '../internal';


export class ExprConstant<T> extends ExprScalar<T> 
{
  
  public static readonly id = ExprKind.CONSTANT;

  public constructor(
    public value: T,
    public dataType?: DataTypeInputs
  ) {
    super();

    if (!this.dataType && value instanceof ExprConstant) {
      this.dataType = value.dataType;
    }
  }

  public getKind(): ExprKind 
  {
    return ExprKind.CONSTANT;
  }

  public isSimple(): boolean 
  {
    return true;
  }

}