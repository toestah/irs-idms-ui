import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';
import styles from './TextInput.module.css';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  inputClassName?: string;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className = '', inputClassName = '', label, error, startIcon, endIcon, fullWidth, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
          {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={`${styles.input} ${startIcon ? styles.withStartIcon : ''} ${
              endIcon ? styles.withEndIcon : ''
            } ${inputClassName}`}
            {...props}
          />
          {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
        </div>
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

// Convenience variant for Search
export const SearchInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (props, ref) => (
    <TextInput
      ref={ref}
      type="search"
      placeholder="Search..."
      startIcon={<Search size={20} />}
      {...props}
    />
  )
);

SearchInput.displayName = 'SearchInput';
