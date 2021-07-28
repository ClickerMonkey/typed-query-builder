import { Name, JoinType, Selects, NamedSourceBase, NamedSource, ExprScalar, _Boolean } from '../internal';


export class SourceJoin<N extends Name, S extends Selects> extends NamedSourceBase<N, S>
{

  public virtual: boolean;

  public constructor(
    source: NamedSource<N, S>,
    public type: JoinType,
    public condition: ExprScalar<_Boolean>,
  ) {
    super( source.getName(), source.getSource(), source.getSelects() );

    this.virtual = source.isVirtual();
  }
  
  public isSource(other: NamedSource<any, any>): boolean
  {
    return (this as any) === other || (this.getSource() as any) === other;
  }

  public isVirtual(): boolean
  {
    return this.virtual;
  }

}