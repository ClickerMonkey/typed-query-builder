import { ExprScalar } from '../exprs';
import { ExprKind } from '../Kind';
import { Selects, Sources } from '../Types';
import { QueryCriteria } from './Criteria';


export class QuerySelectExistential<T extends Sources, S extends Selects> extends ExprScalar<1 | null>
{ 
  
  public static readonly id = 's1';

  public constructor(
    public _criteria: QueryCriteria<T, S>
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.QUERY_EXISTENTIAL;
  }

}