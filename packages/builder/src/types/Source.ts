import { ExprField } from '../exprs';
import { NamedSource, Source } from '../sources';
import { Name } from './Query';
import { Cast, MergeObjects, Simplify, UnionToIntersection } from './Core';
import { ObjectFromSelects, Selects, SelectsOptional, SelectsKey, SelectsWithKey, SelectsMap, SelectsNameless } from './Select';


export type Sources = { [source: string]: Selects };

export type SourcesSelectsOptional<T extends Sources> = {
  [K in keyof T]: Cast<SelectsOptional<T[K]>, Selects>
};
  
export type SourcesSelects<S extends Sources> = {
  [K in keyof S]: S[K] extends Source<infer X> ? X : never;
};
  
export type SourceFields<T> = {
  [P in keyof T]: ExprField<P, T[P]>;
};

export type SourceFieldsFromSelects<S extends Selects> = 
  Required<SourceFields<ObjectFromSelects<S>>>;

export type SourcesFields<S extends Sources> = {
  [P in keyof S]: SourceFields<S[P]>
};

export type SourcesCast<S> = 
  S extends Sources
    ? S
    : never
;

export type SourcesFieldsFactory<S extends Sources> = {
  [P in keyof S]: SourceFieldsFactory<S[P]>
};

export interface SourceFieldsFunctions<S extends Selects>
{
  all(): S;

  only(): [];
  only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, unknown extends C ? never : C>;
  only<C extends SelectsKey<S> = never>(...only: C[]): SelectsWithKey<S, C>;

  exclude<C extends SelectsKey<S>>(): S
  exclude<C extends SelectsKey<S>>(exclude: []): S
  exclude<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>>;
  exclude<C extends SelectsKey<S> = never>(...exclude: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>>;

  mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M>;
}

export type SourceCompatible<S extends Selects> = 
  Source<SelectsNameless<S>>;

export type SourceFieldsFactory<S extends Selects> = 
  Simplify<MergeObjects<SourceFieldsFunctions<S>, SourceFieldsFromSelects<S>>>;

export type SourceForType<T extends Sources> = { 
  [K in keyof T]: T[K] extends Selects ? NamedSource<K, T[K]> : never;
};

export type SourceInstanceFromTuple<S extends NamedSource<any, any>[]> = 
  UnionToIntersection<{
    [P in keyof S]: S[P] extends NamedSource<infer N, infer T> 
      ? Record<N, T> 
      : never;
  }[number]>
;

export type NamedSourceRecord<T> = 
  T extends NamedSource<infer N, infer S>
    ? Record<N, S>
    : never
;

export type NamedSourcesRecord<T extends NamedSource<any, any>[]> = 
  Cast<UnionToIntersection<{
    [I in keyof T]: NamedSourceRecord<T[I]>
  }[number]>, Sources>
;

export type MaybeSources<A extends Sources, B extends Sources> = 
  Simplify<MergeObjects<A, SourcesSelectsOptional<B>>>
;

export type JoinedInner<T extends Sources, JN extends Name, JT extends Selects> = 
  Simplify<MergeObjects<T, Record<JN, JT>>>
;

export type JoinedLeft<T extends Sources, JN extends Name, JT extends Selects> = 
  Simplify<MergeObjects<T, Record<JN, SelectsOptional<JT>>>>
;

export type JoinedRight<T extends Sources, JN extends Name, JT extends Selects> = 
  Simplify<Cast<MergeObjects<SourcesSelectsOptional<T>, Record<JN, JT>>, Sources>>
;

export type JoinedFull<T extends Sources, JN extends Name, JT extends Selects> = 
  Simplify<Cast<MergeObjects<SourcesSelectsOptional<T>, Record<JN, SelectsOptional<JT>>>, Sources>>
;

