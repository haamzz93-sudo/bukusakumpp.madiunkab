import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string | number;
  label: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (val: any) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  direction?: 'up' | 'down' | 'auto';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih opsi...',
  className = '',
  size = 'md',
  fullWidth = true,
  direction = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine direction (up/down/auto) when opening
  useEffect(() => {
    if (!isOpen) return;
    if (direction === 'up') {
      setOpenUpward(true);
      return;
    }
    if (direction === 'down') {
      setOpenUpward(false);
      return;
    }

    // Auto-detect based on viewport and scrollable container space
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelowWindow = window.innerHeight - rect.bottom;
      let spaceBelow = spaceBelowWindow;

      let parent = dropdownRef.current.parentElement;
      while (parent && parent !== document.body) {
        const overflowY = window.getComputedStyle(parent).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          const parentRect = parent.getBoundingClientRect();
          const spaceBelowParent = parentRect.bottom - rect.bottom;
          spaceBelow = Math.min(spaceBelow, spaceBelowParent);
          break;
        }
        parent = parent.parentElement;
      }

      if (spaceBelow < 220 && rect.top > 180) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen, direction]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-xs rounded-xl',
    md: 'py-2 px-3.5 text-xs sm:text-sm rounded-xl',
    lg: 'py-2.5 px-4 text-sm rounded-2xl'
  };

  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {/* Trigger Button with Liquid Glass Design */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 transition-all duration-200 select-none ${sizeClasses[size]} ${
          isOpen
            ? 'bg-white dark:bg-slate-900 border-emerald-500 dark:border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
            : 'bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 shadow-sm'
        } border backdrop-blur-md font-medium text-slate-800 dark:text-slate-100`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-left leading-snug min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500 dark:text-slate-400">{selectedOption.icon}</span>
          )}
          <span className={`line-clamp-1 sm:line-clamp-2 ${!selectedOption && placeholder ? 'text-slate-400 dark:text-slate-500' : ''}`} title={selectedOption ? selectedOption.label : placeholder}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {selectedOption.badge}
            </span>
          )}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`} 
        />
      </button>

      {/* Popover Menu with Liquid Glass styling - Full Width & Direction Aware */}
      {isOpen && (
        <div 
          className={`absolute left-0 ${
            openUpward ? 'bottom-full mb-1.5 origin-bottom' : 'top-full mt-1.5 origin-top'
          } w-max min-w-full max-w-[360px] sm:max-w-md z-50 rounded-2xl bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-950/20 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
          role="listbox"
        >
          <div className="max-h-64 overflow-y-auto px-1 space-y-0.5 custom-scrollbar">
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/25'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2 text-left whitespace-normal break-words leading-snug flex-1">
                    {option.icon && (
                      <span className={`shrink-0 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className="break-words">{option.label}</span>
                    {option.badge && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {option.badge}
                      </span>
                    )}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
