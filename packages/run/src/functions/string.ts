
import { isNumber } from '@typed-query-builder/builder';
import { RunFunctions } from '../Functions';


RunFunctions.lower = (x: string): string =>
{
  return x.toLowerCase();
};

RunFunctions.upper = (x: string): string =>
{
  return x.toUpperCase();
};

RunFunctions.trim = (x: string): string =>
{
  return x.trim();
};

RunFunctions.trimLeft = (x: string): string =>
{
  return x.trimLeft();
};

RunFunctions.trimRight = (x: string): string =>
{
  return x.trimRight();
};

RunFunctions.concat = (...values: string[]): string =>
{
  return values.join('');
};

RunFunctions.length = (x: string): number =>
{
  return x.length;
};

RunFunctions.indexOf = (x: string, search: string): number =>
{
  return x.indexOf(search) + 1;
};

RunFunctions.substring = (x: string, start: number, length?: number): string =>
{
  return x.substring(start, isNumber(length) ? start + length : undefined);
};

RunFunctions.regexGet = (x: string, regex: string): string =>
{
  return new RegExp(regex).exec(x)?.[0] || '';
};

RunFunctions.regexReplace = (x: string, pattern: string, replacement: string, flags?: string): string =>
{
  return x.replace(new RegExp(pattern, flags), replacement);
};

RunFunctions.char = (n: number): string =>
{
  return String.fromCharCode(n);
};

RunFunctions.join = (separator: string, ...values: string[]): string =>
{
  return values.join(separator);
};

RunFunctions.format = (format: string, ...values: string[]): string =>
{
  // NOT supported at the moment.
  return '';
};

RunFunctions.left = (x: string, n: number): string =>
{
  return x.substring(0, n);
};

RunFunctions.right = (x: string, n: number): string =>
{
  return x.substring(x.length - n);
};

RunFunctions.padLeft = (x: string, length: number, padding?: string): string =>
{
  const remaining = length - x.length;

  if (remaining <= 0) return x;

  const pad = padding || ' ';
  const repeated = RunFunctions.repeat(pad, Math.ceil(remaining / pad.length));

  return repeated.substring(0, remaining) + x;
};

RunFunctions.padRight = (x: string, length: number, padding?: string): string =>
{
  const remaining = length - x.length;

  if (remaining <= 0) return x;

  const pad = padding || ' ';
  const repeated = RunFunctions.repeat(pad, Math.ceil(remaining / pad.length));

  return x + repeated.substring(0, remaining);
};

RunFunctions.md5 = (x: string): string =>
{
  // NOT supported at the moment.
  return '';
};

RunFunctions.repeat = (x: string, n: number): string =>
{
  let r = '';

  while (--n >= 0) {
    r += x;
  }

  return r;
};

RunFunctions.replace = (x: string, from: string, to: string): string =>
{
  return x.split(from).join(to);
};

RunFunctions.reverse = (x: string): string =>
{
  return x.split('').reverse().join('');
};

RunFunctions.startsWith = (x: string, y: string): boolean =>
{
  return y.length <= x.length && x.substring(0, y.length) === y;
};