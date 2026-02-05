import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAG_COLORS = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
];

const Tag = ({ tag, onRemove, colorIndex }) => {
    const colorClass = TAG_COLORS[colorIndex % TAG_COLORS.length];

    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
            colorClass
        )}>
            <span>{tag}</span>
            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="hover:bg-black/10 dark:hover:bg-white/10 rounded-sm p-0.5 transition"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

const TagInput = ({ tags = [], onTagsChange, className }) => {
    const [inputValue, setInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onTagsChange([...tags, trimmed]);
            setInputValue('');
            setIsAdding(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        } else if (e.key === 'Escape') {
            setInputValue('');
            setIsAdding(false);
        }
    };

    const handleRemoveTag = (index) => {
        onTagsChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className={cn("flex items-center gap-2 flex-wrap", className)}>
            {tags.map((tag, index) => (
                <Tag
                    key={index}
                    tag={tag}
                    colorIndex={index}
                    onRemove={() => handleRemoveTag(index)}
                />
            ))}

            {isAdding ? (
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleAddTag}
                    placeholder="Tag name..."
                    autoFocus
                    className="px-2 py-0.5 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary w-24"
                />
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition"
                >
                    <Plus className="h-3 w-3" />
                    <span>Add tag</span>
                </button>
            )}
        </div>
    );
};

export { Tag, TagInput };
