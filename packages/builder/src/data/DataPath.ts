import { DataTypeInputs, DataTypePath, DataTypePoint, ExprTypeDeep, isArray } from '../internal';
import { DataGeometry } from './DataGeometry';


export class DataPath extends DataGeometry<DataTypePath> implements DataTypePath 
{

  public static earth(points: DataTypePoint[])
  {
    return new DataPath(points, DataGeometry.SRID_EARTH);
  }

  public points: DataTypePoint[];

  public constructor(deep: ExprTypeDeep<DataTypePath>, srid?: number)
  public constructor(points: DataTypePoint[], srid?: number) 
  public constructor(points: DataTypePoint[] | ExprTypeDeep<DataTypePath>, srid?: number)
  {
    super(srid);

    this.points = isArray(points) ? points : [];
    this.deep = !isArray(points) ? points : undefined;
  }

  public getType(): DataTypeInputs 
  {
    return 'PATH';
  }

}