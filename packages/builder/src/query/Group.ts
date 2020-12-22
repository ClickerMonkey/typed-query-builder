import { Name, GroupingSetType } from '../internal';


export class QueryGroup<S extends Name>
{

  public constructor(
    public type: GroupingSetType,
    public expressions: S[][],
  ) {

  }

}