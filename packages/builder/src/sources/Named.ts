import { Name, Selects, SourceFieldsFactory, SourceFieldsFromSelects, Source, Traversable, Expr } from "../internal";


export interface NamedSource<N extends Name, S extends Selects> extends Traversable<Expr<unknown>>
{
    getName(): N;
    getSource(): Source<S>;
    getFields(): SourceFieldsFromSelects<S>;
    getFieldsFactory(): SourceFieldsFactory<S>;
}