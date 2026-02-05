import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SlashCommandList from './SlashCommandList';

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                startOfLine: false,
                command: ({ editor, range, props }) => {
                    props.command({ editor, range });
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});

export const getSuggestionConfig = (updateBlock, blockId) => ({
    char: '/',

    // Allow slash commands anywhere, not just start of line
    startOfLine: false,

    // Custom logic to find slash command text
    // This allows /t, /hea, etc to keep menu open
    allowSpaces: false,

    items: ({ query }) => {
        const items = [
            {
                title: 'Text',
                description: 'Just start typing with plain text.',
                icon: '📝',
                category: 'Text',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).setParagraph().run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), {}, 'paragraph'), 0);
                },
            },
            {
                title: 'Heading 1',
                description: 'Big section heading.',
                icon: 'H1',
                category: 'Text',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), { level: 1 }, 'heading'), 0);
                },
            },
            {
                title: 'Heading 2',
                description: 'Medium section heading.',
                icon: 'H2',
                category: 'Text',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), { level: 2 }, 'heading'), 0);
                },
            },
            {
                title: 'Heading 3',
                description: 'Small section heading.',
                icon: 'H3',
                category: 'Text',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), { level: 3 }, 'heading'), 0);
                },
            },
            {
                title: 'Bullet List',
                description: 'Create a simple bullet list.',
                icon: '•',
                category: 'Lists',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleBulletList().run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), {}, 'bulletList'), 0);
                },
            },
            {
                title: 'Numbered List',
                description: 'Create a list with numbering.',
                icon: '1.',
                category: 'Lists',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleOrderedList().run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), {}, 'orderedList'), 0);
                },
            },
            {
                title: 'To-do List',
                description: 'Track tasks with checkboxes.',
                icon: '☑️',
                category: 'Lists',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleTaskList().run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), {}, 'todo'), 0);
                },
            },
            {
                title: 'Quote',
                description: 'Capture a quote.',
                icon: '❝',
                category: 'Text',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', {}, 'quote'), 0);
                },
            },
            {
                title: 'Divider',
                description: 'Visually divide sections.',
                icon: '—',
                category: 'Advanced',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', {}, 'divider'), 0);
                },
            },
            {
                title: 'Callout',
                description: 'Important info, warnings, etc.',
                icon: '💡',
                category: 'Advanced',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', { variant: 'info' }, 'callout'), 0);
                },
            },
            {
                title: 'Image',
                description: 'Upload or embed an image.',
                icon: '🖼️',
                category: 'Media',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', {}, 'image'), 0);
                },
            },
            {
                title: 'Video',
                description: 'Embed a video.',
                icon: '🎬',
                category: 'Media',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', {}, 'video'), 0);
                },
            },
            {
                title: 'PDF',
                description: 'Add a PDF document.',
                icon: '📄',
                category: 'Media',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).run();
                    setTimeout(() => updateBlock(blockId, '', {}, 'pdf'), 0);
                },
            },
            {
                title: 'Code Block',
                description: 'Capture a code snippet.',
                icon: '</>',
                category: 'Advanced',
                command: ({ editor, range }) => {
                    editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
                    setTimeout(() => updateBlock(blockId, editor.getHTML(), {}, 'code'), 0);
                },
            },
        ];

        return items.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        );
    },

    render: () => {
        let component;
        let popup;

        return {
            onStart: (props) => {
                component = new ReactRenderer(SlashCommandList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                    theme: 'slash-command',
                    maxWidth: 'none',
                });
            },

            onUpdate(props) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                });
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    if (popup && popup[0]) {
                        popup[0].hide();
                    }

                    // Delete the slash command text when closing with Escape
                    const { range } = props;
                    props.editor.chain().focus().deleteRange(range).run();

                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                if (popup && popup[0]) {
                    // Check if destroy method exists before calling (robustness)
                    if (typeof popup[0].destroy === 'function') {
                        popup[0].destroy();
                    }
                    popup = null;
                }
                if (component) {
                    if (typeof component.destroy === 'function') {
                        component.destroy();
                    }
                    component = null;
                }
            },
        };
    },
});
