import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
    { value: 'Not Started', label: 'Not Started', color: 'text-gray-500', icon: '⭕' },
    { value: 'In Progress', label: 'In Progress', color: 'text-blue-500', icon: '🔵' },
    { value: 'Complete', label: 'Complete', color: 'text-green-500', icon: '✅' },
    { value: 'Archived', label: 'Archived', color: 'text-gray-400', icon: '📦' },
];

const StatusBadge = ({ status = 'Not Started', onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (value) => {
        onChange(value);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition",
                    "hover:bg-muted border border-transparent hover:border-border",
                    currentStatus.color
                )}
            >
                <span>{currentStatus.icon}</span>
                <span>{currentStatus.label}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-lg z-50 py-1">
                    {STATUS_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition text-left",
                                option.color
                            )}
                        >
                            <span>{option.icon}</span>
                            <span className="flex-1">{option.label}</span>
                            {status === option.value && (
                                <Check className="h-4 w-4" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusBadge;
