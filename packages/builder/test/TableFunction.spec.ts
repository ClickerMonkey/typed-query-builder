import { table, from } from '../src';
import { expectExpr } from './helper';


// tslint:disable: no-magic-numbers

describe('TableFunction', () => 
{

  it('call', () =>
  {
    const GetRoles = table({
      table: 'get_roles',
      name: 'getRoles',
      fields: {
        id: 'INT',
        name: 'TEXT',
      },
    });

    const q = from(
      GetRoles.call({ 
        user: 23 
      }))
      .select(({ getRoles }) => [
        getRoles.id
      ])
    ;

    expectExpr<[{ id: number }]>(q);
  });

});