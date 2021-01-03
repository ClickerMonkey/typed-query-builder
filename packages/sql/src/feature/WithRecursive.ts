import { Selects, SourceRecursive } from '@typed-query-builder/builder';
import { Dialect } from '../Dialect';
import { DialectFeatures } from '../Features';

export function addWithRecursiveFeature(dialect: Dialect)
{
  dialect.featureFormatter[DialectFeatures.WITH_RECURSIVE] = (value: SourceRecursive<any, any>, transform, out) => 
  {
    let x = '';

    x += out.dialect.quoteName(value.getName());
    x += ' (';
    x += (value.getSelects() as Selects).map( s => out.dialect.quoteName(String(s.alias)) ).join(', ');
    x += ') AS (';
    x += out.modify({ excludeSelectAlias: true }, () => transform(value.source, out));
    x += ' UNION ';
    if (value.all) {
      x += 'ALL ';
    }
    x += out.modify({ excludeSelectAlias: true }, () => out.addSources([value], () => transform(value.recursive, out)));
    x += ') '

    return x;
  };
}