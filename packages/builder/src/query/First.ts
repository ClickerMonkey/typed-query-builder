import { Expr } from '../exprs';
import { ExprKind } from '../Kind';
import { Selects, Sources } from '../types';
import { QueryCriteria } from './Criteria';


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

