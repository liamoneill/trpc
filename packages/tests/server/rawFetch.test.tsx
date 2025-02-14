/* eslint-disable @typescript-eslint/no-empty-function */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { routerToServerAndClientNew } from './___testHelpers';
import { initTRPC } from '@trpc/server/src';
import fetch from 'node-fetch';
import { z } from 'zod';

const factory = () => {
  const t = initTRPC.context().create();

  const router = t.router({
    myQuery: t.procedure
      .input(
        z
          .object({
            name: z.string(),
          })
          .optional(),
      )
      .query(({ input }) => {
        return input?.name ?? 'default';
      }),

    myMutation: t.procedure
      .input(
        z.object({
          name: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return { input };
      }),
  });
  return routerToServerAndClientNew(router);
};
test('batching with raw batch', async () => {
  const { close, httpUrl } = factory();

  {
    const res = await fetch(
      `${httpUrl}/myQuery?batch=1&input=${JSON.stringify({
        '0': { name: 'alexdotjs' },
      })}`,
    );
    const json = await res.json();

    expect(json[0]).toHaveProperty('result');
    expect(json[0].result).toMatchInlineSnapshot(`
Object {
  "data": "alexdotjs",
}
`);
  }

  close();
});
