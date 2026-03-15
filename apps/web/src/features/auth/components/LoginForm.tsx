import { authClient } from '@jsrs/auth';
import { Button, Input, Label } from '@jsrs/ui';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: formSchema, onBlur: formSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });
      if (error) {
        setServerError(error.message ?? 'Invalid email or password.');
      } else {
        await navigate({ to: '/dashboard' });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  const handleGitHubSignIn = () => {
    void authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' });
  };

  const handleGoogleSignIn = () => {
    void authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">Sign in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <form.Field name="email">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="text-neutral-700 dark:text-neutral-300">
                Email
              </Label>
              <Input
                id={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="text-neutral-700 dark:text-neutral-300">
                Password
              </Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
        <span className="text-xs text-neutral-400">or</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <Button type="button" variant="outline" onClick={handleGitHubSignIn} className="w-full">
          <FaGithub className="size-4" />
          GitHub
        </Button>
        <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full">
          <FaGoogle className="size-4" />
          Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        No account?{' '}
        <a
          href="/register"
          className="text-neutral-900 underline-offset-2 hover:underline dark:text-white"
        >
          Register
        </a>
      </p>
    </div>
  );
};
