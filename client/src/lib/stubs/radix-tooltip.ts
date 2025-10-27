// Local stub for @radix-ui/react-tooltip to avoid build-time resolution errors.
// Provides minimal API surface used by our UI wrappers.

import * as React from "react";

export const Provider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children }) => <>{children}</>;

export const Root: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children }) => <>{children}</>;

export const Trigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => (
    <button type="button" ref={ref} {...props}>
      {children}
    </button>
  )
);
Trigger.displayName = "Trigger";

export const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div role="tooltip" ref={ref} {...props}>
      {children}
    </div>
  )
);
Content.displayName = "Content";