import { authClient } from '@jsrs/auth';
import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: formSchema },
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
    <div>
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-white"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      <div className="mb-10">
        <span className="mb-8 block font-mono text-xl font-bold tracking-tight text-white">
          js<span className="text-brand-accent">.rs</span>
        </span>
        <h1 className="font-serif text-5xl text-white">Welcome back.</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <form.Field name="email">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <input
                id={field.name}
                type="email"
                autoComplete="email"
                placeholder="email@example.com"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={`w-full rounded-full border bg-zinc-900 px-8 py-4 text-white placeholder-zinc-600 outline-none transition-colors focus:border-brand-accent ${field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-white/10'}`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="px-4 text-xs text-red-400">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <input
                  id={field.name}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`w-full rounded-full border bg-zinc-900 px-8 py-4 text-white placeholder-zinc-600 outline-none transition-colors focus:border-brand-accent ${field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-white/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="px-4 text-xs text-red-400">{field.state.meta.errors[0]?.message}</p>
              )}
            </div>
          )}
        </form.Field>

        <div className="text-right">
          <span className="text-xs text-zinc-500">Forgot password?</span>
        </div>

        {serverError && <p className="px-4 text-sm text-red-400">{serverError}</p>}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-white py-4 font-semibold text-zinc-900 transition-colors hover:bg-brand-accent disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          )}
        </form.Subscribe>
      </form>

      <div className="my-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-zinc-500">Or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGitHubSignIn}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/30"
        >
          <FaGithub size={16} />
          GitHub
        </button>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 py-3.5 text-sm font-medium text-white transition-colors hover:border-white/30"
        >
          <FaGoogle size={16} />
          Google
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        No account?{' '}
        <Link to="/register" className="text-white transition-colors hover:text-brand-accent">
          Register →
        </Link>
      </p>
    </div>
  );
};
