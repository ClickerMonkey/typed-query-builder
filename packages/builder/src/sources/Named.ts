import { Name, Selects, SourceFieldsFactory, SourceFieldsFromSelects, Source, Traversable, Expr } from "../internal";


export interface NamedSource<N extends Name, S extends Selects> extends Traversable<Expr<unknown>>
{
    getName(): N;
    getSource(): Source<S>;
    getSelects(): S;
    getFields(): SourceFieldsFromSelects<S>;
    getFieldsFactory(): SourceFieldsFactory<S>;
    getFieldTarget(field: string): string;
    isVirtual(): boolean;
    isSource(other: NamedSource<any, any> | Source<any>): boolean;
}