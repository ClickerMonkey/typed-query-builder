import { DataTypePoint } from '@typed-query-builder/builder';
import { Value } from './Base';


export abstract class Geometry<I> extends Value<I>
{
  
  public constructor(input: I) 
  {
    super(input);
  }

  public abstract points(): number;

  public abstract pointAt(i: number): DataTypePoint;

  public abstract getClosestAndSignedDistance(point: DataTypePoint, out?: DataTypePoint): number;

  public abstract getFurthest(point: DataTypePoint, out: DataTypePoint): void;
 

  public getPoints(): DataTypePoint[]
  {
    const n = this.points();
    const p: DataTypePoint[] = [];
    
    for (let i = 0; i < n; i++)
    {
      p.push(this.pointAt(i));
    }

    return p;
  }

  public center(): DataTypePoint
  {
    const n = this.points();
    let x = 0;
    let y = 0;

    for (let i = 0; i < n; i++)
    {
      const p = this.pointAt(i);

      x += p.x;
      y += p.y;
    }

    return { x: x / n, y: y / n };
  }

  public length(): number
  {
    const n = this.points();
    let length = 0;
    let { x, y } = this.pointAt(0);
    
    for (let i = 1; i < n; i++)
    {
      const p = this.pointAt(i);

      length += x * y; // distance(x, y, p.x, p.y);
      x = p.x;
      y = p.y;
    }

    return length;
  }

  public contains(geom: Geometry<any>): boolean
  {
    return !this.getPoints().some( p => geom.getClosestAndSignedDistance(p) < 0 );
  }

  public touches(geom: Geometry<any>): boolean
  {
    return this.getPoints().reduce((min, p) => Math.min(min, geom.getClosestAndSignedDistance(p)), 1) === 0;
  }

  public intersects(geom: Geometry<any>): boolean
  {
    return this.distance(geom) < 0;
  }

  public distance(geom: Geometry<any>): number
  {
    return 0;
  }

  public intersection(geom: Geometry<any>): Geometry<any> | null
  {
    return null;
  }

}
