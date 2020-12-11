import { Name } from '../Types';
import { Select } from '../select/Select';
import { Expr } from './Expr';


export class ExprField<F extends Name, T> extends Expr<T> implements Select<F, T>
{
  
  public static readonly id = 'field';

  public constructor(
    public source: Name,
    public alias: F
  ) {
    super();
  }

  public isSimple(): boolean {
    return true;
  }

  public getExpr(): Expr<T> {
    return this;
  }

}