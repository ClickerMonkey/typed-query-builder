import { QueryExistential } from '@typed-query-builder/builder';
import { rowsFromSources, rowsGrouping, rowsWhere } from '../Criteria';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  QueryExistential, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v.criteria.sources, compiler);
    const where = rowsWhere(v.criteria.where, compiler);
    const grouper = rowsGrouping(v.criteria.group, v.criteria.selectsExpr, v.criteria.having, compiler);

    return (state) => 
    {
      const innerState = state.extend();

      sources(innerState);
      where(innerState);
      grouper(innerState);

      const offset = v.criteria.offset || 0;

      return state.results.length > offset ? 1 : undefined;
    };
  }
);