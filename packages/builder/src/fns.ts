import { Select } from './select';
import { SelectAliased } from './select/Aliased';
import { ObjectKeys, Selects, SelectsRecord, SourceFields, SourceFieldsFactory, SourceFieldsFunctions } from './Types';

export function isString(x: any): x is string 
{
  return typeof x === 'string';
}

export function isNumber(x: any): x is number 
{
  return typeof x === 'number' && isFinite(x);
}

export function isDate(x: any): x is Date 
{
  return x instanceof Date;
}

export function isBoolean(x: any): x is boolean 
{
  return typeof x === 'boolean';
}

export function isArray<T = any>(x: any): x is T[] 
{
  return Array.isArray(x);
}

export function isFunction<T extends (...args: any[]) => any>(x: any): x is T 
{
  return typeof x === 'function';
}

export function mapRecord<M, O>(map: M, mapper: <K extends keyof M>(value: M[K], key: K) => O): { [P in keyof M]: O } 
{
  const mapped = Object.create(null);

  for (const prop in map) 
  {
    mapped[prop] = mapper(map[prop], prop);
  }
  
  return mapped;
}

export function keys<T>(object: T): ObjectKeys<T>
{
  return Object.keys(object) as ObjectKeys<T>;
}

export function createFieldsFactory<T extends Selects>(selects: T): SourceFieldsFactory<T> 
{
  const selectMap = selects.reduce((map, select) => {
    map[select.alias as string] = select;

    return map;
  }, Object.create(null) as SelectsRecord<T>);

  const all: SourceFieldsFunctions<T>['all'] = () => selects;

  const only: SourceFieldsFunctions<T>['only'] = (...onlyInput: any[]) => 
  {
    const _only = isArray(onlyInput[0]) ? onlyInput[0] : onlyInput;

    return _only.map( (field) => selectMap[field] ) as any;
  };

  const except: SourceFieldsFunctions<T>['except'] = (...exceptInput: any[]) => 
  {
    const _except = isArray(exceptInput[0]) ? exceptInput[0] : exceptInput;

    return selects.filter( s => _except.indexOf(s.alias) === -1 ) as any;
  };

  const mapped: SourceFieldsFunctions<T>['mapped'] = (map) =>
  {
    const out = [];

    for (const prop in map)
    {
      out.push(new SelectAliased(prop, selectMap[map[prop] as any]));
    }

    return out as any;
  };

  const fns: SourceFieldsFunctions<T> = {
    all,
    _all: all,
    only,
    _only: only,
    except,
    _except: except,
    mapped,
    _mapped: mapped,
  };

  return Object.assign(fns, selectMap) as any;
}