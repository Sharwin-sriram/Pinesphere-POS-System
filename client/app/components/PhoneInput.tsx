import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiChevronDown } from 'react-icons/fi';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  disabled = false
}) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const countryCodes = [
    { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
    { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
    { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
    { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
    { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
    { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
    { code: '+61', country: 'AU', flag: '🇦🇺', name: 'Australia' },
  ];

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (phoneNumber.length <= 10) {
      onChange(phoneNumber);
    }
  };

  const handleCountrySelect = (code: string) => {
    setCountryCode(code);
    setIsDropdownOpen(false);
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)} ${phone.slice(3)}`;
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  };

  return (
    <div className="relative">
      <div className="relative">
        <FiPhone className="absolute left-4 top-5 text-slate-500 z-10" />
        
        {/* Country Code Selector */}
        <div className="absolute left-12 top-3 z-10">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center space-x-1 px-2 py-2 text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">
              {countryCodes.find(c => c.code === countryCode)?.flag}
            </span>
            <span className="text-sm font-medium">{countryCode}</span>
            <FiChevronDown className="w-3 h-3" />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-64 bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar-light"
            >
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country.code)}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50/50 transition-colors"
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm font-medium text-slate-600">{country.code}</span>
                  <span className="text-sm text-slate-500">{country.name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Phone Number Input */}
        <motion.input
          type="tel"
          value={formatPhoneNumber(value)}
          onChange={handlePhoneChange}
          placeholder="Enter mobile number"
          disabled={disabled}
          whileFocus={{ scale: 1.02, y: -2 }}
          transition={{ duration: 0.2 }}
          className={`w-full bg-white/60 backdrop-blur-sm border rounded-2xl px-4 py-4 pl-32 text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 ${
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

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default PhoneInput;