import { isArray, StatementDelete } from '@typed-query-builder/builder';
import { RunTransformers } from '../Transformers';
import { convertToTuples, rowsBuildSelects } from '../util';



RunTransformers.setTransformer(
  StatementDelete, 
  (v, transform, compiler, tuples) => {
    const returning = rowsBuildSelects(v._returning, compiler);
    const where = v._where.map( w => compiler.eval( w ) );

    return (state) => 
    {
      const fromName = state.useNames
        ? v._from.table as string
        : v._from.name as string;
      const from = state.sources[fromName];
      
      if (!isArray(from))
      {
        throw new Error(`Cannot delete from missing source ${fromName}`);
      }

      const removed: any[] = [];

      for (let i = 0; i < from.length; i++)
      {
        const row = from[i];

        state.row = { [fromName]: row };

        if (!where.some( w => !w.get(state) ))
        {
          removed.push(row);
          from.splice(i, 1);
          i--;
          state.affected++;
        }
      }

      if (v._returning.length > 0 && removed.length > 0)
      {
        const innerState = state.extend();

        innerState.sources[fromName] = removed;

        innerState.results = removed.map( (row, partitionIndex) => ({
          row: { [fromName]: row },
          group: [],
          cached: {},
          selects: {},
          partition: 0,
          partitionIndex,
          partitionSize: removed.length,
          partitionValues: [],
          peer: 0,
          peerIndex: 0,
          peerSize: 0,
          peerValues: [],
        }));

        for (const result of innerState.results)
        {
          result.group = innerState.results;
        }

        returning(innerState);

        const results = innerState.results.map( r => r.selects );

        state.affected += innerState.affected;

        return tuples
          ? convertToTuples(results, v._returning)
          : results;
      }

      return [];
    };
  }
);