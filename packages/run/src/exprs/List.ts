import { QueryList, isNumber } from '@typed-query-builder/builder';
import { rowsFromSources, rowsGrouping, rowsOrdered, rowsWhere } from '../Criteria';
import { RunTransformers } from '../Transformers';


RunTransformers.setTransformer(
  QueryList, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v.criteria.sources, compiler);
    const where = rowsWhere(v.criteria.where, compiler);
    const grouper = rowsGrouping(v.criteria.group, v.criteria.selectsExpr, v.criteria.having, compiler);
    const orderer = rowsOrdered(v.criteria.orderBy, compiler);
    const getItem = compiler.eval(v.item);

    return (state) => 
    {
      const innerState = state.extend();

      sources(innerState);
      where(innerState);
      grouper(innerState);
      orderer(innerState);

      let output = innerState.results;

      if (isNumber(v.criteria.offset)) {
        output = output.slice(v.criteria.offset);
      }
      if (isNumber(v.criteria.limit)) {
        output = output.slice(0, v.criteria.limit);
      }

      const items: any[] = [];

      state.forEachResult(() => items.push(state.getRowValue(getItem)), output);

      return items;
    };
  }
);