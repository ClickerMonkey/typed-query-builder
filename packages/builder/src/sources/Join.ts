import { Name, JoinType, Selects } from '../Types';
import { Expr } from '../exprs/Expr';
import { Source } from './Source';
import { NamedSourceBase } from './NamedBase';


export class SourceJoin<N extends Name, S extends Selects> extends NamedSourceBase<N, S>
{

  public constructor(
    name: N,
    source: Source<S>,
    public type: JoinType,
    public condition: Expr<boolean>
  ) {
    super( name, source );
  }

}