import { Selects, SelectsValues } from '../../_Types';
import { Expr } from '../exprs';
import { QueryInsert } from './Insert';


export class InsertTuples<R extends Selects> extends Expr<SelectsValues<R>[]>
{

  public static readonly id = 'ituples';

  public constructor(
    public insert: QueryInsert<any, any, any, any, R>
  ) {
    super();
  }

}