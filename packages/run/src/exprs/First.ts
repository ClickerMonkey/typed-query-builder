import { QueryFirst } from '@typed-query-builder/builder';
import { rowsBuildSelects, rowsFromSources, rowsGrouping, rowsOrdered, rowsWhere } from '../Criteria';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  QueryFirst, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v.criteria.sources, compiler);
    const where = rowsWhere(v.criteria.where, compiler);
    const grouper = rowsGrouping(v.criteria.group, v.criteria.selectsExpr, v.criteria.having, compiler);
    const orderer = rowsOrdered(v.criteria.orderBy, compiler);
    const selector = rowsBuildSelects(v.criteria.selects as never, compiler);

    return (state) => 
    {
      const innerState = state.extend();

      sources(innerState);
      where(innerState);
      grouper(innerState);
      selector(innerState);

      // TODO instead of full sort, get min
      orderer(innerState);

      return innerState.results[0]?.selects;
    };
  }
);