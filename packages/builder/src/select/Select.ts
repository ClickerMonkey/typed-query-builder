import { Name, ExprScalar } from '../internal';


export interface Select<A extends Name, V>
{
  alias: A;

  getInferredType(): V
  getExpr(): ExprScalar<V>;
}