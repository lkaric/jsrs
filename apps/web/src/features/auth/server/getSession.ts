import { auth } from '@jsrs/auth';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const getSession = createServerFn().handler(async () => {
  const request = getRequest();
  return auth.api.getSession({ headers: request.headers });
});
