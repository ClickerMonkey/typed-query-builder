import { Name, ExprScalar, ExprKind, Selects, Sources, QueryCriteria } from '../internal';


export class QueryExistential<T extends Sources, S extends Selects, W extends Name> extends ExprScalar<1 | null>
{ 
  
  public static readonly id = ExprKind.QUERY_EXISTENTIAL;

  public constructor(
    public _criteria: QueryCriteria<T, S, W>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_EXISTENTIAL;
  }

}