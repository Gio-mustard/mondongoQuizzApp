'use client';

import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function Input({
    type = "text",
    name,
    placeholder,
    initialValue = '',
    className,
    onChange
}: {
    type?: string;
    name: string;
    placeholder: string;
    initialValue?:string;
    className?: string;
    onChange?: (value: string) => void;
}) {

    const [value, setValue] = useState(initialValue);

    const handleChange = (input: string) => {

        
        if (name === "quiz-code") {

        
            const limpio = input.replace(/\D/g, "");

        
            const formateado = limpio
                .replace(/(.{3})/g, "$1-")
                .replace(/-$/, "");

            setValue(formateado);
            if (onChange) onChange(formateado);

            return;
        }

        
        setValue(input);
        if (onChange) onChange(input);
    };

    return (
        <input
            className={twMerge(
                "bg-white w-lg max-w-full rounded-full px-8 py-4 text-center text-lg font-normal text-[#889893] border-2 border-transparent focus:border-main focus:border-2 focus:outline-none transition-colors duration-200",
                className
            )}
            type={type}
            placeholder={placeholder}
            value={value}
            autoComplete="off"
            onChange={(e) => handleChange(e.target.value)}
            name={name}
        />
    );
}