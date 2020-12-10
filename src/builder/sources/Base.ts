import { Name, SourceInstance } from '../../_Types';
import { Source, SourceFields } from './Source';


export class SourceBase<A extends Name, T extends SourceInstance> implements Source<A, T>
{

  public inferredType?: T[];

  public constructor(
    public alias: A,
  ) {

  }

  public getFields(): SourceFields<T> {
    return Object.create(null);
  }

}