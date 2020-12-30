import { Name, JoinType, Selects, NamedSourceBase, NamedSource, ExprScalar } from '../internal';


export class SourceJoin<N extends Name, S extends Selects> extends NamedSourceBase<N, S>
{

  public constructor(
    source: NamedSource<N, S>,
    public type: JoinType,
    public condition: ExprScalar<boolean>
  ) {
    super( source.getName(), source.getSource() );
  }
  
  public isSource(other: NamedSource<any, any>): boolean
  {
    return (this as any) === other || (this.getSource() as any) === other;
  }

}