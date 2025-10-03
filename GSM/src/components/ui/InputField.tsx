import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  options?: { value: string; label: string }[];
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  registration,
  options,
  type = 'text',
  className = '',
  ...props
}) => {
  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  const renderInput = () => {
    if (type === 'select' && options) {
      return (
        <select
          className={`${baseInputClasses} ${errorClasses} ${className}`}
          {...registration}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          className={`${baseInputClasses} ${errorClasses} ${className} min-h-[100px] resize-vertical`}
          {...registration}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={type}
        className={`${baseInputClasses} ${errorClasses} ${className}`}
        {...registration}
        {...props}
      />
    );
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};