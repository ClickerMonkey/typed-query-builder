import { DataTypeInputs, DataTypeCircle, ExprTypeDeep, isNumber, DataTypePoint } from '../internal';
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

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypeCircle>, srid?: number)
  public constructor(x: number, y: number, r: number, srid?: number) 
  public constructor(x?: number | ExprTypeDeep<DataTypeCircle>, y?: number, r?: number, srid?: number)
  {
    super(isNumber(x) ? srid : y);

    this.x = isNumber(x) ? x : 0;
    this.y = isNumber(y) ? y : 0;
    this.r = isNumber(r) ? r : 0;
    this.deep = !isNumber(x) ? x : undefined;
  }

  public clear(): this
  {
    this.x = 0;
    this.y = 0;
    this.r = 0;
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypeCircle>): this
  {
    Object.assign(this, object)

    return this;
  }

  public isValid(): boolean
  {
    return this.x !== 0 
      || this.y !== 0
      || this.r !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'CIRCLE';
  }

  public toJSON(): DataTypeCircle
  {
    const { x, y, r } = this;

    return { x, y, r };
  }

  public toString(): string
  {
    const { x, y, r } = this;

    return `Circle { x=${x}, y=${y}, radius=${r} }`;
  }

  public getPointCount(precision?: number): number
  {
    return precision || 1;
  }

  public getPoint(i: number, precision?: number): DataTypePoint
  {
    const n = precision || 1;

    if (n <= 1)
    {
      return { x: this.x, y: this.y };
    }

    return {
      x: Math.cos(i / n * Math.PI) * this.r + this.x,
      y: Math.sin(i / n * Math.PI) * this.r + this.y,
    };
  }

  public length(): number
  {
    return Math.PI * 2 * this.r;
  }

  public isClosed(): boolean
  {
    return true;
  }

  public isInside(point: DataTypePoint): boolean
  {
    return this.distSq({ x: this.x, y: this.y }, point) <= this.r * this.r;
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    const { x, y, r } = this;
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= r || distance === 0)
    {
      return { x: point.x, y: point.y };
    }

    const nx = dx / distance;
    const ny = dy / distance;

    return {
      x: nx * r,
      y: ny * r,
    };
  }

}