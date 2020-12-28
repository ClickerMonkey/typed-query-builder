import { Expr } from '@typed-query-builder/builder';
import { DialectOutput, DialectBase } from '../src';


export function sql(e: Expr<any>)
{
  return DialectBase.output()(e).query;
}

export function out(e: Expr<any>): DialectOutput
{
  return DialectBase.output()(e);
}