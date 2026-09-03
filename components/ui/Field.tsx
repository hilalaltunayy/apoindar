import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

const inputBase =
  "h-11 w-full rounded-md border border-line-soft bg-surface-base px-3.5 text-sm text-ink-primary " +
  "placeholder:text-ink-tertiary transition-colors duration-250 ease-butter " +
  "focus:border-brand-purple-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-200 " +
  "aria-[invalid=true]:border-state-danger aria-[invalid=true]:ring-state-danger/20";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(inputBase, className)} {...rest} />;
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cn(inputBase, "pr-8", className)} {...rest} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "h-auto min-h-[6rem] py-2.5", className)}
      {...rest}
    />
  );
});

export function FormField({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; "aria-invalid": boolean }) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-primary">
        {label}
        {required ? <span className="text-state-danger"> *</span> : null}
      </label>
      {children({ id, "aria-invalid": Boolean(error) })}
      {error ? (
        <p className="text-xs text-state-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
