import { Name } from '../Types';
import { Expr } from '../exprs/Expr';


export interface Select<A extends Name, V>
{
  alias: A;
  inferredType?: V;

  getExpr(): Expr<V>;
}