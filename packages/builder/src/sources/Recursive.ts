import { Name, Selects, NamedSourceBase, Source } from '../internal';


export class SourceRecursive<N extends Name, S extends Selects> extends NamedSourceBase<N, S> 
{

  public constructor(
    name: N,
    initial: Source<S>, // insert returning, delete returning, select, update returning, values
    public recursive: Source<S>,
    public all: boolean = false
  ) {
    super( name, initial );
  }

}