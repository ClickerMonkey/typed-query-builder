// import { exprs, table, from, DataTypePoint, insert, deletes, update } from '@typed-query-builder/builder';

import { generate } from '../src/generator';
import { expectText, getConnection } from './helper';


describe('generator', () =>
{

  it('works', async () =>
  {
    const conn = await getConnection();

    const gen = await generate(conn, {
      tab: '  ',
    });

    const genFile =  gen.map(t => t.tableDefinition).join('\n\n');

    expectText({ condenseSpace: true }, genFile, `
      export const Group = table({
        name: 'Group',
        primary: ['ID'],
        fields: {
          ID: "INT",
          Name: ["NVARCHAR", 128],
        },
      });

      export const Person = table({
        name: 'Person',
        primary: ['ID'],
        fields: {
          ID: "INT",
          Name: ["NVARCHAR", 128],
          Email: ["NVARCHAR", 128],
          Location: ["NULL", "GEOMETRY"],
        },
      });

      export const PersonGroup = table({
        name: 'PersonGroup',
        primary: ['GroupID', 'PersonID'],
        fields: {
          GroupID: "INT",
          PersonID: "INT",
          Status: "SMALLINT",
        },
      });

      export const Task = table({
        name: 'Task',
        primary: ['ID'],
        fields: {
          ID: "INT",
          GroupID: "INT",
          Name: ["NVARCHAR", 128],
          Details: "NTEXT",
          Done: "BIT",
          DoneAt: ["NULL", "TIMESTAMP"],
          ParentID: ["NULL", "INT"],
          AssignedTo: ["NULL", "INT"],
          AssignedAt: ["NULL", "TIMESTAMP"],
          CreatedAt: "TIMESTAMP",
          CreatedBy: ["NULL", "INT"],
        },
      });
    `);
  });

});