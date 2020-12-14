import { Name, Selects, SourceFieldsFactory, SourceFieldsFromSelects } from "..";
import { Source } from "./Source";


export interface NamedSource<N extends Name, S extends Selects>
{
    getName(): N;
    getSource(): Source<S>;
    getFields(): SourceFieldsFromSelects<S>;
    getFieldsFactory(): SourceFieldsFactory<S>;
}