import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();
const app = express();
// Add CORS middleware before other routes
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});
const port = parseInt(process.env.PORT || "4000", 10);
const httpServer = createServer(app);
// Initialize Socket.IO server with CORS configuration
const io = new Server(httpServer, {
    pingInterval: 25000, // default is 25000ms
    pingTimeout: 100000,
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE"],
    },
});
// Add middleware for Socket.io authentication
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("Invalid username"));
    }
    // Attach the username to the socket for later use
    socket.data.username = username;
    next();
});
// Store connected users with their active connections
const activeConnections = new Map();
io.on("connection", (socket) => {
    console.log(`[Connection] Client connected: ${socket.id}`);
    // Get the username from socket data (set in middleware)
    const username = socket.data.username;
    // If username exists, handle the connection
    if (username) {
        console.log(`[Auth] User ${username} connected with SocketID: ${socket.id}`);
        // Check if user already exists in activeConnections
        if (activeConnections.has(username)) {
            const existingConnection = activeConnections.get(username);
            if (existingConnection) {
                // If this is a reconnection from the same user
                console.log(`[Reconnection] User ${username} reconnecting. Old SocketID: ${existingConnection.socket.id}, New SocketID: ${socket.id}`);
                // Clean up the old socket
                try {
                    existingConnection.socket.disconnect(true);
                }
                catch (err) {
                    console.log(`[DisconnectError] Error disconnecting old socket: ${err}`);
                }
            }
        }
        // Store the new connection
        activeConnections.set(username, {
            socket,
            username,
            connectionTime: Date.now(),
        });
        console.log(`[AuthSuccess] User: ${username} added with SocketID: ${socket.id}. Active connections: ${Array.from(activeConnections.keys())}`);
        socket.emit("authenticated", { username });
    }
    socket.on("message", (msg) => {
        if (!username) {
            socket.emit("error", "Not authenticated");
            return;
        }
        console.log(`[BroadcastMessage] From: ${username}, SocketID: ${socket.id}`);
        socket.broadcast.emit("message", msg);
    });
    socket.on("hello", (arg) => {
        console.log(`[Hello] SocketID: ${socket.id}, Arg: ${JSON.stringify(arg)}`);
        socket.emit("hello_response", "Server received your hello");
    });
    // Private message handler with validation
    socket.on("privateMessage", (msg) => {
        if (!username) {
            socket.emit("error", "Not authenticated");
            return;
        }
        console.log(`[PrivateMessage] From: ${msg.from} To: ${msg.to} SocketID: ${socket.id}`);
        // Verify the sender is who they claim to be
        if (msg.from !== username) {
            console.log(`[PrivateMessageError] Unauthorized attempt from SocketID: ${socket.id} as User: ${msg.from}`);
            socket.emit("error", "Unauthorized message attempt");
            return;
        }
        const recipient = activeConnections.get(msg.to);
        if (!recipient) {
            console.log(`[PrivateMessageError] Recipient ${msg.to} not available for message from ${msg.from}`);
            socket.emit("error", "Recipient not available");
            return;
        }
        // Verify both users are allowed to communicate
        if (shouldUsersCommunicate(msg.from, msg.to)) {
            // Add server timestamp to the message
            const timestampedMsg = {
                ...msg,
                serverTimestamp: new Date().toISOString(),
            };
            recipient.socket.emit("privateMessage", timestampedMsg);
            socket.emit("messageDelivered", {
                to: msg.to,
                messageId: msg.timestamp, // Using client timestamp as message ID
                timestamp: new Date().toISOString(),
            });
        }
        else {
            socket.emit("error", "Communication not allowed");
        }
    });
    socket.on("disconnect", (reason) => {
        console.log(`[Disconnect] SocketID: ${socket.id}, Reason: ${reason}`);
        let disconnectedUser = null;
        // Find user by socket.id to remove from activeConnections
        activeConnections.forEach((value, key) => {
            if (value.socket.id === socket.id) {
                disconnectedUser = key;
            }
        });
        if (disconnectedUser) {
            // Keep the connection for a short time to allow for page refreshes
            setTimeout(() => {
                // Check if the user hasn't reconnected in the meantime
                const currentConnection = activeConnections.get(disconnectedUser);
                if (currentConnection && currentConnection.socket.id === socket.id) {
                    activeConnections.delete(disconnectedUser);
                    console.log(`[UserRemoved] User: ${disconnectedUser} (SocketID: ${socket.id}) removed after timeout. Active connections: ${Array.from(activeConnections.keys())}`);
                }
            }, 50000); // 5 seconds grace period for reconnection
            console.log(`[UserDisconnectTimeout] User: ${disconnectedUser} (SocketID: ${socket.id}) will be removed in 50 seconds if no reconnection occurs.`);
        }
        else {
            console.log(`[DisconnectNoUser] SocketID: ${socket.id} disconnected, but was not found in activeConnections (might not have authenticated).`);
        }
    });
});
// Helper function to validate communication permissions
function shouldUsersCommunicate(user1, user2) {
    // Implement your business logic here
    // Example: Check if users are friends, in same group, etc.
    return true; // For now allowing all communications
}
httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
export default app;
