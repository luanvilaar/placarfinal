import React, { useState, useEffect } from 'react';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, className }) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (val.length > 4) val = val.slice(0, 4); // Máximo 4 dígitos

    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.slice(0, 2)}:${val.slice(2)}`;
    }

    setInternalValue(formatted);
    
    // Só envia para o estado global se estiver completo (00:00)
    if (formatted.length === 5) {
      onChange(formatted);
    }
  };

  return (
    <input
      type="text"
      value={internalValue}
      onChange={handleChange}
      placeholder="00:00"
      className={`bg-surface border border-border rounded px-3 py-2 text-white font-mono focus:border-violet focus:outline-none transition-colors ${className}`}
    />
  );
};
