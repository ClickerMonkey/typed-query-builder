import { isArray } from '../fns';
import { Name, Selects, ObjectFromSelects, Sources, UnionToIntersection, UnionToTuple } from '../Types';
import { ExprField } from '../exprs/Field';



export type SourcesSelects<S extends Sources> = {
  [K in keyof S]: S[K] extends Source<any, infer X> ? X : never;
};

export type SourceFields<T> = {
  [P in keyof T]: ExprField<P, T[P]>;
};

export type SourceFieldsFromSelects<S extends Selects> = SourceFields<ObjectFromSelects<S>>;

export type SourcesFields<S extends Sources> = {
  [P in keyof S]: SourceFields<S[P]>
};

export type SourcesCast<S> = 
  S extends Sources
    ? S
    : never;

export type SourcesFieldsFactory<S extends Sources> = {
  [P in keyof S]: SourceFieldsFactory<S[P]>
};

export interface SourceFieldsFunctions<T>
{
  all(): UnionToTuple<SourceFields<T>[keyof T]>;
  only<C extends keyof T>(only: C[]): UnionToTuple<SourceFields<T>[C]>;
  only<C extends keyof T>(...only: C[]): UnionToTuple<SourceFields<T>[C]>;
  except<C extends keyof T>(exclude: C[]): UnionToTuple<SourceFields<T>[Exclude<keyof T, C>]>;
  except<C extends keyof T>(...exclude: C[]): UnionToTuple<SourceFields<T>[Exclude<keyof T, C>]>;
}

export type SourceFieldsFactory<T> = SourceFields<T> & SourceFieldsFunctions<T>;

export type SourceForType<T extends Sources> = { 
  [K in keyof T]: T[K] extends Selects ? Source<K, T[K]> : never;
};


export type SourceInstanceFromTuple<S extends Source<any, any>[]> = UnionToIntersection<{
  [P in keyof S]: S[P] extends Source<infer N, infer T> 
    ? Record<N, T> 
    : never;
}[number]>;

export interface Source<A extends Name, S extends Selects>
{
  alias: A;
  inferredType?: ObjectFromSelects<S>[];
  
  getFields(): SourceFieldsFromSelects<S>;
}

export function createFieldsFactory<T>(fields: SourceFields<T>): SourceFieldsFactory<T> {

  const fns: SourceFieldsFunctions<T> = {
    all: () => Object.values(fields) as any,

    only: (...onlyInput: any[]) => {
      const only = isArray(onlyInput[0]) ? onlyInput[0] : onlyInput;
  
      return only.map( (field) => fields[field] ) as any;
    },

    except: (...exceptInput: any[]) => {
      const except = isArray(exceptInput[0]) ? exceptInput[0] : exceptInput;
      const keys = Object.keys(fields).filter( (field) => except.indexOf(field) === -1 );

      return keys.map( (field) => fields[field] ) as any;
    },
  };

  return Object.assign(fns, fields);
}