import { DataTypeInputs, DataTypePolygon, DataTypePoint, ExprTypeDeep, isArray } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataPolygon extends DataGeometry<DataTypePolygon> implements DataTypePolygon 
{

  public static earth(points: DataTypePoint[])
  {
    return new DataPolygon(points, DataGeometry.SRID_EARTH);
  }

  public corners: DataTypePoint[];

  public constructor()
  public constructor(deep: ExprTypeDeep<DataTypePolygon>, srid?: number)
  public constructor(corners: DataTypePoint[], srid?: number) 
  public constructor(corners?: DataTypePoint[] | ExprTypeDeep<DataTypePolygon>, srid?: number)
  {
    super(srid);

    this.corners = isArray(corners) ? corners : [];
    this.deep = !isArray(corners) ? corners : undefined;
  }

  public clear(): this
  {
    this.corners = [];
    this.deep = undefined;

    return this;
  }

  public set(object: Partial<DataTypePolygon>): this
  {
    this.corners = object.corners || [];

    return this;
  }

  public isValid(): boolean
  {
    return this.corners.length !== 0
      || this.deep !== undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'POLYGON';
  }

  public toJSON(): DataTypePolygon
  {
    const { corners } = this;

    return { corners: corners.map(({x, y}) => ({x, y})) };
  }

  public toString(): string
  {
    const { corners } = this;

    return `Polygon [ ${corners.map(({ x, y }) => `(${x}, ${y})`).join(', ')} ]`;
  }

  public getPointCount(): number
  {
    return this.corners.length;
  }

  public getPoint(i: number): DataTypePoint
  {
    const p = this.corners[i];

    if (!p) 
    {
      throw new Error(`Invalid point index ${i}`);
    }

    return { x: p.x, y: p.y };
  }

  public isClosed(): boolean
  {
    return true;
  }

  public isInside(point: DataTypePoint): boolean
  {
    const corners = this.corners;
    const n = corners.length;

    if (n < 3)
    {
      return false;
    }

    // Create a point for line segment from p to infinite
    const extreme = { x: Number.POSITIVE_INFINITY, y: point.y };
 
    // Count intersections of the above line with sides of polygon
    let count = 0;
    let i = 0;
    do {
        const next = (i + 1) % n;
 
        // Check if the line segment from 'p' to 'extreme' intersects
        // with the line segment from 'polygon[i]' to 'polygon[next]'
        if (this.segmentsIntersect(corners[i], corners[next], point, extreme)) {
            // If the point 'p' is colinear with line segment 'i-next',
            // then check if it lies on segment. If it lies, return true,
            // otherwise false
            if (this.orientation(corners[i], point, corners[next]) === 'colinear') {
              return this.onSegment(corners[i], point, corners[next]);
            }
 
            count++;
        }
        i = next;

    } while (i != 0);
 
    // Return true if count is odd, false otherwise
    return count % 2 === 1;
  }

  public getClosestOn(point: DataTypePoint): DataTypePoint
  {
    const corners = this.corners;
    const n = corners.length;

    if (n === 0)
    {
      throw new Error('Cannot comupte the closest point to an empty path.');
    }
    else if (n === 1)
    {
      return corners[n];
    }

    if (this.isInside(point))
    {
      return { x: point.x, y: point.y };
    }

    let closest = this.closestToSegment(point, corners[0], corners[1]);
    let closestDistanceSq = this.distSq(point, closest);

    for (let i = 1; i < n; i++)
    {
      const next = this.closestToSegment(point, corners[i], corners[(i + 1) % n]);
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