import { QuerySelect, isNumber } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { compare, removeDuplicates, rowsBuildSelects, rowsFromSources, rowsGrouping, rowsOrdered, rowsWhere } from '../util';


RunTransformers.setTransformer(
  QuerySelect, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v._criteria.sources, compiler);
    const where = rowsWhere(v._criteria.where, compiler);
    const grouper = rowsGrouping(v._criteria.group, v._criteria.selectsExpr, v._criteria.having, compiler);
    const selector = rowsBuildSelects(v._criteria.selects as never, compiler);
    const distincter = v._distinctOn.map( d => compiler.eval(d) );
    const orderer = rowsOrdered(v._criteria.orderBy, compiler);

    return (state) => 
    {
      const innerState = state.extend();

      sources(innerState);
      where(innerState);
      grouper(innerState);
      selector(innerState);
      
      if (v._distinct) {
        removeDuplicates(innerState.results, (a, b) => compare(a.selects, b.selects, innerState.ignoreCase, true, false) === 0);
      } else if (distincter.length > 0) {
        removeDuplicates(innerState.results, (a, b) => {
          if (!a.cached[-1]) {
            innerState.result = a;
            innerState.row = a.row;

            a.cached[-1] = distincter.map( d => innerState.getRowValue(d) );
          }
          if (!b.cached[-1]) {
            innerState.result = a;
            innerState.row = a.row;

            b.cached[-1] = distincter.map( d => innerState.getRowValue(d) );
          }

          return compare(a.cached[-1], b.cached[-1], innerState.ignoreCase, true, false) === 0;
        });
      }

      orderer(innerState);

      let output = innerState.results.map( r => r.selects );

      if (isNumber(v._criteria.offset)) {
        output = output.slice(v._criteria.offset);
      }
      if (isNumber(v._criteria.limit)) {
        output = output.slice(0, v._criteria.limit);
      }

      state.affected += innerState.affected;

      return output;
    };
  }
);