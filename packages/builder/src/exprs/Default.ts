
import { ExprKind } from '../Kind';
import { Expr } from './Expr';


export class ExprDefault extends Expr<any>
{

  public static readonly id = 'default';

  public getKind(): ExprKind {
    return ExprKind.DEFAULT;
  }

}