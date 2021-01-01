import { Expr } from '@typed-query-builder/builder';
import { DialectOutput, DialectOutputOptions } from '@typed-query-builder/sql';
import { DialectMssql } from '../src';


DialectMssql.defaultOptions.throwError = true;

export function sql(e: Expr<any>)
{
  return DialectMssql.output()(e).query;
}

export function sqlWithOptions(options: DialectOutputOptions)
{
  return (e: Expr<any>) => DialectMssql.output(options)(e).query;
}

export function out(e: Expr<any>): DialectOutput
{
  return DialectMssql.output()(e);
}

export function outWithOptions(options: DialectOutputOptions)
{
  return (e: Expr<any>) => DialectMssql.output(options)(e);
}

export function expectText(options: { condenseSpace?: boolean, ignoreSpace?: boolean, ignoreCase?: boolean }, x: string, y: string)
{
  const a = options.condenseSpace
    ? removeExtraWhitespace(x)
    : options.ignoreSpace
      ? removeAllWhitespace(x)
      : x;
  const b = options.condenseSpace
    ? removeExtraWhitespace(y)
    : options.ignoreSpace
      ? removeAllWhitespace(y)
      : y;
  const c = options.ignoreCase
    ? a.toLowerCase()
    : a;
  const d = options.ignoreCase
    ? b.toLowerCase()
    : b;

  expect(c).toBe(d);
}

export function removeExtraWhitespace(x: string)
{
  return x.replace(/\s+/g, ' ').replace(/^\s+/, '').replace(/\s+$/, '');
}

export function removeAllWhitespace(x: string)
{
  return x.replace(/\s+/g, '');
}