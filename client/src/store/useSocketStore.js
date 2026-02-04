import { create } from 'zustand';
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
    socket: null,
    activeUsers: {}, // { socketId: user }
    isConnected: false,

    connect: () => {
        if (get().socket) return;

        const socket = io(URL, {
            withCredentials: true,
            autoConnect: true,
        });

        socket.on('connect', () => {
            console.log('Socket connected');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ isConnected: false, activeUsers: {} });
        });

        // Presence handling
        socket.on('user_joined', ({ socketId, user }) => {
            set((state) => ({
                activeUsers: { ...state.activeUsers, [socketId]: user }
            }));
            // If we are a new joiner, we might need to ask "who is here?". 
            // For now, we only see FUTURE joiners. 
            // To see existing users, the server needs to send a list on join.
        });

        socket.on('user_left', ({ socketId }) => {
            set((state) => {
                const newUsers = { ...state.activeUsers };
                delete newUsers[socketId];
                return { activeUsers: newUsers };
            });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false, activeUsers: {} });
        }
    },

    joinPage: (pageId, user) => {
        const { socket } = get();
        if (socket) {
            // Clear previous users when switching pages
            set({ activeUsers: {} });
            socket.emit('join_room', { pageId, user });

            // Add self to active users? Maybe not, usually we only want to see OTHERS.
        }
    },

    leavePage: (pageId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('leave_room', { pageId });
            set({ activeUsers: {} });
        }
    },

    emitUpdateBlock: (pageId, blockId, content, type, props) => {
        const { socket } = get();
        if (socket) {
            socket.emit('update_block', { pageId, blockId, content, type, props });
        }
    }
}));

export default useSocketStore;
