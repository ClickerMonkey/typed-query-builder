import { Name, Selects, Sources, Select, ExprScalar, QueryCriteria, ExprKind } from '../internal';


export class QueryFirstValue<T extends Sources, S extends Selects, W extends Name, R> extends ExprScalar<R>
{
  
  public static readonly id = ExprKind.QUERY_FIRST_VALUE;

  public constructor(
    public criteria: QueryCriteria<T, S, W>,
    public value: Select<any, R>,
    public defaultValue?: ExprScalar<any>
  ) {
    super();

    this.criteria.clearSelects();
  }

  public getKind(): ExprKind 
  {
    return ExprKind.QUERY_FIRST_VALUE;
  }

  public isStatement(): boolean 
  {
    return true;
  }
  
}