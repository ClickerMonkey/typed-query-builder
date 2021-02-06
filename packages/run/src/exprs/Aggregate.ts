import { Expr, AggregateFunctions, ExprAggregate, QueryWindow } from '@typed-query-builder/builder';
import { RunAggregates } from '../Aggregates';
import { RunResult } from '../State';
import { RunTransformers } from '../Transformers';
import { compare, orderByCompile, rowsPeerComparator, sort, SortFuncNone, SortFuncsInput } from '../util';


RunTransformers.setTransformer<ExprAggregate<{}, [], never, keyof AggregateFunctions, AggregateFunctions, any>>(
  ExprAggregate as any,
  (v, transform, compiler) => {
    const windowDefinition: QueryWindow<never, any, any, any> | undefined = v._overWindowDefinition || (v._overWindow ? v._windows[v._overWindow as any] : undefined);
    const functionValues = (v._values as Expr<any>[]).map( e => compiler.eval(e) );
    const functionCompiled = RunAggregates[v._type](v as any, functionValues as any, compiler);

    if (windowDefinition)
    {
      const windowPartition = windowDefinition._partitionBy.map( p => compiler.eval(p) );
      const windowOrder = orderByCompile(windowDefinition._orderBy, compiler);
      const windowOrderComparator = rowsPeerComparator(windowOrder);

      return (state) => 
      {
        if (state.lastWindow !== windowDefinition)
        {
          state.lastWindow = windowDefinition;

          state.newContext(() => 
          { 
            state.forEachResult( r => {
              r.partitionValues = [];
              r.peerValues = [];
            });
  
            windowPartition.forEach( p => state.forEachResult( r => r.partitionValues.push(state.getRowValue(p)) ) );
  
            windowOrder.forEach( o => state.forEachResult( r => r.peerValues.push(state.getRowValue(o.expr)) ) );
  
            const windowPartitionSorter: SortFuncsInput<RunResult> = windowPartition.length === 0
              ? SortFuncNone
              : {
                  compare: (a, b) => compare(a.partitionValues, b.partitionValues, state.ignoreCase, true, true),
                  equals: (a, b) => compare(a.partitionValues, b.partitionValues, state.ignoreCase, true, false) === 0,
                  setGroup: (a, group) => a.partition = group,
                  setGroupIndex: (a, index) => a.partitionIndex = index,
                  setGroupSize: (a, size) => a.partitionSize =  size,
                }
            ;
  
            const windowPeerSorter: SortFuncsInput<RunResult> = windowOrder.length === 0
              ? SortFuncNone
              : {
                  compare: windowOrderComparator(state.ignoreCase),
                  equals: (a, b) => compare(a.peerValues, b.peerValues, state.ignoreCase, true, false) === 0,
                  setGroup: (a, group) => a.peer = group,
                  setGroupIndex: (a, index) => a.peerIndex = index,
                  setGroupSize: (a, size) => a.peerSize =  size,
                }
            ;
              
            sort(state.results, windowPartitionSorter, windowPeerSorter);
          });
        }

        return functionCompiled(state);
      };
    }
    
    // non-window aggregate functions
    return functionCompiled;
  },
);