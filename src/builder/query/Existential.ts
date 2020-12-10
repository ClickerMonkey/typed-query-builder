import { Selects, Sources } from '../../_Types';
import { QuerySelectBase } from './Base';


export class QuerySelectExistential<T extends Sources, S extends Selects> extends QuerySelectBase<T, S, 1 | null>
{ 
  
  public static readonly id = 's1';

}