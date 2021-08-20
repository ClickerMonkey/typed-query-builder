import { isNumbersEqual } from '../fns';
import { DataTypeInputs, DataTypeLine, DataTypePoint, ExprTypeDeep, isNumber } from '../internal';
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

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypeLine>, srid?: number)
  public constructor(a: number, b: number, c: number, srid?: number) 
  public constructor(a?: number | ExprTypeDeep<DataTypeLine>, b?: number, c?: number, srid?: number)
  {
    super(isNumber(a) ? srid : b);

    this.a = isNumber(a) ? a : 0;
    this.b = isNumber(b) ? b : 0;
    this.c = isNumber(c) ? c : 0;
    this.deep = !isNumber(a) ? a : undefined;
  }

  public clear(): this
  {
    this.a = 0;
    this.b = 0;
    this.c = 0;
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypeLine>): this
  {
    Object.assign(this, object)

    return this;
  }

  public isValid(): boolean
  {
    return this.a !== 0
      || this.b !== 0
      || this.c !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'LINE';
  }

  public toJSON(): DataTypeLine
  {
    const { a, b, c } = this;

    return { a, b, c };
  }

  public toString(): string
  {
    const { a, b, c } = this;

    return `Line { a=${a}, b=${b}, c=${c} }`;
  }

  public getPointCount(): number
  {
    return 1;
  }

  public getPoint(i: number): DataTypePoint
  {
    switch (i) 
    {
      case 0: return { x: this.a, y: this.b };
    }

    throw new Error(`Invalid point index ${i}`);
  }

  public isClosed(): boolean
  {
    return false;
  }

  public isInside(point: DataTypePoint): boolean
  {
    const signedDistance = this.a * point.x + this.b * point.y + this.c;

    return isNumbersEqual(signedDistance, 0);
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    return {
      x: point.x * this.c + this.a,
      y: point.y * this.c + this.b,
    };
  }

}