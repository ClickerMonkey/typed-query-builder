import { isNumber, Name, QuerySet } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare, convertToTuples, orderByCompile, rowsPeerComparator } from '../util';


RunTransformers.setTransformer(
  QuerySet, 
  (v, transform, compiler, tuples) => {
    const sources = v._sources.map( (s, i) => compiler.eval(s, undefined, i > 0) );
    const orderBys = orderByCompile(v._criteria.orderBy, compiler);
    const comparator = rowsPeerComparator(orderBys);
    const fields = v._criteria.selects.map( s => s.alias );

    return (state) =>
    {
      const innerState = state.extend();

      const rows: any[] = sources[0].get(innerState);
      const intersection: any[] = [];

      for (let k = 1; k < sources.length; k++)
      {
        const nextTuples = sources[k].get(innerState);
        const nextObjects = nextTuples.map( tuple => tupleToObject(tuple, fields) );
        const nextAll = v._all[k - 1];

        for (const next of nextObjects)
        {
          const existsIndex = rows.findIndex( row => compare(row, next, state.ignoreCase, false, false) === 0 );
          const exists = existsIndex >= 0;

          switch (v._op) {
            case 'EXCEPT':
              if (exists) {
                rows.splice(existsIndex, 1);
              }
              break;
            case 'UNION':
              if (!exists || nextAll) {
                rows.push(next);
              }
              break;
            case 'INTERSECT':
              if (exists && (nextAll || !intersection.some( row => compare(row, next, state.ignoreCase, false, false) === 0))) {
                intersection.push(next);
              }
              break;
          }
        }
      }


      let output = v._op === 'INTERSECT'
        ? intersection
        : rows;

      if (orderBys.length > 0) {
        const targetPeerValues = output.map((row) => ({ 
          row, 
          peerValues: orderBys.map( o => {
            state.row = { set: row };
  
            return o.expr.get(state);
          })
        }));
  
        targetPeerValues.sort(comparator(state.ignoreCase));
  
        output = targetPeerValues.map( r => r.row );
      }

      if (isNumber(v._criteria.offset)) {
        output = output.slice(v._criteria.offset);
      }
      if (isNumber(v._criteria.limit)) {
        output = output.slice(0, v._criteria.limit);
      }

      state.affected += innerState.affected;

      return tuples 
        ? convertToTuples(output, v._criteria.selects) 
        : output;
    };
  }
);

function tupleToObject(tuple: any[], fields: Name[]): any
{
  return fields.reduce( (obj, field, index) => (obj[field] = tuple[index], obj), {});
}