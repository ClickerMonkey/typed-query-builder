import { DataTypeInputs, DataTypeSegment, ExprTypeDeep, isNumber } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataSegment extends DataGeometry<DataTypeSegment> implements DataTypeSegment 
{

  public static earth(x1: number, y1: number, x2: number, y2: number)
  {
    return new DataSegment(x1, y1, x2, y2, DataGeometry.SRID_EARTH);
  }

  public x1: number; 
  public y1: number; 
  public x2: number; 
  public y2: number;

  public constructor(deep: ExprTypeDeep<DataTypeSegment>, srid?: number)
  public constructor(x1: number, y1: number, x2: number, y2: number, srid?: number) 
  public constructor(x1: number | ExprTypeDeep<DataTypeSegment>, y1?: number, x2?: number, y2?: number, srid?: number)
  {
    super(isNumber(x1) ? srid : y1);

    this.x1 = isNumber(x1) ? x1 : 0;
    this.y1 = isNumber(y1) ? y1 : 0;
    this.x2 = isNumber(x2) ? x2 : 0;
    this.y2 = isNumber(y2) ? y2 : 0;
    this.deep = !isNumber(x1) ? x1 : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'SEGMENT';
  }

}