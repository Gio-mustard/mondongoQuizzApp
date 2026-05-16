'use client';

import { useState, useEffect } from "react";
import Input from "./input";
import { checkQuizExists } from "../actions/quiz";

export default function InteractiveCodeInput({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const rawCode = value.replace(/\D/g, "");
    if (rawCode.length >= 6) {
      const timeoutId = setTimeout(() => {
        checkQuizExists(rawCode).then(setExists);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setExists(false);
    }
  }, [value]);

  return (
    <div className="flex flex-col relative w-full pt-6 -mt-6">
      <div className="w-full max-w-lg mx-auto flex justify-center relative">
        <span
            className={`absolute -top-5 left-8 bg-main w-fit px-4 text-background italic rounded-t-2xl z-0 transition-transform duration-300 ${
            exists ? "translate-y-0" : "translate-y-6"
            }`}
        >
            Quiz encontrado
        </span>
        <div className="relative z-10 w-full flex justify-center">
            <Input 
            name="quiz-code" 
            placeholder="000-000" 
            type="text" 
            initialValue={initialValue}
            onChange={setValue}
            />
        </div>
      </div>
    </div>
  );
}
