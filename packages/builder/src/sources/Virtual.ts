import { Name, Selects, NamedSourceBase, NamedSource, Source, isName } from '../internal';


export class SourceVirtual<N extends Name, S extends Selects> extends NamedSourceBase<N, S> 
{

  public constructor(named: NamedSource<N, S>) 
  public constructor(name: N, source: Source<S>) 
  public constructor(name: N | NamedSource<N, S>, source?: Source<S>) 
  {
    super( 
      isName(name) ? name : name.getName(),
      isName(name) ? source as Source<S> : name.getSource()
    );
  }

  public isVirtual(): boolean
  {
    return true;
  }

}