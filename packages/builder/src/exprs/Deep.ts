import { DataTypeInputs, ExprKind, ExprScalar, ExprTypeDeep } from '../internal';


export class ExprDeep<T> extends ExprScalar<T>
{
  
  public static readonly id = ExprKind.DEEP;

  public constructor(
    public value: ExprTypeDeep<T>,
    public dataType?: DataTypeInputs
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.DEEP;
  }

  public isSimple(): boolean 
  {
    return true;
  }

}