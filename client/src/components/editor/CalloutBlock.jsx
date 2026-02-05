import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import useBlockStore from '@/store/useBlockStore';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const VARIANTS = {
    info: {
        icon: <Info className="h-5 w-5 text-blue-500" />,
        bg: 'bg-blue-50/50 dark:bg-blue-900/10',
        border: 'border-blue-200 dark:border-blue-800',
    },
    warning: {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        bg: 'bg-amber-50/50 dark:bg-amber-900/10',
        border: 'border-amber-200 dark:border-amber-800',
    },
    success: {
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
        border: 'border-emerald-200 dark:border-emerald-800',
    },
    danger: {
        icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
        bg: 'bg-rose-50/50 dark:bg-rose-900/10',
        border: 'border-rose-200 dark:border-rose-800',
    }
};

const CalloutBlock = ({ block }) => {
    const { updateBlock, deleteBlock, addBlock } = useBlockStore();
    const lastContentRef = React.useRef(block.content);
    const variantKey = block.props?.variant || 'info';
    const config = VARIANTS[variantKey] || VARIANTS.info;

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Callout text...',
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

    useEffect(() => {
        if (editor && block.content !== lastContentRef.current && !editor.isFocused) {
            editor.commands.setContent(block.content);
            lastContentRef.current = block.content;
        }
    }, [block.content, editor]);

    return (
        <div className={cn(
            "flex gap-3 my-4 p-4 rounded-lg border transition-colors group/callout",
            config.bg,
            config.border
        )}>
            <div className="shrink-0 mt-0.5">
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <EditorContent
                    editor={editor}
                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed outline-none"
                />
            </div>
        </div>
    );
};

export default CalloutBlock;
