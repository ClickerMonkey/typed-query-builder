import { Name, Selects, SourceFieldsFromSelects } from "..";
import { Source } from "./Source";


export interface NamedSource<A extends Name, S extends Selects>
{
    getName(): A;
    getSource(): Source<S>;
    getFields(): SourceFieldsFromSelects<S>;
}