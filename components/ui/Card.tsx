import { cn } from "@/lib/cn";

export function Card({
  className,
  interactive = false,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; as?: React.ElementType }) {
  return (
    <Tag
      className={cn(
        "card-surface p-5 transition-[transform,box-shadow] duration-250 ease-butter",
        interactive && "hover:-translate-y-0.5 hover:shadow-raised",
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold", className)} {...rest} />;
}

export function CardMeta({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-ink-secondary", className)} {...rest} />;
}
