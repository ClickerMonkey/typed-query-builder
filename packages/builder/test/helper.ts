import { Expr, Select } from '../src/';
import { Name } from '../src/Types';


export function expectType<T>(type: T) 
{
  expect(true).toBe(true);
}


export function expectTypeMatch<T, R>(truthy: [R] extends [T] ? [T] extends [R] ? true : false : false) 
{
  expect(true).toBe(true);
}

export function expectExprType<T>(expr: Expr<T>)
{
  expect(true).toBe(true);
}

export function expectSelect<N extends Name, T>(select: Select<N, T>)
{
  expect(true).toBe(true);
}