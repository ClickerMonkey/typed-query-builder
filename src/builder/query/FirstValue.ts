import { Selects, Sources } from '../../_Types';
import { Expr } from '../exprs/Expr';
import { QuerySelectBase } from './Base';


export class QuerySelectFirstValue<T extends Sources, S extends Selects, R> extends QuerySelectBase<T, S, R>
{
  
  public static readonly id = 'svalue';

  public constructor(
    base: QuerySelectBase<T, S, any>,
    public value: Expr<R>
  ) {
    super( base );
  }
  
}