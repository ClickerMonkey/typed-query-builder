import { Select, Source, values } from "../src";
import { NamedSource } from "../src/sources/Named";
import { expectType } from "./helper";


describe('Source', () =>
{

    it('values', () =>
    {
        const v = values([{
            id: 0,
            name: 'Task #1',
            done: false
        }]);

        expectType<Source<[Select<'id', number>, Select<'name', string>, Select<'done', boolean>]>>(v);

        const a = v.as('Task');

        expectType<NamedSource<'Task', [Select<'id', number>, Select<'name', string>, Select<'done', boolean>]>>(a);
    });

});