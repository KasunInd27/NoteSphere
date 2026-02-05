import { create } from 'zustand';
import axios from 'axios';
import useSocketStore from './useSocketStore'; // Import for socket emitting

// Wait, mongo gives IDs. For optimistic, we can use temp IDs but it's tricky.
// Better to simple wait for server or use random strings and replace. 
// Let's use simple array for now.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const saveTimers = new Map();
const deletingIds = new Set();

const useBlockStore = create((set, get) => ({
    blocks: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchBlocks: async (pageId) => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/api/blocks/page/${pageId}`, { withCredentials: true });
            set({ blocks: response.data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch blocks', error);
            set({ isLoading: false, error: 'Failed to load content' });
        }
    },

    // Save a block to the backend
    saveBlock: async (id) => {
        // Guard: Stop if block is being deleted
        if (deletingIds.has(id)) return;

        const { blocks } = get();
        const block = blocks.find(b => b._id === id);

        // If block no longer exists in state, don't try to save
        if (!block) {
            return;
        }

        try {
            set({ isSaving: true });
            await axios.put(`${API_URL}/api/blocks/${id}`, {
                content: block.content,
                props: block.props,
                type: block.type
            }, { withCredentials: true });
            set({ isSaving: false });
        } catch (error) {
            // If 404, the block might have been deleted on the server already
            if (error.response?.status === 404) {
                console.warn(`[Store] Block ${id} not found on server. Stopping save retries.`);
                // Clean up any pending timers
                if (saveTimers.has(id)) {
                    clearTimeout(saveTimers.get(id));
                    saveTimers.delete(id);
                }
            } else {
                console.error('Failed to save block', error);
                set({ isSaving: false, error: 'Failed to save changes' });
            }
        }
    },

    // Update a single block (optimistic + per-block debounce save)
    updateBlock: (id, content, props, type) => {
        // Guard: Stop if block is being deleted
        if (deletingIds.has(id)) return;

        const { blocks } = get();
        const index = blocks.findIndex(b => b._id === id);
        if (index === -1) return;

        const updatedBlocks = [...blocks];
        updatedBlocks[index] = {
            ...updatedBlocks[index],
            content: content !== undefined ? content : updatedBlocks[index].content,
            ...(props !== undefined && { props }),
            ...(type !== undefined && { type })
        };

        set({ blocks: updatedBlocks });

        // Emit socket update
        const { emitUpdateBlock } = useSocketStore.getState();
        emitUpdateBlock(updatedBlocks[index].pageId, id, updatedBlocks[index].content, updatedBlocks[index].type, updatedBlocks[index].props);

        // Per-block debouncing
        if (saveTimers.has(id)) {
            clearTimeout(saveTimers.get(id));
        }

        const timer = setTimeout(() => {
            get().saveBlock(id);
            saveTimers.delete(id);
        }, 1000);

        saveTimers.set(id, timer);
    },

    // Remote update (does NOT trigger save)
    updateBlockFromSocket: (id, content, props, type) => {
        if (deletingIds.has(id)) return;

        const { blocks } = get();
        const index = blocks.findIndex(b => b._id === id);
        if (index === -1) return;

        const updatedBlocks = [...blocks];
        updatedBlocks[index] = {
            ...updatedBlocks[index],
            content: content !== undefined ? content : updatedBlocks[index].content,
            ...(props !== undefined && { props }),
            ...(type !== undefined && { type })
        };

        set({ blocks: updatedBlocks });
    },

    addBlock: async (pageId, previousBlockId, type = 'paragraph') => {
        const { blocks } = get();
        const index = blocks.findIndex(b => b._id === previousBlockId);

        let newOrder = 0;
        if (index !== -1) {
            const prevOrder = blocks[index].order || 0;
            const nextOrder = blocks[index + 1]?.order;
            if (nextOrder) {
                newOrder = (prevOrder + nextOrder) / 2;
            } else {
                newOrder = prevOrder + 1024;
            }
        } else {
            const lastBlock = blocks[blocks.length - 1];
            newOrder = lastBlock ? (lastBlock.order || 0) + 1024 : 1024;
        }

        try {
            const response = await axios.post(`${API_URL}/api/blocks`, {
                pageId,
                type,
                content: '',
                order: newOrder
            }, { withCredentials: true });

            const newBlock = response.data;

            const newBlocks = [...blocks];
            if (index !== -1) {
                newBlocks.splice(index + 1, 0, newBlock);
            } else {
                newBlocks.push(newBlock);
            }

            set({ blocks: newBlocks });
            return newBlock;
        } catch (error) {
            console.error("Failed to add block", error);
        }
    },

    deleteBlock: async (id) => {
        // Mark as deleting immediately to block any further updates/saves
        deletingIds.add(id);

        // Cancel any pending debounced save for THIS block
        if (saveTimers.has(id)) {
            clearTimeout(saveTimers.get(id));
            saveTimers.delete(id);
        }

        set(state => ({ blocks: state.blocks.filter(b => b._id !== id) }));
        try {
            await axios.delete(`${API_URL}/api/blocks/${id}`, { withCredentials: true });
        } catch (error) {
            console.error("Failed to delete block", error);
        } finally {
            // Optional: clean up deletingIds after some time to keep memory low
            setTimeout(() => deletingIds.delete(id), 5000);
        }
    },

    reorderBlocks: async (newBlocks) => {
        set({ blocks: newBlocks });
    }
}));

export default useBlockStore;
