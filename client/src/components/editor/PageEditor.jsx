import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import useBlockStore from '@/store/useBlockStore';
import SortableBlock from './SortableBlock';

const PageEditor = ({ pageId }) => {
    const { blocks, fetchBlocks, isLoading, reorderBlocks, addBlock } = useBlockStore();
    const [activeId, setActiveId] = useState(null); // For drag overlay
    const [focusedBlockId, setFocusedBlockId] = useState(null); // To focus new blocks

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (pageId) fetchBlocks(pageId);
    }, [pageId, fetchBlocks]);

    // Handle initial empty state
    useEffect(() => {
        if (!isLoading && blocks.length === 0 && pageId) {
            // Create first block if empty?
            // addBlock(pageId, null);
        }
    }, [isLoading, blocks, pageId, addBlock]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = blocks.findIndex((b) => b._id === active.id);
            const newIndex = blocks.findIndex((b) => b._id === over.id);

            const newBlocks = arrayMove(blocks, oldIndex, newIndex);

            // Recalculate orders locally for now
            // Real implementation needs robust LexoRank or similar
            const reordered = newBlocks.map((b, idx) => ({
                ...b,
                order: (idx + 1) * 1024 // simplistic reset
            }));

            reorderBlocks(reordered);
        }
    };

    // Helper to capture newly added block ID to focus it
    // We wrapped addBlock but we need to pass a callback or state.
    // Actually, TipTapBlock uses `autoFocus` prop. 
    // We need to know WHICH block should be focused.
    // Simple way: When we add a block, we set `focusedBlockId` to its ID.
    // But `addBlock` is sync, return value is ready? yes async.

    // We need to override the addBlock from store or listen to changes.
    // Let's rely on standard logic: newly mounted component at end or specific position?
    // SortableBlock passes `autoFocus` if ID matches?

    if (isLoading) return <div className="p-10">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-40">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={blocks.map(b => b._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-1">
                        {blocks.map((block) => (
                            <SortableBlock
                                key={block._id}
                                block={block}
                                autoFocus={focusedBlockId === block._id}
                            />
                        ))}
                    </div>
                </SortableContext>

                {/* Drag Overlay for smooth visual */}
                <DragOverlay>
                    {activeId ? (
                        <div className="bg-background border rounded shadow-lg p-2 opacity-80">
                            Moving...
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Empty area click to add at bottom */}
            <div
                className="h-40 cursor-text -ml-8 pl-8"
                onClick={() => addBlock(pageId, blocks[blocks.length - 1]?._id)}
            >
                {blocks.length === 0 && <span className="text-muted-foreground/50">Click to add content...</span>}
            </div>
        </div>
    );
};

export default PageEditor;
