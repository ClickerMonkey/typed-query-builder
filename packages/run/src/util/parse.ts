import { isDate, isNumber, isString } from '@typed-query-builder/builder';



export function parseDate(x: any) 
{
  if (isDate(x)) 
  {
    return x;
  }

  if (isNumber(x)) 
  {
    return new Date(x);
  }

  if (isString(x)) 
  {
    return new Date(Date.parse(x));
  }
  
  return new Date();
}
