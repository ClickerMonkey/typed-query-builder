import { expect } from '@jest/globals';
import { Name, ExprValueToExpr, Expr, Select } from '../src';


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