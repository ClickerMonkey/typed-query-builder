import { Selects, Sources, Expr, QueryCriteria, ExprKind } from '../internal';


export class QuerySelectList<T extends Sources, S extends Selects, R> extends Expr<R[]> 
{
  
  public static readonly id = ExprKind.QUERY_LIST;

  public constructor(
    public criteria: QueryCriteria<T, S>,
    public item: Expr<R>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_LIST;
  }

}