import { Name, Selects, Sources, Expr, QueryCriteria, ExprKind, QueryJson, ExprScalar } from '../internal';


export class QueryList<T extends Sources, S extends Selects, W extends Name, R> extends Expr<R[]> 
{
  
  public static readonly id = ExprKind.QUERY_LIST;

  public constructor(
    public criteria: QueryCriteria<T, S, W>,
    public item: Expr<R>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_LIST;
  }

  public json(): ExprScalar<R[]> {
    return new QueryJson<S, R[]>(this);
  }

}