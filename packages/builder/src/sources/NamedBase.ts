import { 
  Expr, Traverser, Name, Selects, SourceFieldsFromSelects, SourceFieldsFactory, NamedSource, Source, ExprField, SourceTable
} from '../internal';


export class NamedSourceBase<N extends Name, S extends Selects> implements NamedSource<N, S>
{

  public constructor(
    public name: N,
    public source: Source<S>,
  ) {

  }

  public getName(): N 
  {
    return this.name;
  }

  public getSource(): Source<S> 
  {
    return this.source;
  }

  public getFields(): SourceFieldsFromSelects<S> 
  {
    return ExprField.createFields(this, this.source.getSelects());
  }

  public getFieldsFactory(): SourceFieldsFactory<S> 
  {
    return ExprField.createFieldsFactory(this.source.getSelects(), this.getFields());
  }

  public getFieldTarget(field: string): string
  {
    const source = this.source;

    return source instanceof SourceTable ? source.getFieldTarget(field) : field;
  }

  public isVirtual(): boolean
  {
    return false;
  }

  public isSource(other: NamedSource<any, any> | Source<any>): boolean
  {
    return (this as any) === other;
  }

  public traverse<R>(traverse: Traverser<Expr<unknown>, R>): R 
  {
    return this.source.traverse(traverse);
  }

}