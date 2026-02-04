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

    // Handle type changes (if block type changes from dropdown)
    useEffect(() => {
        if (editor && block.type) {
            // This is tricky. If type is 'heading', we need to set the node type in TipTap?
            // Or typically, creating a 'heading' block means creating a TipTap instance configured as a heading?
            // Actually, for a block-based editor, usually each block IS a specific node.
            // But if we separate them, we can enforce it.
            // For now, let's just assume `content` HTML carries the tag (<h1> etc).
        }
    }, [block.type, editor]);

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
                // In a real slash command, we check if it is at start of line or properly spaced.
                // For MVP: if block content is just "/", show menu.
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

    // Update config when block type changes
    useEffect(() => {
        if (editor && block.type) {
            // For headings, we could enforce content structure.
            // But simpler: just trust the editor to render HTML.
            // However, placeholder needs update.
            // The placeholder extension is configured at init. Update it via commands?
            // TipTap extension re-config is tricky. 
            // Re-rendering Component might be key if type changes?
        }
    }, [block.type, editor]);

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
                // Import SlashMenu dynamically or just use it if imported
                <SlashMenu blockId={block._id} onClose={() => {
                    setShowSlashMenu(false);
                    // Maybe clear the "/"?
                    editor.commands.deleteRange({ from: editor.state.selection.from - 1, to: editor.state.selection.from });
                }} />
            )}
        </div>
    );
};

export default TipTapBlock;
