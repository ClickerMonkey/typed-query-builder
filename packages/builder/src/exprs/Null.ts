
import { ExprKind } from '../Kind';
import { Expr } from './Expr';


export class ExprNull extends Expr<any>
{

  public static readonly id = ExprKind.NULL;

  public getKind(): ExprKind {
    return ExprKind.NULL;
  }

}