import { create } from 'zustand';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // We might need this or just use optimistic IDs
// Wait, mongo gives IDs. For optimistic, we can use temp IDs but it's tricky.
// Better to simple wait for server or use random strings and replace. 
// Let's use simple array for now.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const useBlockStore = create((set, get) => ({
    blocks: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchBlocks: async (pageId) => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/api/pages/${pageId}/blocks`, { withCredentials: true });
            set({ blocks: response.data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch blocks', error);
            set({ isLoading: false, error: 'Failed to load content' });
        }
    },

    // Update a single block (optimistic + debounce save)
    updateBlock: (id, content, props, type) => {
        const { blocks } = get();
        const index = blocks.findIndex(b => b._id === id);
        if (index === -1) return;

        const updatedBlocks = [...blocks];
        updatedBlocks[index] = {
            ...updatedBlocks[index],
            content: content !== undefined ? content : updatedBlocks[index].content,
            props: props || updatedBlocks[index].props,
            type: type || updatedBlocks[index].type
        };

        set({ blocks: updatedBlocks, isSaving: true });
        get().debouncedSaveBlock(id, updatedBlocks[index]); // Pass full object to be safe
    },

    debouncedSaveBlock: debounce(async (id, blockData) => {
        try {
            await axios.put(`${API_URL}/api/blocks/${id}`, {
                content: blockData.content,
                props: blockData.props,
                type: blockData.type
            }, { withCredentials: true });
            set({ isSaving: false });
        } catch (error) {
            console.error('Failed to save block', error);
            set({ isSaving: false, error: 'Failed to save changes' });
        }
    }, 1000),

    addBlock: async (pageId, previousBlockId, type = 'paragraph') => {
        const { blocks } = get();
        const index = blocks.findIndex(b => b._id === previousBlockId);

        // Calculate order:
        // This is naive. Ideally we use LexoRank or decent spacing. 
        // MVP: Just huge gaps or re-normalize.
        // Let's rely on finding the previous block and adding to the list locally, 
        // then letting backend handle order or we handle order explicitly.
        // Let's send `order` explicitly.

        let newOrder = 0;
        if (index !== -1) {
            // We want to insert AFTER previousBlockId
            const prevOrder = blocks[index].order || 0;
            const nextOrder = blocks[index + 1]?.order;
            if (nextOrder) {
                newOrder = (prevOrder + nextOrder) / 2;
            } else {
                newOrder = prevOrder + 1024; // Arbitrary gap
            }
        } else {
            // Start of list? or End if previousBlockId is null? assumed end if null
            const lastBlock = blocks[blocks.length - 1];
            newOrder = lastBlock ? (lastBlock.order || 0) + 1024 : 1024;
        }

        // Optimistic add? No, we need DB ID for keys. 
        // Let's wait for creation. It's fast usually.
        try {
            const response = await axios.post(`${API_URL}/api/blocks`, {
                pageId,
                type,
                content: '',
                order: newOrder
            }, { withCredentials: true });

            const newBlock = response.data;

            // Insert into local state
            const newBlocks = [...blocks];
            if (index !== -1) {
                newBlocks.splice(index + 1, 0, newBlock);
            } else {
                newBlocks.push(newBlock);
            }

            set({ blocks: newBlocks });
            return newBlock; // Return so we can focus it
        } catch (error) {
            console.error("Failed to add block", error);
        }
    },

    deleteBlock: async (id) => {
        set(state => ({ blocks: state.blocks.filter(b => b._id !== id) }));
        try {
            await axios.delete(`${API_URL}/api/blocks/${id}`, { withCredentials: true });
        } catch (error) {
            console.error("Failed to delete block", error);
            // Revert?
        }
    },

    reorderBlocks: async (newBlocks) => {
        // Optimistic
        set({ blocks: newBlocks });

        // Sync order to backend
        // We should update ALL blocks that changed order.
        // For MVP, maybe only update the moved one with new order calculation?
        // `newBlocks` is the array in new order.
        // Let's loop and update those whose index doesn't match 'order' implies?
        // Actually, we need to assign new 'order' values to persisted blocks.
        // Let's just update ALL order values for now (inefficient but works for small pages).
        // Or better: update only if necessary.
        // TODO: Implement proper reorder sync.
    }
}));

export default useBlockStore;
