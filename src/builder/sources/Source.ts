import { isArray } from '../../fns';
import { Name, SourceInstance, Sources, UnionToIntersection, UnionToTuple } from '../../_Types';
import { ExprField } from '../exprs/Field';
import { Select } from '../select/Select';


export type SourcesSelects<S extends Sources> = {
  [K in keyof S]: {
    [F in keyof S[K]]: Select<F, S[K][F]>;
  }
};

export type SourceFields<T> = {
  [P in keyof T]: ExprField<P, T[P]>;
};

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

export type SourceForType<T> = { 
  [K in keyof T]: Source<K, T[K]> 
};


export type SourceInstanceFromTuple<S extends Source<any, any>[]> = UnionToIntersection<{
  [P in keyof S]: S[P] extends Source<infer N, infer T> 
    ? Record<N, T> 
    : never;
}[number]>;

export interface Source<A extends Name, T extends SourceInstance>
{
  alias: A;
  inferredType?: T[];
  
  getFields(): SourceFields<T>;
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