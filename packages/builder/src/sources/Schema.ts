import { DataTypeInputMap } from "../DataTypes";
import { ExprField } from "../exprs/Field";
import { Name, Selects, SourceFieldsFromSelects } from "../Types";


export interface SchemaInput<N extends Name, F extends DataTypeInputMap>
{
  name: N;
  table?: string;
  primary?: Array<keyof F>;
  fields: F;
  fieldColumn?: {
    [P in keyof F]?: string;
  };
}

export class Schema<N extends Name, S extends Selects, F extends DataTypeInputMap>
{
    
  public name: N;
  public table: Name;
  public primary: Name[];
  public fields: F;
  public fieldColumn: { [P in keyof F]?: string };
  public selectMap: SourceFieldsFromSelects<S>;
  public selects: S;

  public constructor(input: SchemaInput<N, F>) 
  {
    this.name = input.name;
    this.fields = input.fields;
    this.fieldColumn = input.fieldColumn || {};
    this.table = input.table || input.name;
    this.primary = input.primary || [Object.keys(input.fields)[0]];
    this.selects = [] as any;
    this.selectMap = {} as any;

    for (const field in input.fields) 
    {
      const select = new ExprField(input.name, field);

      (this.selectMap as any)[field] = select;
      (this.selects as any).push(select);
    }
  }

}