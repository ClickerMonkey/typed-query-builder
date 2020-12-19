import { Selects, Sources, Select, ExprScalar, QueryCriteria, ExprKind } from '../internal';


export class QuerySelectFirstValue<T extends Sources, S extends Selects, R> extends ExprScalar<R>
{
  
  public static readonly id = ExprKind.QUERY_FIRST_VALUE;

  public constructor(
    public criteria: QueryCriteria<T, S>,
    public value: Select<any, R>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_FIRST_VALUE;
  }
  
}