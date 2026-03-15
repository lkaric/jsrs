import { authClient } from '@jsrs/auth';
import { Button, cn, Input, Label } from '@jsrs/ui';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onSubmit: formSchema },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  const handleGitHubSignUp = () => {
    void authClient.signIn.social({ provider: 'github', callbackURL: '/onboarding/employer' });
  };

  const handleGoogleSignUp = () => {
    void authClient.signIn.social({ provider: 'google', callbackURL: '/onboarding/employer' });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5">
      <h1 className="mb-6 text-xl font-semibold text-neutral-900 dark:text-white">
        Create account
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-1">
              <Label htmlFor={field.name} className="text-neutral-700 dark:text-neutral-300">
                Full name
              </Label>
              <Input
                id={field.name}
                type="text"
                autoComplete="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              <p className="min-h-4 text-xs text-red-500">{field.state.meta.errors[0]?.message}</p>
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div className="flex flex-col gap-1">
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
              <p className="min-h-4 text-xs text-red-500">{field.state.meta.errors[0]?.message}</p>
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="flex flex-col gap-1">
              <Label htmlFor={field.name} className="text-neutral-700 dark:text-neutral-300">
                Password
              </Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
              />
              <p
                className={cn(
                  'min-h-4 text-xs',
                  field.state.meta.errors.length > 0 ? 'text-red-500' : 'text-neutral-400',
                )}
              >
                {field.state.meta.errors.length > 0
                  ? field.state.meta.errors[0]?.message
                  : 'Minimum 8 characters'}
              </p>
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting ? 'Creating account…' : 'Create account'}
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
        <Button type="button" variant="outline" onClick={handleGitHubSignUp} className="w-full">
          <FaGithub className="size-4" />
          GitHub
        </Button>
        <Button type="button" variant="outline" onClick={handleGoogleSignUp} className="w-full">
          <FaGoogle className="size-4" />
          Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account?{' '}
        <a
          href="/login"
          className="text-neutral-900 underline-offset-2 hover:underline dark:text-white"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};
