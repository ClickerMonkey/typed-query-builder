import { ObjectFromSelects, Selects, Sources } from '../../_Types';
import { QuerySelectBase } from './Base';


export class QuerySelectFirst<T extends Sources, S extends Selects> extends QuerySelectBase<T, S, ObjectFromSelects<S>>
{
  
  public static readonly id = 'sfirst';

}