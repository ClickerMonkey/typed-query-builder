import { isEmpty, isNumber, QueryCriteria, Select, SourceJoin, SourceKind, SourceRecursive } from '@typed-query-builder/builder';
import { DialectOrderedFormatter, DialectParamsSelect, DialectTransformTransformer } from '../Dialect';
import { DialectFeatures } from '../Features';
import { DialectOutput } from '../Output';
import { getGroup } from './Group';
import { getNamedSource } from './NamedSource';
import { getOrder } from './Order';
import { getPredicate } from './Predicate';
import { getPredicates } from './Predicates';
import { getSelects } from './Selects';
import { getWindow } from './Window';


export function getCriteria(criteria: QueryCriteria<any, any, any>, transform: DialectTransformTransformer, out: DialectOutput, hasSelectAliases: boolean ): DialectOrderedFormatter<DialectParamsSelect>
{
  const { sources, selects, where, group, having, windows, orderBy, limit, offset, selectsExpr } = criteria;
  const params: DialectOrderedFormatter<DialectParamsSelect> = {};

  const withs = criteria.sources
    .filter( s => s.kind === SourceKind.WITH )
    .map( s => s.source )
  ;

  if (withs.length > 0)
  {
    const recursive = withs.some( w => w instanceof SourceRecursive );
    const withKeywords = recursive && out.dialect.recursiveKeyword
      ? 'WITH RECURSIVE '
      : 'WITH ';

    params.with = () => 
    {
      // const withSaved = out.saveSources();

      const x = withs.map( w =>
      {
        const s = w instanceof SourceRecursive
          ? out.dialect.getFeatureOutput(DialectFeatures.WITH_RECURSIVE, w, out)
          : out.dialect.getFeatureOutput(DialectFeatures.WITH, w, out) 

        // out.sources.push(w);

        return s;
      }).join(', ');

      // out.restoreSources(withSaved);

      return withKeywords + x;
    }
  }

  params.SELECT = () => 'SELECT';

  const allSources = sources.filter( s => s.kind !== SourceKind.WITH ).map( s => s.source );

  if (selects.length > 0)
  {
    if (hasSelectAliases) 
    {
      params.selects = () => out.addSources(allSources, () => getSelects(selects, out));
    } 
    else 
    {
      params.selects = () => out.addSources(allSources, () => selects.map( (s: Select<any, any>) => out.wrap(s.getExpr()) ).join(', '));
    }
  }

  const froms = sources
    .filter( s => s.kind === SourceKind.FROM )
    .map( s => s.source )
  ;

  if (froms.length > 0)
  {
    params.from = () => 'FROM ' + froms.map( f => 
    {
      const s = getNamedSource(f, out) 
  
      out.sources.push(f);
  
      return s;
    }).join(', ')
  }

  const joins = sources
    .filter( s => s.kind === SourceKind.JOIN )
    .map( s => s.source ) as SourceJoin<any, any>[]
  ;

  if (joins.length > 0)
  {
    params.joins = () => joins.map( j =>
    {
      let x = '';

      if (j.lateral)
      {
        out.dialect.requireSupport(DialectFeatures.LATERAL_JOIN);
      }

      x += j.lateral
        ? out.dialect.lateralJoinType.get(j.type)
        : out.dialect.joinType.get(j.type);

      x += ' ';
      x += getNamedSource( j, out );
      x += ' ON ';

      out.sources.push(j);

      if (j.condition) 
      {
        x += transform(j.condition, out);
      } 
      else 
      {
        x += out.dialect.trueCondition;
      }

      return x;
    }).join(' ');
  }

  if (where.length > 0) 
  {
    params.where = () => 'WHERE ' + getPredicates(where, 'AND', transform, out); 
  }

  if (group.length > 0) 
  {
    params.group = () => 'GROUP BY ' + group.map( g => getGroup( g, selectsExpr, transform, out ) ).join(', ');
  }

  if (having) 
  {
    params.having = () => 'HAVING ' + getPredicate( having, transform, out );
  }

  if (!isEmpty(windows)) 
  {
    params.windows = () =>
    {
      out.dialect.requireSupport(DialectFeatures.WINDOWS);

      let x = '';

      x += 'WINDOW ';

      let windowIndex = 0;

      for (const windowName in windows) 
      {
        if (windowIndex > 0) 
        {
          x += ', ';
        }

        x += out.dialect.quoteName(windowName);
        x += ' AS (';
        x += getWindow(windows[windowName], out);
        x += ')';

        windowIndex++;
      }

      return x;
    };
  }

  if (orderBy.length > 0) 
  {
    params.order = () => 'ORDER BY ' + orderBy.map( o => getOrder(o, out ) ).join(', ');
  }

  if (isNumber(offset)) 
  {
    if (isNumber(limit))
    {
      params.paging = () => out.dialect.selectOffsetLimit({ limit, offset });
    }
    else
    {
      params.paging = () => out.dialect.selectOffsetOnly({ offset });
    }
  } 
  else if (isNumber(limit)) 
  {
    params.paging = () => out.dialect.selectLimitOnly({ limit });
  }

  return params;
}