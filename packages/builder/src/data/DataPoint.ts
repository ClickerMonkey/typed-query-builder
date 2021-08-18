import { DataTypeInputs, DataTypePoint, ExprTypeDeep, isNumber } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataPoint extends DataGeometry<DataTypePoint> implements DataTypePoint 
{

  public static earth(longitude: number, latitude: number)
  {
    return new DataPoint(longitude, latitude, DataGeometry.SRID_EARTH);
  }

  public x: number; 
  public y: number;

  public constructor(deep: ExprTypeDeep<DataTypePoint>, srid?: number)
  public constructor(x: number, y: number, srid?: number) 
  public constructor(x: number | ExprTypeDeep<DataTypePoint>, y?: number, srid?: number)
  {
    super(isNumber(x) ? srid : y);

    this.x = isNumber(x) ? x : 0;
    this.y = isNumber(y) ? y : 0;
    this.deep = !isNumber(x) ? x : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'POINT';
  }

}