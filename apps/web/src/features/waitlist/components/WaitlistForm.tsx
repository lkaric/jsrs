import { useForm } from '@tanstack/react-form';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { joinWaitlist } from '../server/joinWaitlist';

const formSchema = z.object({
  email: z.string().email().min(1).max(255),
});

export function WaitlistForm() {
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: '' },
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const result = await joinWaitlist({ data: value });
        if (result.ok) {
          setSubscribed(true);
        } else {
          setError(result.error);
        }
      } catch {
        setError('Something went wrong. Please try again.');
      }
    },
  });

  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <X size={32} className="text-red-600 dark:text-red-400" aria-hidden="true" />
          </div>
          <p className="text-xl font-medium text-neutral-900 dark:text-white">
            Something went wrong, please try again.
          </p>
        </motion.div>
      )}

      {subscribed && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center gap-4"
        >
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check size={32} className="text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <p className="text-xl font-medium text-neutral-900 dark:text-white">
            You're on the list.
          </p>
        </motion.div>
      )}

      {!subscribed && !error && (
        <motion.div
          key="form"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="relative mx-auto w-full max-w-md"
          >
            <form.Field name="email">
              {(field) => (
                <input
                  id={field.name}
                  type="email"
                  placeholder="your@email.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  aria-label="Email address for early access"
                  className={clsx(
                    'w-full rounded-full border bg-white py-4 pl-6 pr-16 text-neutral-900 shadow-xl outline-none transition-all placeholder:text-neutral-400 dark:bg-white/5 dark:text-white',
                    field.state.meta.errors.length > 0
                      ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                      : 'border-neutral-200 focus:border-neutral-900 dark:border-white/10 dark:focus:border-brand-accent',
                  )}
                  required
                />
              )}
            </form.Field>

            <form.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label="Join waitlist"
                  className="absolute bottom-2 right-2 top-2 flex aspect-square items-center justify-center rounded-full bg-neutral-900 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
                >
                  <ArrowRight size={20} />
                </button>
              )}
            </form.Subscribe>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
