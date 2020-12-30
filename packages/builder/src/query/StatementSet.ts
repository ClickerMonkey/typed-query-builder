import { SourceTable, Tuple, SelectsKey, Selects, SelectsTupleEquivalent } from '../internal';


export class StatementSet<S extends Selects>
{
  
  public constructor(
    public table: SourceTable<any, any, any>,
    public set: Tuple<SelectsKey<S>>,
    public value: SelectsTupleEquivalent<S>
  ) {
    
  }

}
