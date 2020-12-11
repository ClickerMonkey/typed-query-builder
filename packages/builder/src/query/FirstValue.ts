import { Selects, Sources } from '../Types';
import { QuerySelectBase } from './Base';
import { Select } from '../select';


export class QuerySelectFirstValue<T extends Sources, S extends Selects, R> extends QuerySelectBase<T, S, R>
{
  
  public static readonly id = 'svalue';

  public constructor(
    base: QuerySelectBase<T, S, any>,
    public value: Select<any, R>
  ) {
    super( base as any );
  }
  
}