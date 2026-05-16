'use client';

import { useState } from "react";

export default function Input({
    type = "text",
    name,
    placeholder,
    initialValue = ''
}: {
    type?: string;
    name: string;
    placeholder: string;
    initialValue?:string;
}) {

    const [value, setValue] = useState(initialValue);

    const handleChange = (input: string) => {

        // Solo aplicar formato especial cuando name === "quiz-code"
        if (name === "quiz-code") {

            // Elimina todo lo que no sea número
            const limpio = input.replace(/\D/g, "");

            // Agrega "-" cada 3 caracteres
            const formateado = limpio
                .replace(/(.{3})/g, "$1-")
                .replace(/-$/, "");

            setValue(formateado);

            return;
        }

        // comportamiento normal
        setValue(input);
    };

    return (
        <input
            className="bg-white w-lg max-w-full rounded-full px-8 py-4 text-center text-lg font-normal text-[#889893] border-2 border-transparent focus:border-main focus:border-2 focus:outline-none transition-colors duration-200"
            type={type}
            placeholder={placeholder}
            value={value}
            autoComplete="off"
            onChange={(e) => handleChange(e.target.value)}
            name={name}
        />
    );
}