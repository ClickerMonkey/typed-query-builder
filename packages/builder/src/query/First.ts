import { Expr, ExprKind, Selects, Sources, QueryCriteria } from '../internal';


export class QuerySelectFirst<T extends Sources, S extends Selects> extends Expr<S>
{
  
  public static readonly id = ExprKind.QUERY_FIRST;

  public constructor(
    public criteria: QueryCriteria<T, S>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_FIRST;
  }

}

