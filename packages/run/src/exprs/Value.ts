import { QueryFirstValue } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { rowsFromSources, rowsGrouping, rowsOrdered, rowsWhere } from '../util';


RunTransformers.setTransformer(
  QueryFirstValue, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v.criteria.sources, compiler);
    const where = rowsWhere(v.criteria.where, compiler);
    const grouper = rowsGrouping(v.criteria.group, v.criteria.selectsExpr, v.criteria.having, compiler);
    const orderer = rowsOrdered(v.criteria.orderBy, compiler);
    const getValue = compiler.eval(v.value);

    return (state) => 
    {
      const innerState = state.extend();

      sources(innerState);
      where(innerState);
      grouper(innerState);

      // TODO instead of full sort, get min
      orderer(innerState);

      const first = innerState.results[0]
      innerState.result = first;
      innerState.resultIndex = 0;
      innerState.row = first.row;

      return innerState.getRowValue(getValue);
    };
  }
);