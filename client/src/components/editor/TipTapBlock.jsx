import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { SlashCommand, getSuggestionConfig } from './SlashCommandExtension';
import useBlockStore from '@/store/useBlockStore';
import { cn } from '@/lib/utils';

const TipTapBlock = ({ block, autoFocus }) => {
    const { updateBlock, addBlock, deleteBlock, blocks } = useBlockStore();
    const lastContentRef = React.useRef(block.content);
    const isDeletingRef = React.useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: 'font-mono bg-muted p-4 rounded-md my-2',
                    },
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'not-prose pl-2',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2 my-1',
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (block.type === 'heading') {
                        return `Heading ${block.props?.level || 1}`;
                    }
                    return 'Type "/" for commands';
                },
                showOnlyCurrent: true,
                emptyEditorClass: 'is-editor-empty',
            }),
            SlashCommand.configure({
                suggestion: getSuggestionConfig(updateBlock, block._id),
            }),
        ],
        content: block.content,
        onUpdate: ({ editor }) => {
            // Guard: Only update if block has valid _id and is not being deleted
            if (!block._id || isDeletingRef.current) {
                return;
            }

            const html = editor.getHTML();
            lastContentRef.current = html;

            // Only update content, not props (props are updated separately by slash commands)
            updateBlock(block._id, html);
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                const { state } = view;
                const { selection } = state;
                const { $from } = selection;

                // Robust check for containing nodes
                const isInsideNode = (name) => {
                    for (let d = $from.depth; d > 0; d--) {
                        if ($from.node(d).type.name === name) return true;
                    }
                    return false;
                };

                const isInList = isInsideNode('listItem') || isInsideNode('taskItem');
                const isInCodeBlock = isInsideNode('codeBlock');

                // Handle Enter key
                if (event.key === 'Enter' && !event.shiftKey) {
                    // Let TipTap handle Enter inside lists or code blocks
                    if (isInList || isInCodeBlock) {
                        return false;
                    }

                    // For normal blocks, create a new DB block
                    event.preventDefault();
                    addBlock(block.pageId, block._id);
                    return true;
                }

                // Handle Backspace on empty block
                if (event.key === 'Backspace') {
                    const { doc } = state;
                    // Truly empty means no text AND only one empty paragraph node
                    const isTrulyEmpty = doc.content.size === 2 && doc.textContent.length === 0;

                    // Only delete the entire DB block if we are NOT inside a list structure
                    // (because TipTap handles merging items/unwrapping lists via backspace)
                    if (isTrulyEmpty && !isInList) {
                        event.preventDefault();
                        isDeletingRef.current = true;
                        deleteBlock(block._id);
                        return true;
                    }
                }

                return false;
            },
        },
    }, [block._id]); // Critical: Only re-create editor if block ID changes

    // Check if block still exists in store
    useEffect(() => {
        const exists = blocks.find(b => b._id === block._id);
        if (!exists) {
            isDeletingRef.current = true;
        }
    }, [blocks, block._id]);

    // Sync changes from outside (e.g. from Socket)
    useEffect(() => {
        if (editor && block.content !== undefined && block.content !== lastContentRef.current && !isDeletingRef.current) {
            // Check if content is actually different from editor's current content
            // AND we are not currently editing (focused)
            if (editor.getHTML() !== block.content) {
                if (!editor.isFocused) {
                    editor.commands.setContent(block.content);
                    lastContentRef.current = block.content;
                }
            }
        }
    }, [block.content, editor]);

    useEffect(() => {
        if (editor && autoFocus && !isDeletingRef.current) {
            // Use setTimeout to ensure editor is ready and prevent race conditions
            setTimeout(() => {
                if (editor && !editor.isDestroyed) {
                    editor.commands.focus('end');
                }
            }, 0);
        }
    }, [editor, autoFocus]);

    if (!editor || isDeletingRef.current || !block?._id) return null;

    return (
        <div className="w-full relative group/block">
            <EditorContent
                editor={editor}
                className={cn(
                    'outline-none min-h-[1.5em] prose dark:prose-invert max-w-none text-base',
                    'prose-ul:list-disc prose-ol:list-decimal prose-li:my-0 prose-ul:pl-6 prose-ol:pl-6',
                    // Placeholder styles - only show in first empty paragraph
                    '[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
                    '[&_p.is-editor-empty:first-child]:before:text-muted-foreground/40',
                    '[&_p.is-editor-empty:first-child]:before:float-left',
                    '[&_p.is-editor-empty:first-child]:before:pointer-events-none',
                    '[&_p.is-editor-empty:first-child]:before:h-0',
                    // Block type styles
                    block.type === 'heading' && block.props?.level === 1 && 'text-4xl font-bold',
                    block.type === 'heading' && block.props?.level === 2 && 'text-2xl font-bold',
                    block.type === 'heading' && block.props?.level === 3 && 'text-xl font-bold',
                    block.type === 'code' && 'font-mono bg-muted p-2 rounded',
                    block.type === 'quote' && 'border-l-4 pl-4 italic text-muted-foreground'
                )}
            />
        </div>
    );
};

export default TipTapBlock;
