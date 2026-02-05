import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import useBlockStore from '@/store/useBlockStore';
import TipTapBlock from './TipTapBlock';
import AttachmentBlock from './AttachmentBlock';
import DividerBlock from './DividerBlock';
import QuoteBlock from './QuoteBlock';
import CalloutBlock from './CalloutBlock';

const SortableBlock = ({ block, autoFocus }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1,
        position: 'relative'
    };

    const { deleteBlock } = useBlockStore();

    // We only enable drag handle when hovering the row
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex items-start -ml-12 pl-12 py-1"
        >
            {/* Action Bar (Grip + Trash) */}
            <div className="absolute left-0 top-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div
                    className="w-5 h-6 flex items-center justify-center cursor-grab text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={16} />
                </div>
                <button
                    onClick={() => deleteBlock(block._id)}
                    className="w-5 h-6 flex items-center justify-center text-muted-foreground/30 hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                    title="Delete block"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Adding button (optional, maybe on hover?) */}

            {/* Content */}
            <div className="flex-1 min-w-0">
                {['image', 'video', 'pdf'].includes(block.type) ? (
                    <AttachmentBlock block={block} />
                ) : block.type === 'divider' ? (
                    <DividerBlock block={block} />
                ) : block.type === 'quote' ? (
                    <QuoteBlock block={block} />
                ) : block.type === 'callout' ? (
                    <CalloutBlock block={block} />
                ) : (
                    <TipTapBlock key={block._id} block={block} autoFocus={autoFocus} />
                )}
            </div>
        </div>
    );
};

export default SortableBlock;
