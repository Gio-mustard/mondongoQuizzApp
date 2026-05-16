'use client';

import { twMerge } from "tailwind-merge";
import { soundManager } from "../utils/soundManager";

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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundManager.play('click');
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
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