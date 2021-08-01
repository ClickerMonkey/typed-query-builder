import { ExprKind, Expr } from '../internal';


export class ExprDefault extends Expr<any>
{

  public static readonly id = ExprKind.DEFAULT;

  public getKind(): ExprKind 
  {
    return ExprKind.DEFAULT;
  }

}