import { ExprInput, ExprScalar, ExprConstant } from './internal';


export function toExpr<T>(input: ExprInput<T>): ExprScalar<T>
{
  return input instanceof ExprScalar
    ? input
    : new ExprConstant(input) as any;
}