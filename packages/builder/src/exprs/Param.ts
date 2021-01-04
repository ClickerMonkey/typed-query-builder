import { DataTypeInputs, ExprKind, ExprScalar } from '../internal';


export class ExprParam<T> extends ExprScalar<T> 
{
  
  public static readonly id = ExprKind.PARAM;

  public constructor(
    public param: string,
    public dataType?: DataTypeInputs,
    public defaultValue?: T,
  ) {
    super();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.PARAM;
  }

  public isSimple(): boolean 
  {
    return true;
  }

}