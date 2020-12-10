import { DataTypeInputMap, DataTypeInputMapTypes } from '../../DataTypes';
import { isArray } from '../../fns';
import { AppendObjects, Name, Simplify, UnionToTuple } from '../../_Types';
import { ExprField } from '../exprs/Field';
import { SourceBase } from './Base';
import { SourceFields } from './Source';



export function defineSource<A extends Name, F extends DataTypeInputMap>(input: SourceTypeInput<A, F>): SourceType<A, Simplify<DataTypeInputMapTypes<F>>, F> {
  return new SourceType(input);
}

export interface SourceTypeInput<A extends Name, F extends DataTypeInputMap>
{
  name: A;
  table?: string;
  primary?: Array<keyof F>;
  fields: F;
  fieldColumn?: {
    [P in keyof F]?: string;
  };
}


export class SourceType<A extends Name, T, F extends DataTypeInputMap> extends SourceBase<A, T> 
{

  public table: Name;
  public primary: Name[];
  public fields: F;
  public fieldColumn: { [P in keyof F]?: string };
  public select: SourceFields<T>;

  public constructor(input: SourceTypeInput<A, F>) {
    super( input.name );

    this.fields = input.fields;
    this.fieldColumn = input.fieldColumn || {};
    this.table = input.table || input.name;
    this.primary = input.primary || [Object.keys(input.fields)[0]];
    this.select = Object.create(null);
    for (const field in input.fields) {
      (this.select as any)[field] = new ExprField(input.name, field);
    }
  }

  public all(): UnionToTuple<SourceFields<T>[keyof T]> {
    return Object.values(this.select) as any;
  }

  public only<C extends keyof T>(only: C[]): UnionToTuple<SourceFields<T>[C]>
  public only<C extends keyof T>(...only: C[]): UnionToTuple<SourceFields<T>[C]>
  public only<C extends keyof T>(...args: any[]): UnionToTuple<SourceFields<T>[C]> {
    const only: C[] = isArray(args[0])
      ? args[0]
      : args;

    return only.map( (field) => this.select[field] ) as any;
  }

  public except<C extends keyof T>(exclude: C[]): UnionToTuple<SourceFields<T>[Exclude<keyof T, C>]>
  public except<C extends keyof T>(...exclude: C[]): UnionToTuple<SourceFields<T>[Exclude<keyof T, C>]>
  public except<C extends keyof T>(...args: any[]): UnionToTuple<SourceFields<T>[Exclude<keyof T, C>]> {
    const exclude: C[] = isArray(args[0])
      ? args[0]
      : args;

    return Object.values<ExprField<keyof T, T[keyof T]>>(this.select).filter( (field) => exclude.indexOf(field.alias as any) === -1 ) as any;
  }

  public as<E extends Name>(alias: E): SourceType<E, T, F> {
    return this.extend({ name: alias, fields: {} }) as any;
  }

  public extend<E extends Name, EF extends DataTypeInputMap>(input: SourceTypeInput<E, EF>): SourceType<E, AppendObjects<T, DataTypeInputMapTypes<EF>>, AppendObjects<F, EF>> {
    return new SourceType({
      name: input.name,
      table: input.table,
      fields: {
        ...this.fields,
        ...input.fields,
      },
      fieldColumn: {
        ...this.fieldColumn,
        ...(input.fieldColumn || {}),
      },
    } as any) as any;
  }

  public getFields(): SourceFields<T> {
    return this.select;
  }
  
}