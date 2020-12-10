import { SelectsValues, Selects, Sources } from '../../_Types';
import { SelectArrayToTuple } from '../select';
import { QuerySelectBase } from './Base';


export class QuerySelectFirstRow<T extends Sources, S extends Selects> extends QuerySelectBase<T, S, SelectArrayToTuple<S>>
{
  
  public static readonly id = 'srow';

}