import { db, waitlist } from '@jsrs/db';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const schema = z.object({ email: z.string().email().max(255) });

export const joinWaitlist = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await db.insert(waitlist).values({ email: data.email }).onConflictDoNothing();
      return { ok: true };
    } catch (err) {
      console.error('[joinWaitlist]', err);
      return { ok: false, error: 'Failed to join waitlist. Please try again.' };
    }
  });
