import { Name, JoinType, SourceInstance } from '../../_Types';
import { Expr } from '../exprs/Expr';
import { SourceBase } from './Base';
import { Source, SourceFields } from './Source';


export class SourceJoin<A extends Name, T extends SourceInstance> extends SourceBase<A, T> 
{

  public constructor(
    public source: Source<A, T>,
    public type: JoinType,
    public condition: Expr<boolean>
  ) {
    super( source.alias );
  }

  public getFields(): SourceFields<T> {
    return this.source.getFields();
  }

}