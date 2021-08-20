import { isNumbersEqual } from '../fns';
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

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypePoint>, srid?: number)
  public constructor(x: number, y: number, srid?: number) 
  public constructor(x?: number | ExprTypeDeep<DataTypePoint>, y?: number, srid?: number)
  {
    super(isNumber(x) ? srid : y);

    this.x = isNumber(x) ? x : 0;
    this.y = isNumber(y) ? y : 0;
    this.deep = !isNumber(x) ? x : undefined;
  }

  public clear(): this
  {
    this.x = 0;
    this.y = 0;
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypePoint>): this
  {
    Object.assign(this, object);

    return this;
  }

  public isValid(): boolean
  {
    return this.x !== 0
      || this.y !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'POINT';
  }

  public toJSON(): DataTypePoint
  {
    const { x, y } = this;

    return { x, y };
  }

  public toString(): string
  {
    const { x, y } = this;

    return `Point {${x}, ${y}}`;
  }

  public getPointCount(): number
  {
    return 1;
  }

  public getPoint(i: number): DataTypePoint
  {
    switch (i) 
    {
      case 0: return { x: this.x, y: this.y };
    }

    throw new Error(`Invalid point index ${i}`);
  }

  public isClosed(): boolean
  {
    return false;
  }

  public isInside(point: DataTypePoint): boolean
  {
    return isNumbersEqual(this.x, point.x) && isNumbersEqual(this.y, point.y);
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    return this.getPoint(0);
  }

}