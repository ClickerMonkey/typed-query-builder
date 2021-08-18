import { DataTypeInputs, DataTypeBox, ExprTypeDeep, isNumber } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataBox extends DataGeometry<DataTypeBox> implements DataTypeBox 
{

  public static earth(minX: number, minY: number, maxX: number, maxY: number)
  {
    return new DataBox(minX, minY, maxX, maxY, DataGeometry.SRID_EARTH);
  }

  public minX: number; 
  public minY: number; 
  public maxX: number; 
  public maxY: number;

  public constructor(deep: ExprTypeDeep<DataTypeBox>, srid?: number)
  public constructor(minX: number, minY: number, maxX: number, maxY: number, srid?: number) 
  public constructor(minX: number | ExprTypeDeep<DataTypeBox>, minY?: number, maxX?: number, maxY?: number, srid?: number)
  {
    super(isNumber(minX) ? srid : minY);

    this.minX = isNumber(minX) ? minX : 0;
    this.minY = isNumber(minY) ? minY : 0;
    this.maxX = isNumber(maxX) ? maxX : 0;
    this.maxY = isNumber(maxY) ? maxY : 0;
    this.deep = !isNumber(minX) ? minX : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'BOX';
  }

}