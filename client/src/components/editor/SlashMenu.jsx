import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
                e.preventDefault();
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const selectItem = (item) => {
        // Update block type and props
        // Note: This is a simplified version. In production, you'd want to:
        // 1. Clear the "/" character
        // 2. Convert content if needed
        // 3. Update block type via a proper API
        updateBlock(blockId, '', item.props || {});
        onClose();
    };

    return createPortal(
        <div
            ref={menuRef}
            className="fixed z-[9999] w-64 bg-popover border border-border rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className="p-1">
                <div className="text-xs font-semibold text-muted-foreground px-2 py-1.5">Basic blocks</div>
                {MENU_ITEMS.map((item, index) => (
                    <div
                        key={item.label}
                        className={cn(
                            "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer transition-colors",
                            index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => selectItem(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>,
        document.body
    );
};

export default SlashMenu;
