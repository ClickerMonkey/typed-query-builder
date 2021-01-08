import { DataTypePoint, isArray } from '@typed-query-builder/builder';
import { Value } from './Base';


export type PointInput = 
  DataTypePoint | 
  [x: number, y: number]
;

export class Point extends Value<PointInput> implements DataTypePoint
{
  
  public static parse(input: PointInput): Point 
  {
    return input instanceof Point ? input : new Point(input);
  }

  public x: number;
  public y: number;

  public constructor(input: PointInput) 
  {
    super(input);
    this.x = this.y = 0;
    this.fromInput(input);
  }

  public fromInput(input: PointInput): void 
  {
    if (isArray(input)) 
    {
      this.set(input[0], input[1]);
    }
    else 
    {
      this.set(input.x, input.y);
    }
  }

  public set(x: number, y: number) 
  {
    this.x = x;
    this.y = y;
  }

}
