import { Selects, Sources } from '../Types';
import { Select } from '../select';
import { ExprScalar } from '../exprs';
import { QueryCriteria } from './Criteria';
import { ExprKind } from '../Kind';


export class QuerySelectFirstValue<T extends Sources, S extends Selects, R> extends ExprScalar<R>
{
  
  public static readonly id = 'svalue';

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