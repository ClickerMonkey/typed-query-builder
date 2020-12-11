import { Selects, Sources } from '../Types';
import { Expr } from '../exprs/Expr';
import { QuerySelectBase } from './Base';


export class QuerySelectList<T extends Sources, S extends Selects, R> extends QuerySelectBase<T, S, R[]> 
{
  
  public static readonly id = 'slist';

  public constructor(
    base: QuerySelectBase<T, S, any>,
    public item: Expr<R>
  ) {
    super( base );
  }

}