import { Expr, ExprInput, ExprScalar, ExprConstant } from './internal';


export function toExpr<T>(input: ExprInput<T>): ExprScalar<T>
{
  return input instanceof ExprScalar
    ? input
    : new ExprConstant(input) as any;
}


export function toAnyExpr<T>(input: Expr<T> | T): Expr<T>
{
  return input instanceof Expr
    ? input
    : new ExprConstant(input) as any;
}