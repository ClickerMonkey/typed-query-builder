import { 
  DataTypeInputMap, DataTypeInputMapSelects, TupleAppend, Name, Selects, MergeObjects, SourceFieldsFromSelects, 
  SourceFieldsFunctions, SourceFieldsFactory, SelectsKey, SelectsWithKey, SelectsMap, Source, NamedSource, ExprKind, 
  ExprField, SelectAliased, SelectsWithKeyPrefixed, TextModifyType, modifyText, SourceFunction, toExprDeep, ExprInput
} from '../internal';


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

  public static readonly id = ExprKind.TABLE;
  
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

  public getKind(): ExprKind 
  {
    return ExprKind.TABLE;
  }

  public isSimple(): boolean
  {
    return true;
  }

  public isVirtual(): boolean
  {
    return false;
  }

  public isSource(other: NamedSource<any, any> | Source<any>): boolean
  {
    return (this as any) === other;
  }

  public getSelects(): S 
  {
    return this.selects;
  }

  public getName(): N 
  {
    return this.name;
  }

  public getSource(): Source<S> 
  {
    return this;
  }

  public getFields(): SourceFieldsFromSelects<S> 
  {
    return this.fieldMap;
  }

  public getFieldsFactory(): SourceFieldsFactory<S> 
  {
    return this.fields;
  }

  public getFieldTarget(field: string): string
  {
    return this.fieldColumn[field] || field;
  }

  public hasColumn(column: string): boolean
  {
    for (const field in this.fieldColumn)
    {
      if (this.fieldColumn[field] === column)
      {
        return true;
      }
    }

    return !!this.fieldMap[column] && !this.fieldColumn[column];
  }

  public extend<E extends Name, EF extends DataTypeInputMap>(input: SourceTableInput<E, EF>): SourceTable<E, TupleAppend<S, DataTypeInputMapSelects<EF>>, MergeObjects<F, EF>> 
  {
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

  public all(): S 
  public all<P extends string>(prefix: P): SelectsWithKeyPrefixed<S, any, P>
  public all<P extends string, T extends TextModifyType>(prefix: P, modify: T): SelectsWithKeyPrefixed<S, any, P, T> 
  public all(prefix: string = '', modify: TextModifyType = 'NONE'): never 
  {
    return this.mapSelects(this.selects, prefix, modify) as never;
  }
  
  public only(): []
  public only<C extends SelectsKey<S>>(only: C[]): SelectsWithKey<S, unknown extends C ? never : C>
  public only<C extends SelectsKey<S>, P extends string>(only: C[], prefix: P): SelectsWithKeyPrefixed<S, unknown extends C ? never : C, P>
  public only<C extends SelectsKey<S>, P extends string, T extends TextModifyType>(only: C[], prefix: P, modify: T): SelectsWithKeyPrefixed<S, unknown extends C ? never : C, P, T>
  public only(onlyInput?: string[], prefix: string = '', modify: TextModifyType = 'NONE'): never 
  {
    const only = onlyInput
      ? onlyInput.map( (field) => this.fieldMap[field as any] )
      : [];

    return this.mapSelects(only, prefix, modify) as never;
  }

  public exclude(): S
  public exclude(exclude: []): S
  public exclude<C extends SelectsKey<S>>(exclude: C[]): SelectsWithKey<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>>
  public exclude<C extends SelectsKey<S>, P extends string>(exclude: C[], prefix: P): SelectsWithKeyPrefixed<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>, P>;
  public exclude<C extends SelectsKey<S>, P extends string, T extends TextModifyType>(exclude: C[], prefix: P, modify: T): SelectsWithKeyPrefixed<S, unknown extends C ? SelectsKey<S> : Exclude<SelectsKey<S>, C>, P, T>;
  public exclude(excludeInput?: string[], prefix: string = '', modify: TextModifyType = 'NONE'): never 
  {
    const exclude = excludeInput
      ? this.selects.filter( s => excludeInput.indexOf(s.alias as any) === -1 )
      : this.selects;

    return this.mapSelects(exclude, prefix, modify) as never;
  }

  protected mapSelects(selects: Selects, prefix: string = '', modify: TextModifyType = 'NONE'): Selects 
  {
    if (!prefix && modify === 'NONE') 
    {
      return selects;
    } 
    else 
    {
      return selects.map( (s) => new SelectAliased(prefix + modifyText(String(s.alias), modify), s) );
    }
  }

  public mapped<K extends SelectsKey<S>, M extends Record<string, K>>(map: M): SelectsMap<S, K, M> 
  {
    const out = [];

    for (const prop in map)
    {
      out.push(new SelectAliased(prop, this.fieldMap[map[prop] as any]));
    }

    return out as any;
  }

  public call(params: Record<string, ExprInput<any>>): SourceFunction<N, S, F>
  {
    return new SourceFunction(this, toExprDeep(params));
  }
  
}