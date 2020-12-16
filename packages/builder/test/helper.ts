import { Expr, Select } from '../src/';
import { Name, ExprValueObjects, SelectsFromObject, Selects, ExprValueToExpr } from '../src/Types';


type AA = ExprValueToExpr<boolean>; // Expr<boolean>
type AB = ExprValueToExpr<string[]>; // Expr<string[]> | Expr<Select<any, string>[]>
type AC = ExprValueToExpr<[string, number]>; // Expr<[string, number]> | Expr<[Select<any, string>, Select<any, number>]>
type AD = ExprValueToExpr<[string, boolean]>; // Expr<[string, number]> | Expr<[Select<any, string>, Select<any, boolean>]>


export function expectType<T>(type: T) 
{
  expect(true).toBe(true);
}


export function expectTypeMatch<T, R>(truthy: [R] extends [T] ? [T] extends [R] ? true : false : false) 
{
  expect(true).toBe(true);
}

export function expectExtends<T, R extends T>()
{
  expect(true).toBe(true);
}

export function expectExprType<T>(expr: Expr<T>)
{
  expect(true).toBe(true);
}

export function expectExpr<V>(expr: ExprValueToExpr<V>)
{
  expect(true).toBe(true);
}

export function expectSelect<N extends Name, T>(select: Select<N, T>)
{
  expect(true).toBe(true);
}