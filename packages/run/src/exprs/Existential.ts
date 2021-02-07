import { QueryExistential } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { rowsFromSources, rowsGrouping, rowsWhere } from '../util';


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
      const exists = state.results.length > offset ? 1 : undefined;

      state.affected += innerState.affected;

      return exists;
    };
  }
);