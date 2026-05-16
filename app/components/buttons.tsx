import { twMerge } from "tailwind-merge";

export function Button({
  children,
  type = "button",
  onClick,
  className,
  disabled
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        "bg-secondary text-white font-medium text-lg rounded-full px-16 py-4 transition-colors duration-200 hover:bg-main disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      type={type}
    >
      {children}
    </button>
  );
}