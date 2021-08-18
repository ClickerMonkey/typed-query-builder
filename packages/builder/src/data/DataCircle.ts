import { DataTypeInputs, DataTypeCircle, ExprTypeDeep, isNumber } from '../internal';
import { DataGeometry } from './DataGeometry'


export class DataCircle extends DataGeometry<DataTypeCircle> implements DataTypeCircle
{

  public static earth(x: number, y: number, r: number)
  {
    return new DataCircle(x, y, r, DataGeometry.SRID_EARTH);
  }

  public x: number; 
  public y: number;
  public r: number;

  public constructor(deep: ExprTypeDeep<DataTypeCircle>, srid?: number)
  public constructor(x: number, y: number, r: number, srid?: number) 
  public constructor(x: number | ExprTypeDeep<DataTypeCircle>, y?: number, r?: number, srid?: number)
  {
    super(isNumber(x) ? srid : y);

    this.x = isNumber(x) ? x : 0;
    this.y = isNumber(y) ? y : 0;
    this.r = isNumber(r) ? r : 0;
    this.deep = !isNumber(x) ? x : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'CIRCLE';
  }

}