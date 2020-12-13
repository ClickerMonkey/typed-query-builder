import { Name, Selects, SourceFieldsFromSelects } from "../Types";
import { NamedSource } from "./Named";
import { Source } from "./Source";
import { createFields } from '../fns';


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
    return createFields(this.name, this.source.getSelects());
  }

}