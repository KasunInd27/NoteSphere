import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import useBlockStore from '@/store/useBlockStore';
import { cn } from '@/lib/utils';

const QuoteBlock = ({ block }) => {
    const { updateBlock, deleteBlock, addBlock } = useBlockStore();
    const lastContentRef = React.useRef(block.content);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Quote...',
            }),
        ],
        content: block.content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            lastContentRef.current = html;
            updateBlock(block._id, html);
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                if (event.key === 'Backspace' && view.state.doc.textContent.length === 0) {
                    deleteBlock(block._id);
                    return true;
                }
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    addBlock(block.pageId, block._id);
                    return true;
                }
                return false;
            },
        },
    });

    // Content sync for collaboration
    useEffect(() => {
        if (editor && block.content !== lastContentRef.current && !editor.isFocused) {
            editor.commands.setContent(block.content);
            lastContentRef.current = block.content;
        }
    }, [block.content, editor]);

    return (
        <div className="flex gap-4 my-4 p-4 pl-6 border-l-4 border-primary/40 bg-muted/20 rounded-r-lg group/quote transition-all hover:bg-muted/30">
            <div className="flex-1">
                <EditorContent
                    editor={editor}
                    className="prose dark:prose-invert max-w-none text-lg italic text-muted-foreground/80 leading-relaxed outline-none"
                />
            </div>
        </div>
    );
};

export default QuoteBlock;
