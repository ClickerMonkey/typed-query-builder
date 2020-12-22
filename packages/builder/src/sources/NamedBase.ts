import { Expr } from 'exprs/Expr';
import { Traverser } from 'Traverser';
import { Name, Selects, SourceFieldsFromSelects, SourceFieldsFactory, NamedSource, Source, ExprField } from '../internal';


export class NamedSourceBase<N extends Name, S extends Selects> implements NamedSource<N, S>
{

  public constructor(
    public name: N,
    public source: Source<S>,
  ) {

  }

  public getName(): N {
    return this.name;
  }

  public getSource(): Source<S> {
    return this.source;
  }

  public getFields(): SourceFieldsFromSelects<S> {
    return ExprField.createFields(this, this.source.getSelects());
  }

  public getFieldsFactory(): SourceFieldsFactory<S> {
    return ExprField.createFieldsFactory(this.source.getSelects(), this.getFields());
  }

  public traverse<R>(traverse: Traverser<Expr<unknown>, R>): R {
    return this.source.traverse(traverse);
  }

}