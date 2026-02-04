import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import useBlockStore from '@/store/useBlockStore';
import SlashMenu from './SlashMenu';
import { cn } from '@/lib/utils';

const TipTapBlock = ({ block, autoFocus }) => {
    const { updateBlock, addBlock, deleteBlock } = useBlockStore();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Placeholder.configure({
                placeholder: block.type === 'heading' ? `Heading ${block.props?.level || 1}` : 'Type "/" for commands',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none before:h-0',
            }),
        ],
        content: block.content, // Initial content
        onUpdate: ({ editor }) => {
            updateBlock(block._id, editor.getHTML(), block.props);
        },
        onKeyDown: ({ editor, event }) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                // Prevent default new line behavior if we want to create a new BLOCK instead
                // But TipTap creates <p> by default.
                // If we want Notion style "Enter = New Block":
                event.preventDefault();
                addBlock(block.pageId, block._id);
                return true;
            }
            if (event.key === 'Backspace' && editor.isEmpty) {
                event.preventDefault();
                deleteBlock(block._id);
                // Need to focus previous block? Handled in parent maybe.
                return true;
            }
            // Slash command handling could go here
        }
    });

    // Handle type changes or specific block logic
    useEffect(() => {
        if (editor && block.type) {
            // Placeholder for type-specific logic
        }
    }, [block.type, editor]);

    // Sync changes from outside (e.g. from Socket)
    useEffect(() => {
        if (editor && block.content && block.content !== editor.getHTML()) {
            if (!editor.isFocused) {
                editor.commands.setContent(block.content);
            }
        }
    }, [block.content, editor]);

    useEffect(() => {
        if (editor && autoFocus) {
            editor.commands.focus('end');
        }
    }, [editor, autoFocus]);

    const [showSlashMenu, setShowSlashMenu] = React.useState(false);

    // Simple "/" detection
    useEffect(() => {
        if (!editor) return;

        const updateListener = () => {
            const { from } = editor.state.selection;
            const textBefore = editor.state.doc.textBetween(from - 1, from, '\n', '\0');
            if (textBefore === '/') {
                if (editor.getText() === '/') {
                    setShowSlashMenu(true);
                } else {
                    setShowSlashMenu(false);
                }
            } else {
                setShowSlashMenu(false);
            }
        };

        editor.on('update', updateListener);
        return () => editor.off('update', updateListener);
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="w-full relative group/block">
            {/* Placeholder for menu trigger if needed */}

            <EditorContent editor={editor} className={cn(
                "outline-none min-h-[1.5em] prose dark:prose-invert max-w-none text-base",
                block.type === 'heading' && block.props?.level === 1 && "text-4xl font-bold",
                block.type === 'heading' && block.props?.level === 2 && "text-2xl font-bold",
                block.type === 'heading' && block.props?.level === 3 && "text-xl font-bold",
                block.type === 'code' && "font-mono bg-muted p-2 rounded",
                block.type === 'quote' && "border-l-4 pl-4 italic text-muted-foreground",
            )} />

            {showSlashMenu && (
                <SlashMenu blockId={block._id} onClose={() => {
                    setShowSlashMenu(false);
                    editor.commands.deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from });
                }} />
            )}
        </div>
    );
};

export default TipTapBlock;
