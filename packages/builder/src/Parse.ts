import { isArray, isObject, mapRecord } from './fns';
import { Expr, ExprInput, ExprScalar, ExprConstant, ExprInputDeep, ExprTypeDeep } from './internal';


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


export function toExprDeep<T>(input: ExprInputDeep<T>): ExprTypeDeep<T>
{
  return input instanceof Expr
    ? input
    : isArray(input)
      ? input.map( toExprDeep )
      : isObject(input)
        ? mapRecord(input, (value) => toExprDeep(value as any) )
        : input as any;
}