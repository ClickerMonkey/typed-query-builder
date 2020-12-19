import { Name } from '../types';
import { ExprScalar } from '../exprs/Scalar';


export interface Select<A extends Name, V>
{
  alias: A;

  getInferredType(): V
  getExpr(): ExprScalar<V>;
}