import { LockRowLock, LockStrength, SourceTable } from '../internal';


export class Lock
{

  public constructor(
    public strength: LockStrength,
    public sources: SourceTable<any, any, any>[] = [],
    public rowLock?: LockRowLock
  ) {

  }

}