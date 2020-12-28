import { from, table } from '@typed-query-builder/builder';
import { sql } from './helper';


describe('Select', () =>
{
  
  const Task = table({
    name: 'task',
    fields: {
      id: 'INT',
      name: ['VARCHAR', 64],
      done: 'BOOLEAN',
      doneAt: 'TIMESTAMP',
      parentId: 'INT',
      assignee: 'INT',
    },
  });

  // const People = table({
  //   name: 'people',
  //   fields: {
  //     id: 'INT',
  //     name: ['VARCHAR', 64],
  //   },
  // });

  it('all', () =>
  {
    const x = from(Task)
      .select('*')
      .run(sql)
    ;

    expect(x).toBe('SELECT * FROM task');
  });

});