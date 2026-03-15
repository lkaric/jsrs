import { authClient } from '@jsrs/auth';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export function RegisterForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onSubmit: formSchema, onBlur: formSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      });
      if (error) {
        setServerError(error.message ?? 'Could not create account. Please try again.');
      } else {
        await navigate({ to: '/onboarding/employer' });
      }
    },
  });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
        Create account
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <input
                id={field.name}
                type="text"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={clsx(
                  'rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors dark:bg-white/5 dark:text-white',
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-neutral-200 focus:border-neutral-900 dark:border-white/10 dark:focus:border-white',
                )}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email
              </label>
              <input
                id={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={clsx(
                  'rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors dark:bg-white/5 dark:text-white',
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-neutral-200 focus:border-neutral-900 dark:border-white/10 dark:focus:border-white',
                )}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={clsx(
                  'rounded-lg border bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-colors dark:bg-white/5 dark:text-white',
                  field.state.meta.errors.length > 0
                    ? 'border-red-500'
                    : 'border-neutral-200 focus:border-neutral-900 dark:border-white/10 dark:focus:border-white',
                )}
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
              ) : (
                <p className="text-xs text-neutral-400">Minimum 8 characters</p>
              )}
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 cursor-pointer rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
        <span className="text-xs text-neutral-400">or</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() =>
            authClient.signIn.social({ provider: 'github', callbackURL: '/onboarding/employer' })
          }
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <FaGithub className="size-4" />
          GitHub
        </button>
        <button
          type="button"
          onClick={() =>
            authClient.signIn.social({ provider: 'google', callbackURL: '/onboarding/employer' })
          }
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
          <FaGoogle className="size-4" />
          Google
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="cursor-pointer text-neutral-900 underline-offset-2 hover:underline dark:text-white"
        >
          Sign in
        </a>
      </p>
    </div>
  );
}
