import { Expr, Select } from '../src/builder';
import { Name } from '../src/_Types';


export function expectType<T>(type: T) 
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