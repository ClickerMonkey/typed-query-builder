import { Name, Selects, NamedSourceBase, Source, Traverser, Expr } from '../internal';


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

  public isVirtual(): boolean
  {
    return true;
  }

  public traverse<R>(traverse: Traverser<Expr<unknown>, R>): R 
  {
    traverse.step('initial', this.source);
    traverse.step('recursive', this.source);

    return traverse.getResult();
  }

}