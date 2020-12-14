import { QuerySelect } from './query/Select';
import { QueryInsert } from './query/Insert';
import { MergeObjects, Name, Selects, SelectsKeys, SourceFieldsFactory, SelectsFromTypeAndColumns, Sources, Simplify } from './Types';
import { DataTypeInputMap, DataTypeInputMapSelects } from './DataTypes';
import { SchemaInput, Source, SourceType, SourceValues } from './sources';



export function query<
  T extends Sources = {}, 
  S extends Selects = []
>(): QuerySelect<T, S> 
{
  return QuerySelect.create();
}

export function insert<
  W extends Sources = {}, 
  I extends Name = never,
  T extends Selects = [], 
  C extends SelectsKeys<T> = never,
  R extends Selects = []
>(): QueryInsert<W, I, T, C, R> {
  return new QueryInsert();
}

export function values<
  T extends Record<string, any>,
  C extends Array<keyof T>
>(constants: T[], columns?: C): Source<SelectsFromTypeAndColumns<T, C>> {
  return SourceValues.create(constants, columns);
}

export function schema<
  N extends Name, 
  F extends DataTypeInputMap
>(input: SchemaInput<N, F>): Simplify<MergeObjects<SourceType<N, DataTypeInputMapSelects<F>, F>, SourceFieldsFactory<DataTypeInputMapSelects<F>>>>
{
  const source = new SourceType(input);

  return Object.assign(source, source.getFieldsFactory()) as any;
}