import { Selects, Sources } from '../Types';
import { QuerySelectBase } from './Base';


export class QuerySelectFirst<T extends Sources, S extends Selects> extends QuerySelectBase<T, S, S>
{
  
  public static readonly id = 'sfirst';

}

