import { DataTypeInputs, DataTypeLine, ExprTypeDeep, isNumber } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataLine extends DataGeometry<DataTypeLine> implements DataTypeLine 
{

  public static earth(a: number, b: number, c: number)
  {
    return new DataLine(a, b, c, DataGeometry.SRID_EARTH);
  }

  public a: number; 
  public b: number; 
  public c: number; 

  public constructor(deep: ExprTypeDeep<DataTypeLine>, srid?: number)
  public constructor(a: number, b: number, c: number, srid?: number) 
  public constructor(a: number | ExprTypeDeep<DataTypeLine>, b?: number, c?: number, srid?: number)
  {
    super(isNumber(a) ? srid : b);

    this.a = isNumber(a) ? a : 0;
    this.b = isNumber(b) ? b : 0;
    this.c = isNumber(c) ? c : 0;
    this.deep = !isNumber(a) ? a : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'LINE';
  }

}