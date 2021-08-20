import { DataTypeInputs, ExprTypeDeep, ExprConstant } from '../internal';


export abstract class Data<T> extends ExprConstant<T>
{

  public deep?: ExprTypeDeep<T>;

  public constructor(
    deep?: ExprTypeDeep<T>
  ) {
    super(null as any);

    this.deep = deep; 
    this.value = this as any;
    this.dataType = this.getType();
  }

  public abstract getType(): DataTypeInputs;

  public abstract clear(): this;

  public abstract set(object: Partial<T>): this;

  public abstract isValid(): boolean;

}