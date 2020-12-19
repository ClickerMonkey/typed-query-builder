import { ExprKind, Expr } from '../internal';


export class ExprNull extends Expr<any>
{

  public static readonly id = ExprKind.NULL;

  public getKind(): ExprKind {
    return ExprKind.NULL;
  }

}