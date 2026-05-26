import React from 'react';
import { motion } from 'framer-motion';

interface InputFieldProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  icon,
  error,
  disabled = false
}) => {
  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-5 text-slate-500 z-10">
            {icon}
          </div>
        )}
        <motion.input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          whileFocus={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
          className={`w-full bg-white/60 backdrop-blur-sm border rounded-2xl px-4 py-4 text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${
            icon ? 'pl-12' : 'pl-4'
          } ${
            error 
              ? 'border-red-400 focus:ring-red-400 bg-red-50/60' 
              : 'border-white/40 hover:border-blue-300'
          } ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/70'
          }`}
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-2 text-red-500 text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default InputField;