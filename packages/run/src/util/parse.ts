import { DataBox, DataCircle, DataGeometry, DataInterval, DataLine, DataPath, DataPoint, DataPolygon, DataSegment, DataTemporal, isArray, isDate, isNumber, isObject, isString } from '@typed-query-builder/builder';



export function parseTemporal(x: any, copy: boolean = false): DataTemporal 
{
  if (x instanceof DataTemporal)
  {
    return copy ? DataTemporal.fromObject(x) : x;
  }

  if (isDate(x)) 
  {
    return DataTemporal.fromDate(x);
  }

  if (isNumber(x)) 
  {
    return DataTemporal.fromUnixEpoch(x);
  }

  if (isString(x)) 
  {
    return DataTemporal.fromText(x);
  }

  return DataTemporal.fromText('');
}

export function parseBuffer(x: any): Buffer
{
  if (isString(x))
  {
    return Buffer.from(x, 'hex');
  }

  if (isArray<number>(x))
  {
    return Buffer.from(x);
  }

  if (x instanceof ArrayBuffer || x instanceof SharedArrayBuffer || x instanceof Uint8Array)
  {
    return Buffer.from(x);
  }

  return Buffer.from('', 'hex');
}

export function parseGeometry<T extends DataGeometry<any>>(type: { new(): T })
{
  return (input: any): T => 
  {
    if (input instanceof type)
    {
      return input;
    }

    const parsed = new type().clear().set(input);

    return parsed;
  };
}

export function parseInterval(x: any): DataInterval
{
  if (x instanceof DataInterval)
  {
    return x;
  }

  if (isObject(x) && ('seconds' in x || 'minutes' in x || 'hours' in x || 'days' in x || 'months' in x || 'years' in x))
  {
    return DataInterval.from(x);
  }

  return DataInterval.from({});
}

export function parseGenericGeometry(input: any): DataGeometry<any> | null
{
  if (input instanceof DataGeometry)
  {
    return input;
  }

  if (!isObject(input))
  {
    return null;
  }

  if (isNumber(input.r) && isNumber(input.x) && isNumber(input.y))
  {
    return new DataCircle(input.x, input.y, input.r);
  }
  
  if (isNumber(input.x) && isNumber(input.y))
  {
    return new DataPoint(input.x, input.y);
  }
  
  if (isNumber(input.x1) && isNumber(input.y1) && isNumber(input.x2) && isNumber(input.y2))
  {
    return new DataSegment(input.x1, input.y1, input.x2, input.y2);
  }

  if (isNumber(input.a) && isNumber(input.b) && isNumber(input.c))
  {
    return new DataLine(input.a, input.b, input.c);
  }

  if (isNumber(input.minX) && isNumber(input.minY) && isNumber(input.maxX) && isNumber(input.maxY))
  {
    return new DataBox(input.minX, input.minY, input.maxX, input.maxY);
  }

  if (isArray(input.points))
  {
    return new DataPath(input.points);
  }

  if (isArray(input.corners))
  {
    return new DataPolygon(input.corners);
  }

  return null;
}