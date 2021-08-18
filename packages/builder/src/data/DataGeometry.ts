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

}