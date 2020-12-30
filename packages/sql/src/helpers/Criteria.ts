import { isEmpty, isNumber, QueryCriteria, Select, SourceJoin, SourceKind } from '@typed-query-builder/builder';
import { DialectTransformTransformer } from '../Dialect';
import { DialectFeatures } from '../Features';
import { DialectOutput } from '../Output';
import { getGroup } from './Group';
import { getNamedSource } from './NamedSource';
import { getOrder } from './Order';
import { getPredicate } from './Predicate';
import { getPredicates } from './Predicates';
import { getSelects } from './Selects';
import { getWindow } from './Window';


export function getCriteria(criteria: QueryCriteria<any, any, any>, transform: DialectTransformTransformer, out: DialectOutput, hasSelects: boolean, hasSelectAliases: boolean, hasWindows: boolean, hasOrders: boolean, hasPaging: boolean ): string
{
  const { sources, selects, where, group, having, windows, orderBy, limit, offset, selectsExpr } = criteria;

  const allSources = sources.map( s => s.source );

  let x = '';

  if (hasSelects && selects.length > 0)
  {
    if (hasSelectAliases) 
    {
      x += out.addSources(allSources, () => getSelects(selects, out));
    } 
    else 
    {
      x += selects.map( (s: Select<any, any>) => out.wrap(s.getExpr()) ).join(', ');
    }

    x += ' ';
  }

  const saved = out.saveSources();

  const froms = sources
    .filter( s => s.kind === SourceKind.FROM )
    .map( s => s.source )
  ;

  x += 'FROM ';
  x += froms.map( f => 
  {
    const s = getNamedSource(f, out) 

    out.sources.push(f);

    return s;
  }).join(', ');

  const joins = sources
    .filter( s => s.kind === SourceKind.JOIN )
    .map( s => s.source ) as SourceJoin<any, any>[]
  ;

  for (const join of joins) 
  {
    x += ' ';
    x += out.dialect.getAlias(out.dialect.joinTypeAlias, join.type);
    x += ' ';
    x += getNamedSource( join, out );
    x += ' ON ';

    out.sources.push(join);

    if (join.condition) 
    {
      x += transform(join.condition, out);
    } 
    else 
    {
      x += '1 = 1';
    }
  }

  if (where.length > 0) 
  {
    x += ' WHERE ';
    x += getPredicates(where, 'AND', transform, out);
  }

  if (group.length > 0) 
  {
    x += ' GROUP BY ';
    x += group.map( g => getGroup( g, selectsExpr, transform, out ) ).join(', ');
  }

  if (having) 
  {
    x += ' HAVING ';
    x += getPredicate( having, transform, out );
  }

  if (hasWindows && !isEmpty(windows)) 
  {
    out.dialect.requireSupport(DialectFeatures.WINDOWS);

    x += ' WINDOW ';

    let windowIndex = 0;

    for (const windowName in windows) 
    {
      if (windowIndex > 0) 
      {
        x += ', ';
      }
      x += out.dialect.quoteAlias(windowName);
      x += ' AS (';
      x += getWindow(windows[windowName], out);
      x += ')';

      windowIndex++;
    }
  }

  if (hasOrders && orderBy.length > 0) 
  {
    x += ' ORDER BY ';
    x += orderBy.map( o => getOrder(o, out ) ).join(', ');
  }

  if (hasPaging) 
  {
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
  }

  out.restoreSources(saved);

  return x;
}