import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import TipTapBlock from './TipTapBlock';

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

    const [showHandle, setShowHandle] = useState(false);

    // We only enable drag handle when hovering the row
    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex items-start -ml-8 pl-8 py-1"
            onMouseEnter={() => setShowHandle(true)}
            onMouseLeave={() => setShowHandle(false)}
        >
            {/* Drag Handle & Menu Trigger */}
            <div
                className="absolute left-0 top-1.5 w-6 h-6 flex items-center justify-center cursor-grab text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={18} />
            </div>

            {/* Adding button (optional, maybe on hover?) */}

            {/* Content */}
            <div className="flex-1 min-w-0">
                <TipTapBlock block={block} autoFocus={autoFocus} />
            </div>
        </div>
    );
};

export default SortableBlock;
