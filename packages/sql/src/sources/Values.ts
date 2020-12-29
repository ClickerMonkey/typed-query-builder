import { SourceValues } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';


export function addValues(dialect: Dialect)
{
  dialect.transformer.setTransformer<SourceValues<any>>(
    SourceValues,
    (expr, transform, out) => 
    {
      const { columns, constants } = expr;
      const columnKeys = columns as any as string[];

      let x = '';

      x += 'VALUES ';

      x += constants.map( row => '(' + 
        columnKeys.map( column => 
          out.getConstant( row[column] ) 
        ).join(', ') + ')' 
      ).join(', ');
      
      return x;
    }
  ); 
}