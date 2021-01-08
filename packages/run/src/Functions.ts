import { Functions, isValue } from '@typed-query-builder/builder';
import { compare } from './util';


export const RunFunctions: Functions = Object.create(null);


RunFunctions.coalesce = <T extends any[]>(...values: T): T[number] =>
{
  return values.find( v => isValue(v) );
};

RunFunctions.iif = <T, F>(condition: boolean, trueValue: T, falseValue: F): T | F =>
{
  return condition ? trueValue : falseValue;
};

RunFunctions.greatest = <T>(...values: T[]): T =>
{
  return values.reduce((max, v) => compare(max, v) < 0 ? v : max);
};

RunFunctions.least = <T>(...values: T[]): T =>
{
  return values.reduce((max, v) => compare(max, v) > 0 ? v : max);
};