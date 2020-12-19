import { DataTypeInputMap, DataTypeInputMapSelects } from '../DataTypes';
import { isArray } from '../fns';
import { TupleAppend, Name, Selects, MergeObjects, SourceFieldsFromSelects, SourceFieldsFunctions, SourceFieldsFactory, SelectsKey, SelectsWithKey, SelectsMap } from '../types';
import { Source } from './Source';
import { NamedSource } from './Named';
import { ExprKind } from '../Kind';
import { ExprField } from '../exprs';
import { SelectAliased } from '../select';


export interface SourceTableInput<N extends Name, F extends DataTypeInputMap>
{
  name: N;
  table?: string;
  primary?: Array<keyof F>;
  fields: F;
  fieldColumn?: {
    [P in keyof F]?: string;
  };
}

export class SourceTable<N extends Name, S extends Selects, F extends DataTypeInputMap> extends Source<S> implements NamedSource<N, S>, SourceFieldsFunctions<S>
{
  
  public static create<N extends Name, F extends DataTypeInputMap>(input: SourceTableInput<N, F>): SourceTable<N, DataTypeInputMapSelects<F>, F> 
  {
    return new SourceTable(input);
  }

  public name: N;
  public table: Name;
  public primary: Name[];
  public fieldType: F;
  public fieldColumn: { [P in keyof F]?: string };
  public fields: SourceFieldsFactory<S>;
  protected fieldMap: SourceFieldsFromSelects<S>;
  protected selects: S;

  public constructor(input: SourceTableInput<N, F>) {
    super();

    this.name = input.name;
    this.table = input.table || input.name;
    this.fieldType = input.fields;
    this.fieldColumn = input.fieldColumn || {};
    this.primary = input.primary || [Object.keys(input.fields)[0]];
    this.selects = Object.keys(input.fields).map( field => new ExprField( this as any, field ) ) as any;
    this.fieldMap = ExprField.createFields(this as any, this.selects);
    this.fields = ExprField.createFieldsFactory(this.selects, this.fieldMap);
  }

  public getKind(): ExprKind {
    return ExprKind.TABLE;
  }

  public getSelects(): S {
    return this.selects;
  }

  public getName(): N {
    return this.name;
  }

  public getSource(): Source<S> {
    return this;
  }

  public getFields(): SourceFieldsFromSelects<S> {
    return this.fieldMap;
  }

  public getFieldsFactory(): SourceFieldsFactory<S> {
    return this.fields;
  }

  public extend<E extends Name, EF extends DataTypeInputMap>(input: SourceTableInput<E, EF>): SourceTable<E, TupleAppend<S, DataTypeInputMapSelects<EF>>, MergeObjects<F, EF>> {
    return new SourceTable({
      name: input.name,
      table: input.table || this.table,
      primary: input.primary,
      fields: {
        ...this.fieldType,
        ...input.fields,
      },
      fieldColumn: {
        ...this.fieldColumn,
        ...(input.fieldColumn || {}),
      },
    } as any) as any;
  }

  public all(): S {
    return this.selects;
  }
  
  public only(): []
  public only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, unknown extends C ? never : C>
  public only<C extends SelectsKey<S> = never>(...onlyInput: C[]): SelectsWithKey<S, C>
  public only(...onlyInput: any[]): never {
    const only = (isArray(onlyInput[0]) ? onlyInput[0] : onlyInput);

    return only.map( (field) => this.fieldMap[field as any] ) as never;
  }

  public exclude(): S
  public exclude(exclude: []): S
  public exclude<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>>
  public exclude<C extends SelectsKey<S> = never>(...excludeInput: C[]): SelectsWithKey<S, Exclude<SelectsKey<S>, C>> 
  public exclude(...excludeInput: any[]): never {
    const exclude = (isArray(excludeInput[0]) ? excludeInput[0] : excludeInput);

    return this.selects.filter( s => exclude.indexOf(s.alias as any) === -1 ) as never;
  }

  public mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M> {
    const out = [];

    for (const prop in map)
    {
      out.push(new SelectAliased(prop, this.fieldMap[map[prop] as any]));
    }

    return out as any;
  }
  
}