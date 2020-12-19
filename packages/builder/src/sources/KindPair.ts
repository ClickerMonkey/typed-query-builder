import { Name, Selects, SourceKind, NamedSource } from '../internal';


export class SourceKindPair<N extends Name, S extends Selects>
{

  public constructor(
    public kind: SourceKind,
    public source: NamedSource<N, S>
  ) {
    
  }

}