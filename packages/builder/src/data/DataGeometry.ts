import { isNumbersEqual } from '../fns';
import { DataTypePoint } from '../internal';
import { Data } from './Data';


export abstract class DataGeometry<T> extends Data<T>
{

  public static readonly SRID_EARTH = 4326;

  public srid: number;

  public constructor(srid: number = 0)
  {
    super();

    this.srid = srid;
  }

  public abstract getPointCount(precision?: number): number;

  public abstract getPoint(i: number, precision?: number): DataTypePoint;

  public abstract isClosed(): boolean;

  public abstract isInside(point: DataTypePoint): boolean;

  public abstract getClosestOn(point: DataTypePoint): DataTypePoint;


  public getPoints(precision?: number): DataTypePoint[]
  {
    const n = this.getPointCount(precision);
    const points: DataTypePoint[] = [];

    for (let i = 0; i < n; i++)
    {
      points.push(this.getPoint(i, precision));
    }

    return points;
  }

  public center(): DataTypePoint
  {
    const points = this.getPoints();

    if (points.length === 0)
    {
      throw new Error('Geometry without points has no center.');
    }
    else if (points.length === 1)
    {
      return points[0];
    }

    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < points.length; i++)
    {
      sumX += points[i].x;
      sumY += points[i].y;
    }

    return {
      x: sumX / points.length,
      y: sumY / points.length,
    };
  }

  public length(): number
  {
    const points = this.getPoints();
    let length = 0;

    if (points.length <= 1)
    {
      return length;
    }

    for (let i = 0; i < points.length - 1; i++)
    {      
      length += this.dist(points[i], points[i + 1]);
    }

    if (this.isClosed())
    {
      length += this.dist(points[0], points[points.length - 1]);
    }

    return length;
  }

  public distance(other: DataGeometry<any>): number
  {
    const n0 = this.getPointCount();
    const n1 = other.getPointCount();

    if (n0 < n1)
    {
      return other.distance(this);
    }

    let distSq = Number.POSITIVE_INFINITY;

    for (let i = 0; i < n0; i++)
    {
      const p = this.getPoint(i);
      const c = other.getClosestOn(p);
      const cSq = this.distSq(c, p);

      distSq = Math.min(distSq, cSq);
    }

    return Math.sqrt(distSq);
  }

  public withinDistance(other: DataGeometry<any>, distance: number): boolean
  {
    return this.distance(other) <= distance;
  }

  public contains(other: DataGeometry<any>): boolean
  {
    const CURVE_PRECISION = 16;
    const points = other.getPoints(CURVE_PRECISION);

    return points.every(p => this.isInside(p));
  }

  public intersects(other: DataGeometry<any>): boolean
  {
    const n = this.getPointCount();
    const otherPoints = other.getPoints();
    let curr = this.isClosed() ? n - 1 : 0;
    let next = this.isClosed() ? 0 : 1;

    while (next < n) {
      const currPoint = this.getPoint(curr);

      if (other.isInside(currPoint)) {
        return true;
      }

      const nextPoint = this.getPoint(next);

      for (const otherPoint of otherPoints) {
        const closest = this.closestToSegment(otherPoint, currPoint, nextPoint);

        if (this.orientation(closest, currPoint, nextPoint) === 'colinear') {
          return true;
        }
      }
      
      curr = next;
      next++;
    }

    return false;
  }


  protected dist(a: DataTypePoint, b: DataTypePoint): number
  {
    return Math.sqrt(this.distSq(a, b));
  }

  protected distSq(a: DataTypePoint, b: DataTypePoint): number
  {
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    return dx * dx + dy * dy;
  }

  protected dot(a: DataTypePoint, b: DataTypePoint): number
  {
    return a.x * b.x + a.y * b.y;
  }

  protected subtract(a: DataTypePoint, b: DataTypePoint): DataTypePoint
  {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  }

  protected deltaToSegment(point: DataTypePoint, p0: DataTypePoint, p1: DataTypePoint): number
  {
    const s0 = this.subtract( p1, p0 );
    const s1 = this.subtract( p0, point );

    const dot = this.dot( s0, s1 );
    const dsq = this.dot( s0, s0 );
    const delta = dot / dsq;

    return delta;
  }

  protected closestToSegment(point: DataTypePoint, p0: DataTypePoint, p1: DataTypePoint, clamp: boolean = true): DataTypePoint
  {
    let delta = this.deltaToSegment(point, p0, p1);
    if (clamp) {
      if (delta < 0) {
        delta = 0;
      } else if (delta > 1) {
        delta = 1;
      }
    }
    return this.interpolate(p0, p1, delta);
  }

  protected interpolate(p0: DataTypePoint, p1: DataTypePoint, delta: number): DataTypePoint
  {
    return {
      x: (p1.x - p0.x) * delta + p0.x,
      y: (p1.y - p0.y) * delta + p0.y,
    };
  }

  protected orientation(p: DataTypePoint, q: DataTypePoint, r: DataTypePoint): 'colinear' | 'clock' | 'counter'
  {
    const value = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    return isNumbersEqual(value, 0)
      ? 'colinear'
      : value > 0
        ? 'clock'
        : 'counter';
  }

  protected onSegment(p: DataTypePoint, q: DataTypePoint, r: DataTypePoint): boolean
  {
    return (
      q.x <= Math.max(p.x, r.x) &&
      q.x >= Math.min(p.x, r.x) &&
      q.y <= Math.max(p.y, r.y) && 
      q.y >= Math.min(p.y, r.y)
    );
  }

  protected segmentsIntersect(p1: DataTypePoint, q1: DataTypePoint, p2: DataTypePoint, q2: DataTypePoint): boolean
  {
    // Find the four orientations needed for general and
    // special cases
    const o1 = this.orientation(p1, q1, p2);
    const o2 = this.orientation(p1, q1, q2);
    const o3 = this.orientation(p2, q2, p1);
    const o4 = this.orientation(p2, q2, q1);
 
    // General case
    if (o1 != o2 && o3 != o4) {
      return true;
    }
 
    // Special Cases
    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
    if (o1 === 'colinear' && this.onSegment(p1, p2, q1)) {
      return true;
    }
 
    // p1, q1 and p2 are colinear and q2 lies on segment p1q1
    if (o2 === 'colinear' && this.onSegment(p1, q2, q1)) {
      return true;
    }
 
    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
    if (o3 === 'colinear' && this.onSegment(p2, p1, q2)) {
      return true;
    }
 
    // p2, q2 and q1 are colinear and q1 lies on segment p2q2
    if (o4 === 'colinear' && this.onSegment(p2, q1, q2)) {
      return true;
    }
 
    return false; // Doesn't fall in any of the above cases
  }

}