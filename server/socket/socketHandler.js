
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a page room
        socket.on('join_room', ({ pageId, user }) => {
            if (!pageId) return;

            socket.join(`page:${pageId}`);
            console.log(`User ${user?.name || socket.id} joined page:${pageId}`);

            // Broadcast to others in the room that a user joined
            // We can send the full user object to track presence
            socket.to(`page:${pageId}`).emit('user_joined', {
                socketId: socket.id,
                user: user
            });

            // Note: We don't have a persistent "room state" in memory here for simplicity (no Redis yet).
            // A more robust app would store { socketId: user } mapping for each room 
            // to send the full list of "current users" to the newly joined user.
            // For now, preservation of "who is here" relies on clients announcing themselves 
            // or we can implement a basic in-memory map if needed. 
            // Let's implement a basic in-memory map for better DX.
        });

        socket.on('leave_room', ({ pageId }) => {
            if (!pageId) return;
            socket.leave(`page:${pageId}`);
            socket.to(`page:${pageId}`).emit('user_left', { socketId: socket.id });
        });

        // Block updates
        socket.on('update_block', ({ pageId, blockId, content, type, props }) => {
            // Broadcast to everyone ELSE in the room
            socket.to(`page:${pageId}`).emit('block_updated', {
                blockId,
                content,
                type,
                props,
                sourceSocketId: socket.id
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            // Ideally we'd know which rooms they were in and emit user_left, 
            // but socket.io handles leaving rooms automatically on disconnect.
            // We just need to tell clients "this socketId is gone".
            // Since we don't track rooms per socket easily without an adapter, 
            // we might rely on the client pinging or just general cleanup?
            // Actually, we can just let clients handle it if we don't send explicit "user_left" on disconnect 
            // unless we track it.
            // For this MVP, we won't track specific room exits on disconnect to keep it simple, 
            // or we add a simple tracker.
        });
    });
};

export default socketHandler;
