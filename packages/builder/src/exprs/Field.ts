import { Name } from '../Types';
import { Select } from '../select/Select';
import { ExprScalar } from './Scalar';
import { ExprKind } from '../Kind';


export class ExprField<F extends Name, T> extends ExprScalar<T> implements Select<F, T>
{
  
  public static readonly id = 'field';

  public constructor(
    public source: Name,
    public alias: F
  ) {
    super();
  }

  public getKind(): ExprKind {
    return ExprKind.FIELD;
  }

  public isSimple(): boolean {
    return true;
  }

  public getExpr(): ExprScalar<T> {
    return this;
  }

}