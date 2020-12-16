import { Name, SourceFieldsFromSelects } from '.';
import { ExprField } from './exprs';
import { SelectAliased } from './select/Aliased';
import { NamedSource } from './sources';
import { ObjectKeys, Selects, SourceFieldsFactory, SourceFieldsFunctions } from './Types';

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

export function createFields<N extends Name, S extends Selects>(source: NamedSource<N, S>, selects: S): SourceFieldsFromSelects<S>
{
  return selects.reduce((fields, select) => 
  {
    fields[select.alias] = new ExprField(source as any, select.alias);

    return fields;
  }, {} as SourceFieldsFromSelects<S>);
}

export function createFieldsFactory<S extends Selects>(selects: S, fields: SourceFieldsFromSelects<S>): SourceFieldsFactory<S> 
{
  const fns: SourceFieldsFunctions<S> = {
    all: () => selects,
    only: (...onlyInput: any[]) => {
      const only = isArray(onlyInput[0]) ? onlyInput[0] : onlyInput;

      return only.map( (field) => fields[field] ) as any;
    },
    exclude: (...excludeInput: any[]) => {
      const exclude = isArray(excludeInput[0]) ? excludeInput[0] : excludeInput;

      return selects.filter( s => exclude.indexOf(s.alias) === -1 ) as any;
    },
    mapped: (map) => {
      const out = [];

      for (const prop in map)
      {
        out.push(new SelectAliased(prop, fields[map[prop] as any]));
      }
  
      return out as any;
    },
  };

  return Object.assign(fns, fields) as any;
}