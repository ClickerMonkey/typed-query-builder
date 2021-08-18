import { DataTypeInputs, DataTypePolygon, DataTypePoint, ExprTypeDeep, isArray } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataPolygon extends DataGeometry<DataTypePolygon> implements DataTypePolygon 
{

  public static earth(points: DataTypePoint[])
  {
    return new DataPolygon(points, DataGeometry.SRID_EARTH);
  }

  public corners: DataTypePoint[];

  public constructor(deep: ExprTypeDeep<DataTypePolygon>, srid?: number)
  public constructor(corners: DataTypePoint[], srid?: number) 
  public constructor(corners: DataTypePoint[] | ExprTypeDeep<DataTypePolygon>, srid?: number)
  {
    super(srid);

    this.corners = isArray(corners) ? corners : [];
    this.deep = !isArray(corners) ? corners : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'POLYGON';
  }

}