import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

const SlashCommandList = forwardRef((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (item) => {
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(props.items[selectedIndex]);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    // Group items by category
    const categories = props.items.reduce((acc, item) => {
        const category = item.category || 'Basic';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Need a way to map absolute index (from props.items) back during render
    // Since props.items is already filtered by the extension
    let itemIndexOffset = 0;

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className="z-50 w-72 bg-popover border border-border rounded-lg shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-1.5 max-h-[400px] overflow-y-auto scrollbar-hide">
                {props.items.length > 0 ? (
                    Object.entries(categories).map(([category, items], catIndex) => {
                        const startIndex = itemIndexOffset;
                        itemIndexOffset += items.length;

                        return (
                            <div key={category} className="mb-2 last:mb-0">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60 px-2 py-1.5 mb-0.5">
                                    {category}
                                </div>
                                <div className="space-y-0.5">
                                    {items.map((item, localIndex) => {
                                        const globalIndex = startIndex + localIndex;
                                        return (
                                            <button
                                                key={item.title}
                                                className={cn(
                                                    'flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md cursor-pointer transition-all text-left group',
                                                    globalIndex === selectedIndex
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'hover:bg-accent/50 text-foreground/80'
                                                )}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    selectItem(item);
                                                }}
                                            >
                                                <div className={cn(
                                                    "flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-background shrink-0 text-lg shadow-sm transition-all duration-200 group-hover:scale-110",
                                                    globalIndex === selectedIndex && "border-primary/50 bg-primary/10 text-primary shadow-primary/20",
                                                    item.category === 'Text' && "text-blue-500",
                                                    item.category === 'Lists' && "text-purple-500",
                                                    item.category === 'Media' && "text-pink-500",
                                                    item.category === 'Advanced' && "text-orange-500"
                                                )}>
                                                    {item.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-[13px] leading-tight mb-0.5 tracking-tight">{item.title}</div>
                                                    <div className="text-[11px] text-muted-foreground/80 truncate leading-tight">
                                                        {item.description}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No results found
                    </div>
                )}
            </div>
        </div>
    );
});

SlashCommandList.displayName = 'SlashCommandList';

export default SlashCommandList;
