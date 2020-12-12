import { Name, ObjectFromSelects, Selects } from '../Types';
import { Source, SourceFieldsFromSelects } from './Source';


export abstract class SourceBase<A extends Name, T extends Selects> implements Source<A, T>
{

  public inferredType?: ObjectFromSelects<T>[];

  public constructor(
    public alias: A,
  ) {

  }

  public abstract getFields(): SourceFieldsFromSelects<T>;

}