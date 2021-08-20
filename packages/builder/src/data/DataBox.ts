import { DataTypeInputs, DataTypeBox, ExprTypeDeep, isNumber, DataTypePoint } from '../internal';
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

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypeBox>, srid?: number)
  public constructor(minX: number, minY: number, maxX: number, maxY: number, srid?: number) 
  public constructor(minX?: number | ExprTypeDeep<DataTypeBox>, minY?: number, maxX?: number, maxY?: number, srid?: number)
  {
    super(isNumber(minX) ? srid : minY);

    this.minX = isNumber(minX) ? minX : 0;
    this.minY = isNumber(minY) ? minY : 0;
    this.maxX = isNumber(maxX) ? maxX : 0;
    this.maxY = isNumber(maxY) ? maxY : 0;
    this.deep = !isNumber(minX) ? minX : undefined;
  }

  public clear(): this
  {
    this.minX = 0;
    this.maxX = 0;
    this.minY = 0;
    this.maxY = 0;
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypeBox>): this
  {
    Object.assign(this, object)

    return this;
  }

  public isValid(): boolean
  {
    return this.minX !== 0
      || this.minY !== 0
      || this.maxX !== 0
      || this.maxY !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'BOX';
  }

  public toJSON(): DataTypeBox
  {
    const { minX, minY, maxX, maxY } = this;

    return { minX, minY, maxX, maxY };
  }

  public toString(): string
  {
    const { minX, minY, maxX, maxY } = this;

    return `Box { minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY} }`;
  }

  public getPointCount(): number
  {
    return 4;
  }

  public getPoint(i: number): DataTypePoint
  {
    switch (i) 
    {
      case 0: return { x: this.minX, y: this.minY };
      case 1: return { x: this.maxX, y: this.minY };
      case 2: return { x: this.maxX, y: this.maxY };
      case 3: return { x: this.minX, y: this.maxY };
    }

    throw new Error(`Invalid point index ${i}`);
  }

  public isClosed(): boolean
  {
    return true;
  }

  public isInside(point: DataTypePoint): boolean
  {
    return !(
      point.x < this.minX ||
      point.x > this.maxX ||
      point.y < this.minY ||
      point.y > this.maxY
    );
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    const x = Math.min(this.maxX, Math.max(this.minX, point.x));
    const y = Math.min(this.maxY, Math.max(this.minY, point.y));

    return { x, y };
  }

}