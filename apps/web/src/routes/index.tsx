import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { WaitlistForm } from '@/features/waitlist/components/WaitlistForm';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-canvas-light dark:bg-canvas-dark">
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-20">
          <div className="h-[500px] w-[500px] animate-pulse rounded-full bg-brand-accent/30 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 max-w-2xl text-center"
        >
          <span className="mb-6 block font-mono text-sm uppercase tracking-widest text-brand-accent">
            Early Access
          </span>

          <h2 className="mb-6 text-5xl font-bold text-neutral-900 dark:text-white md:text-7xl font-serif">
            Find work that
            <br />
            <span className="text-brand-accent">actually fits.</span>
          </h2>

          <p className="mb-12 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            We're building a dedicated ecosystem for engineering talent. Exclusive salary data,
            company reviews, moderated positions, and guaranteed anonymity.
          </p>

          <WaitlistForm />

          <div className="mt-16 flex items-center justify-center gap-8 text-neutral-400">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">500+</span>
              <span className="text-xs uppercase tracking-wider">Companies</span>
            </div>
            <div className="h-8 w-px bg-neutral-200 dark:bg-white/10" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">€85k</span>
              <span className="text-xs uppercase tracking-wider">Avg Salary</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
