import { isNumber, QuerySet } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { getOrder } from '../helpers/Order';


export function addSet(dialect: Dialect)
{
  dialect.transformer.setTransformer<QuerySet<any>>(
    QuerySet,
    (expr, transform, out) => 
    {
      const { _criteria: { orderBy, limit, offset }, _sources, _all, _op } = expr;

      let x = '';
      let sourceIndex = 0;

      for (const source of _sources)
      {
        if (sourceIndex > 0)
        {
          x += ' ';
          x += _op;
          x += ' ';

          if (_all[sourceIndex - 1])
          {
            x += 'ALL ';
          }
          
          x += '(';
          x += out.modify({ excludeSelectAlias: true }, () => transform( source, out ));
          x += ')';
        }
        else
        {
          x += '(';
          x += transform( source, out );
          x += ')';
        }

        sourceIndex++;
      }

      if (orderBy.length > 0) 
      {
        x += ' ORDER BY ';
        x += out.modify({ excludeSource: true }, () => orderBy.map( o => getOrder(o, out ) ).join(', '));
      }

      if (isNumber(offset)) 
      {
        x += ' LIMIT ';
        x += isNumber(limit) ? limit.toFixed(0) : 'ALL';
        x += ' OFFSET ';
        x += offset.toFixed(0);
      } 
      else if (isNumber(limit)) 
      {
        x += ' LIMIT ';
        x += limit.toFixed(0);
      }

      return x;
    }
  );
}