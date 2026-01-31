import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const usePageStore = create((set, get) => ({
    pages: [],
    isLoading: false,
    expanded: {}, // { pageId: boolean }

    // Fetch all pages and organize into tree (if needed) or just flat list
    fetchPages: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_URL}/api/pages`, { withCredentials: true });
            set({ pages: response.data, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch pages', error);
            set({ isLoading: false });
        }
    },

    createPage: async (title = "Untitled", parentId = null) => {
        try {
            const response = await axios.post(`${API_URL}/api/pages`,
                { title, parentId },
                { withCredentials: true }
            );
            // Optimistic update or refetch
            const newPage = response.data;
            set(state => ({ pages: [newPage, ...state.pages] }));

            // Auto expand parent
            if (parentId) {
                get().toggleExpand(parentId, true);
            }

            return newPage;
        } catch (error) {
            console.error('Failed to create page', error);
        }
    },

    deletePage: async (pageId) => {
        // Optimistic delete
        set(state => ({ pages: state.pages.filter(p => p._id !== pageId) }));
        try {
            await axios.delete(`${API_URL}/api/pages/${pageId}`, { withCredentials: true });
        } catch (error) {
            console.error("Failed to delete page", error);
            // Revert if needed, but for now just log
            get().fetchPages();
        }
    },

    toggleExpand: (pageId, forceState) => {
        set(state => ({
            expanded: {
                ...state.expanded,
                [pageId]: forceState !== undefined ? forceState : !state.expanded[pageId]
            }
        }));
    }

}));

export default usePageStore;
