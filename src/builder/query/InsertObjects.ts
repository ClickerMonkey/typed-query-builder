import { ObjectFromSelects, Selects } from '../../_Types';
import { Expr } from '../exprs';
import { QueryInsert } from './Insert';

export class InsertObjects<R extends Selects> extends Expr<ObjectFromSelects<R>[]>
{

  public static readonly id = 'iobjects';

  public constructor(
    public insert: QueryInsert<any, any, any, any, R>
  ) {
    super();
  }

}