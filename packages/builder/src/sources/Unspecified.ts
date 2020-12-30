import { ExprKind, Source } from '../internal';


export class SourceUnspecified extends Source<[]>
{

    public getKind(): ExprKind 
    {
        return ExprKind.TABLE_UNSPECIFIED;
    }

    public getSelects(): [] 
    {
        return [];
    }

}