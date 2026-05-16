import { twMerge } from "tailwind-merge";

export function Button({
  children,
  type = "button",
  onClick,
  className
}: {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}) {

  return (
    <button
      onClick={onClick}
      className={twMerge(
        "bg-secondary text-white font-medium text-lg rounded-full px-16 py-4 transition-colors duration-200 hover:bg-main",
        className
      )}
      type={type}
    >
      {children}
    </button>
  );
}