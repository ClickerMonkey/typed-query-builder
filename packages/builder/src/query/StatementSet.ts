import { Selects, SelectsTupleEquivalent } from '../internal';


export class StatementSet<S extends Selects>
{
  
  public constructor(
    public set: S,
    public value: SelectsTupleEquivalent<S>
  ) {
    
  }

}
