import { ExprKind } from '../Kind';
import { Source } from './Source';


export class SourceUnspecified extends Source<[]>
{

    public getKind(): ExprKind {
        return ExprKind.TABLE_UNSPECIFIED;
    }

    public getSelects(): [] {
        return [];
    }

}