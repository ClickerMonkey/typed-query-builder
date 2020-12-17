import { Name, JoinType, Selects } from '../types';
import { NamedSourceBase } from './NamedBase';
import { NamedSource } from './Named';
import { ExprScalar } from '../exprs';


export class SourceJoin<N extends Name, S extends Selects> extends NamedSourceBase<N, S>
{

  public constructor(
    source: NamedSource<N, S>,
    public type: JoinType,
    public condition: ExprScalar<boolean>
  ) {
    super( source.getName(), source.getSource() );
  }

}