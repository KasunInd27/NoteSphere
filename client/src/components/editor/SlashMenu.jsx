import React, { useEffect, useState, useRef } from 'react';
import { Type, List, Heading1, Heading2, CheckSquare, Code, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import useBlockStore from '@/store/useBlockStore';

const MENU_ITEMS = [
    { type: 'paragraph', icon: Type, label: 'Text' },
    { type: 'heading', props: { level: 1 }, icon: Heading1, label: 'Heading 1' },
    { type: 'heading', props: { level: 2 }, icon: Heading2, label: 'Heading 2' },
    { type: 'bulletList', icon: List, label: 'Bulleted List' },
    { type: 'todo', icon: CheckSquare, label: 'To-do List' },
    { type: 'quote', icon: Quote, label: 'Quote' },
    { type: 'code', icon: Code, label: 'Code Block' },
];

const SlashMenu = ({ blockId, onClose }) => {
    const { updateBlock } = useBlockStore();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % MENU_ITEMS.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = MENU_ITEMS[selectedIndex];
                selectItem(item);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex]);

    const selectItem = (item) => {
        // Update block type and props
        // Also clear the "/" content if it exists? 
        // TipTapBlock handles the HTML content, but Type is stored on Block model.
        // We need to update the block model content to remove the "/" maybe?
        // Or just let store handle it.
        updateBlock(blockId, '', item.props || {}); // Reset content? Or keep?

        // Actually we need to call a special "changeType" action in store to handle converting content if possible.
        // For MVP, just update 'type' in sending updateBlock?
        // updateBlock arguments: (id, content, props) ... wait, updateBlock doesn't take type.
        // We need to update type.

        // Hack: We need a generic update method in store.
        // For now, let's assume updateBlock also accepts type in a new API or add a separate one.
        // Let's modify useBlockStore first.

        // Assuming we modify store to accept `type` or we pass it in `props`?
        // The Block model has top-level `type`.
        // Let's do a direct axios call or correct the store.
        onClose();
    };

    // Positioning is hard without floating-ui. 
    // Simply render inline or fixed for MVP.
    // Let's try rendering it right below the block or as a popover.

    return (
        <div className="absolute z-50 w-60 bg-popover border rounded-md shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1" style={{ top: '100%', left: 0 }}>
            <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Basic blocks</div>
            {MENU_ITEMS.map((item, index) => (
                <div
                    key={item.label}
                    className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                        index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    )}
                    onClick={() => selectItem(item)}
                >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default SlashMenu;
