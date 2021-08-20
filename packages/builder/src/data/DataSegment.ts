import { isNumbersEqual } from '../fns';
import { DataTypeInputs, DataTypePoint, DataTypeSegment, ExprTypeDeep, isNumber } from '../internal';
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

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypeSegment>, srid?: number)
  public constructor(x1: number, y1: number, x2: number, y2: number, srid?: number) 
  public constructor(x1?: number | ExprTypeDeep<DataTypeSegment>, y1?: number, x2?: number, y2?: number, srid?: number)
  {
    super(isNumber(x1) ? srid : y1);

    this.x1 = isNumber(x1) ? x1 : 0;
    this.y1 = isNumber(y1) ? y1 : 0;
    this.x2 = isNumber(x2) ? x2 : 0;
    this.y2 = isNumber(y2) ? y2 : 0;
    this.deep = !isNumber(x1) ? x1 : undefined;
  }

  public clear(): this
  {
    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;
    this.deep === undefined;

    return this;
  }

  public set(object: Partial<DataTypeSegment>): this
  {
    Object.assign(this, object);

    return this;
  }

  public isValid(): boolean
  {
    return this.x1 !== 0
      || this.y1 !== 0
      || this.x2 !== 0
      || this.y2 !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'SEGMENT';
  }

  public toJSON(): DataTypeSegment
  {
    const { x1, y1, x2, y2 } = this;

    return { x1, y1, x2, y2 };
  }

  public toString(): string
  {
    const { x1, y1, x2, y2 } = this;

    return `Segment { x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2} }`;
  }

  public getPointCount(): number
  {
    return 2;
  }

  public getPoint(i: number): DataTypePoint
  {
    switch (i) 
    {
      case 0: return { x: this.x1, y: this.y1 };
      case 1: return { x: this.x2, y: this.y2 };
    }

    throw new Error(`Invalid point index ${i}`);
  }

  public isClosed(): boolean
  {
    return false;
  }

  public isInside(point: DataTypePoint): boolean
  {
    const closest = this.getClosestOn(point);
    const distance = this.dist(point, closest);

    return isNumbersEqual(distance, 0);
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    return this.closestToSegment(point, this.getPoint(0), this.getPoint(1));
  }

}