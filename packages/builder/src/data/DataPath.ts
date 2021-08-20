import { isNumbersEqual } from '../fns';
import { DataTypeInputs, DataTypePath, DataTypePoint, ExprTypeDeep, isArray } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataPath extends DataGeometry<DataTypePath> implements DataTypePath 
{

  public static earth(points: DataTypePoint[])
  {
    return new DataPath(points, DataGeometry.SRID_EARTH);
  }

  public points: DataTypePoint[];

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypePath>, srid?: number)
  public constructor(points: DataTypePoint[], srid?: number) 
  public constructor(points?: DataTypePoint[] | ExprTypeDeep<DataTypePath>, srid?: number)
  {
    super(srid);

    this.points = isArray(points) ? points : [];
    this.deep = !isArray(points) ? points : undefined;
  }

  public clear(): this
  {
    this.points = [];
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypePath>): this
  {
    this.points = object.points || [];

    return this;
  }

  public isValid(): boolean
  {
    return this.points.length !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'PATH';
  }

  public toJSON(): DataTypePath
  {
    const { points } = this;

    return { points: points.map(({x, y}) => ({x, y})) };
  }

  public toString(): string
  {
    const { points } = this;

    return `Path [ ${points.map(({ x, y }) => `(${x}, ${y})`).join(', ')} ]`;
  }

  public getPointCount(): number
  {
    return this.points.length;
  }

  public getPoint(i: number): DataTypePoint
  {
    const p = this.points[i];

    if (!p) 
    {
      throw new Error(`Invalid point index ${i}`);
    }

    return { x: p.x, y: p.y };
  }

  public isClosed(): boolean
  {
    return false;
  }

  public isInside(point: DataTypePoint): boolean
  {
    const closest = this.getClosestOn(point);
    const distance = this.dist(closest, point);

    return isNumbersEqual(distance, 0);
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    const points = this.points;
    const n = points.length;

    if (n === 0)
    {
      throw new Error('Cannot comupte the closest point to an empty path.');
    }
    else if (n === 1)
    {
      return points[n];
    }

    let closest = this.closestToSegment(point, points[0], points[1]);
    let closestDistanceSq = this.distSq(point, closest);

    for (let i = 1; i < n - 1; i++)
    {
      const next = this.closestToSegment(point, points[i], points[i + 1]);
      const nextDistanceSq = this.distSq(point, next);

      if (nextDistanceSq < closestDistanceSq)
      {
        closest = next;
        closestDistanceSq = nextDistanceSq;
      }
    }

    return closest;
  }

}