# Coding Standards

## React Components

### Component declaration

Always use fat-arrow syntax with an explicit `React.FC` type annotation. Never use `function` declarations for components.

```tsx
// Good
const MyComponent: React.FC = () => {
  return <div />;
};

// With props
type Props = {
  label: string;
};

const MyComponent: React.FC<Props> = ({ label }) => {
  return <div>{label}</div>;
};

// Bad — never do this
function MyComponent() {
  return <div />;
}
export function MyComponent() { ... }
```

Named hooks and utilities are imported normally:

```tsx
import { useState, useEffect } from 'react';
```

### Event handlers

Extract all event handlers as named `const` functions inside the component body. Do not inline functions in JSX props.

```tsx
// Good
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  void form.handleSubmit();
};

const handleGitHubSignIn = () => {
  void authClient.signIn.social({ provider: 'github' });
};

return <form onSubmit={handleSubmit}>...</form>;

// Bad — do not inline
return (
  <form onSubmit={(e) => { e.preventDefault(); void form.handleSubmit(); }}>
    <button onClick={() => authClient.signIn.social({ provider: 'github' })} />
  </form>
);
```

**Exception:** TanStack Form's render-prop children (`field => <div>`) are fine inline since they are an API constraint, not application logic.

## File Structure

Feature-based. Routes are thin shells; all logic, components, and server functions live in `apps/web/src/features/<feature>/`.

```
features/
  <feature>/
    components/   ← React components
    server/       ← createServerFn functions
```
