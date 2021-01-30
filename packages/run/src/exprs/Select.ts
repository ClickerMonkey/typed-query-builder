import { QuerySelect, isNumber } from '@typed-query-builder/builder';
import { removeDuplicates, rowsBuildSelects, rowsFromSources, rowsGrouping, rowsOrdered, rowsWhere } from '../Criteria';
import { RunTransformers } from '../Transformers';
import { compare } from '../util';


RunTransformers.setTransformer(
  QuerySelect, 
  (v, transform, compiler) => {
    const sources = rowsFromSources(v._criteria.sources, compiler);
    const where = rowsWhere(v._criteria.where, compiler);
    const grouper = rowsGrouping(v._criteria.group, v._criteria.selectsExpr, v._criteria.having, compiler);
    const orderer = rowsOrdered(v._criteria.orderBy, compiler);
    const selector = rowsBuildSelects(v._criteria.selects as never, compiler);
    const distincter = v._distinctOn.map( d => compiler.eval(d) );

    return (state) => {
      sources(state);
      where(state);
      grouper(state);
      selector(state);
      
      if (v._distinct) {
        removeDuplicates(state.results, (a, b) => compare(a.selects, b.selects, state.ignoreCase, true, false) === 0);
      } else if (distincter.length > 0) {
        removeDuplicates(state.results, (a, b) => {
          if (!a.cached[-1]) {
            state.result = a;
            state.row = a.row;

            a.cached[-1] = distincter.map( d => state.getRowValue(d) );
          }
          if (!b.cached[-1]) {
            state.result = a;
            state.row = a.row;

            b.cached[-1] = distincter.map( d => state.getRowValue(d) );
          }

          return compare(a.cached[-1], b.cached[-1], state.ignoreCase, true, false) === 0;
        });
      }

      orderer(state);

      let output = state.results.map( r => r.selects );

      if (isNumber(v._criteria.offset)) {
        output = output.slice(v._criteria.offset);
      }
      if (isNumber(v._criteria.limit)) {
        output = output.slice(0, v._criteria.limit);
      }

      return output;
    };
  }
);