type Props = { children: React.ReactNode };

export const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas-dark px-6">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
};
