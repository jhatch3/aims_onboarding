import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-blue-700 shadow-sm",
  secondary: "bg-white text-text-primary border border-gray-200 hover:bg-gray-50",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-gray-50",
  danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-8 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
