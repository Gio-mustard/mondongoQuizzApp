'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface JsonTextareaProps {
  name: string;
  placeholder?: string;
  className?: string;
}

export default function JsonTextarea({ name, placeholder, className = '' }: JsonTextareaProps) {
  const [value, setValue] = useState(placeholder || '{}');

  return (
    <div className={`border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-[#4CAF50] transition-colors duration-200 ${className}`}>
      <input type="hidden" name={name} value={value} />
      <Editor
        height="300px"
        defaultLanguage="json"
        defaultValue={value}
        onChange={(val) => setValue(val ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          formatOnPaste: true,
          formatOnType: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
}
