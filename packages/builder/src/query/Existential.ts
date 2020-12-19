import { ExprScalar, ExprKind, Selects, Sources, QueryCriteria } from '../internal';


export class QuerySelectExistential<T extends Sources, S extends Selects> extends ExprScalar<1 | null>
{ 
  
  public static readonly id = ExprKind.QUERY_EXISTENTIAL;

  public constructor(
    public _criteria: QueryCriteria<T, S>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_EXISTENTIAL;
  }

}