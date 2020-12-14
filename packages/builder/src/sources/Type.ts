import { DataTypeInputMap, DataTypeInputMapSelects } from '../DataTypes';
import { createFields, createFieldsFactory } from '../fns';
import { AppendTuples, Name, Selects, MergeObjects, SourceFieldsFactory, SourceFieldsFromSelects } from '../Types';
import { Source } from './Source';
import { NamedSource } from './Named';
import { ExprKind } from '../Kind';
import { Schema, SchemaInput } from './Schema';



export class SourceType<A extends Name, S extends Selects, F extends DataTypeInputMap> extends Source<S> implements NamedSource<A, S>
{
  
  public static create<N extends Name, F extends DataTypeInputMap>(input: SchemaInput<N, F>): SourceType<N, DataTypeInputMapSelects<F>, F> 
  {
    return new SourceType(input);
  }


  public _schema: Schema<A, S, F>;

  public constructor(input: SchemaInput<A, F>) {
    super();

    this._schema = new Schema(input);
  }

  public getName(): A {
    return this._schema.name;
  }

  public getKind(): ExprKind {
    return ExprKind.TABLE;
  }

  public getSelects(): S {
    return this._schema.selects;
  }

  public getSource(): Source<S> {
    return this;
  }

  public getFields(): SourceFieldsFromSelects<S> {
    return createFields(this._schema.name, this.getSelects());
  }

  public getFieldsFactory(): SourceFieldsFactory<S> {
    return createFieldsFactory(this.getSelects(), this.getFields());
  }

  public extend<E extends Name, EF extends DataTypeInputMap>(input: SchemaInput<E, EF>): SourceType<E, AppendTuples<S, DataTypeInputMapSelects<EF>>, MergeObjects<F, EF>> {
    return new SourceType({
      name: input.name,
      table: input.table || this._schema.table,
      primary: input.primary,
      fields: {
        ...this._schema.fields,
        ...input.fields,
      },
      fieldColumn: {
        ...this._schema.fieldColumn,
        ...(input.fieldColumn || {}),
      },
    } as any) as any;
  }
  
}