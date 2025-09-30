import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
import { messageStoreCanister } from "./frontend/lib/canister-connections";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  receiver_id: string;
  sender_id: string;
}

interface UserConnection {
  socket: Socket;
  username: string;
  lastSeen: number;
}

// Utility function to generate message ID
function generateMessageId(): string {
  return uuidv4();
}

const app = express();
const port = parseInt(process.env.PORT || "4000", 10);
const httpServer = createServer(app);

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://gitfund-osnf.vercel.app",
    "https://neoweave.tech",
    "https://lwgcsskw8ogk44wocgow0kcc.server.gitfund.tech",
  ];
  const origin = req.header("Origin");
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Socket.IO server with optimized settings
const io = new Server(httpServer, {
  pingInterval: 25000,
  pingTimeout: 60000,
  transports: ['websocket', 'polling'],
  cors: {
    origin: ["http://localhost:3000","https://lwgcsskw8ogk44wocgow0kcc.server.gitfund.tech", "https://gitfund-osnf.vercel.app", "https://neoweave.tech"],

    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active connections
const activeConnections = new Map<string, UserConnection>();

// Utility functions
function getActiveUsers(): string[] {
  return Array.from(activeConnections.keys());
}

function broadcastUsersList(): void {
  const users = getActiveUsers();
  console.log(
    `[UsersList] Broadcasting to ${activeConnections.size} clients:`,
    users,
  );
  io.emit("usersList", { users });
}

function isUserOnline(username: string): boolean {
  return activeConnections.has(username);
}

function getUserSocket(username: string): Socket | null {
  return activeConnections.get(username)?.socket || null;
}

// Authentication middleware
io.use((socket, next) => {
  const username = socket.handshake.auth?.username;

  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length === 0
  ) {
    return next(new Error("Invalid username"));
  }

  socket.data.username = username.trim();
  console.log(`[Auth] User ${username} attempting connection`);
  next();
});

// Connection handler
io.on("connection", (socket: Socket) => {
  const username = socket.data.username;
  console.log(`[Connect] ${username} connected (${socket.id})`);

  // Handle existing connection
  const existingConnection = activeConnections.get(username);
  if (existingConnection) {
    console.log(`[Reconnect] ${username} reconnecting, closing old connection`);
    existingConnection.socket.disconnect(true);
  }

  // Store new connection
  activeConnections.set(username, {
    socket,
    username,
    lastSeen: Date.now(),
  });

  // Send auth confirmation and user list
  socket.emit("authenticated", { username });
  socket.emit("usersList", { users: getActiveUsers() });

  // Broadcast updated user list
  broadcastUsersList();

  // Handle private messages
  socket.on("privateMessage", async (data, callback) => {
    console.log(`[PrivateMessage] From: ${username} to: ${data.to}`);

    try {
      // Validate message data
      if (!data.to || !data.text || typeof data.text !== "string") {
        const error = "Invalid message format";
        console.log(`[MessageError] ${error}`);
        return callback?.({ error });
      }

      // Check if recipient exists and is online
      const recipientSocket = getUserSocket(data.to);
      if (!recipientSocket) {
        const error = "Recipient not online";
        console.log(`[MessageError] ${error}: ${data.to}`);
        return callback?.({ error });
      }

      // Create message object
      const message: ChatMessage = {
        id: generateMessageId(),
        text: data.text.trim(),
        timestamp: data.timestamp || new Date(),
        receiver_id: data.to,
        sender_id: username,
      };

      // Store message in the MessageStore canister
      const timestamp = BigInt(message.timestamp.getTime());
      const storeResult = await messageStoreCanister.storeMessage(
        message.from,
        message.to,
        message.text,
        timestamp
      );

      if ('err' in storeResult) {
        console.error(`[MessageError] Failed to store message: ${storeResult.err}`);
        return callback?.({ error: "Failed to store message" });
      }

      // Send message to recipient
      const messageToSend = {
        id: message.id,
        text: message.text,
        timestamp: message.timestamp,
        receiver_id: message.receiver_id,
        sender_id: message.sender_id,
      };
      recipientSocket.emit("privateMessage", messageToSend);

      // Send confirmation to sender
      callback?.({ success: true, timestamp: message.timestamp });

      console.log(`[MessageSent] ${username} -> ${data.to}`);
    } catch (error) {
      console.error(`[MessageError] ${error}`);
      callback?.({ error: "Failed to send message" });
    }
  });

  // Handle user list requests
  socket.on("getUsers", (callback) => {
    const users = getActiveUsers();
    console.log(`[GetUsers] Sending ${users.length} users to ${username}`);
    callback?.({ users });
  });

  // Handle message history requests
  socket.on("getMessageHistory", async (data, callback) => {
    console.log(`[MessageHistory] Between: ${username} and ${data.otherUser}`);

    try {
      // Validate request data
      if (!data.otherUser || typeof data.otherUser !== "string") {
        const error = "Invalid request format";
        console.log(`[MessageHistoryError] ${error}`);
        return callback?.({ error });
      }

      // Get conversation messages from the MessageStore canister
      const limit = data.limit ? Number(data.limit) : undefined;
      const offset = data.offset ? Number(data.offset) : undefined;
      
      const result = await messageStoreCanister.getConversationMessages(
        username,
        data.otherUser,
        limit,
        offset
      );

      if ('err' in result) {
        console.error(`[MessageHistoryError] Failed to get messages: ${result.err}`);
        return callback?.({ error: "Failed to retrieve message history" });
      }

      // Convert canister messages to ChatMessage format
      const messages: ChatMessage[] = result.ok.map(msg => ({
        id: msg.id,
        text: msg.text,
        timestamp: new Date(Number(msg.timestamp)),
        receiver_id: msg.receiver_id,
        sender_id: msg.sender_id,
      }));

      console.log(`[MessageHistory] Retrieved ${messages.length} messages between ${username} and ${data.otherUser}`);
      callback?.({ messages });
    } catch (error) {
      console.error(`[MessageHistoryError] ${error}`);
      callback?.({ error: "Failed to retrieve message history" });
    }
  });

  // Handle user conversations requests
  socket.on("getConversations", async (callback) => {
    console.log(`[GetConversations] For user: ${username}`);

    try {
      // Get user conversations from the MessageStore canister
      const result = await messageStoreCanister.getUserConversations(username);

      if ('err' in result) {
        console.error(`[GetConversationsError] Failed to get conversations: ${result.err}`);
        return callback?.({ error: "Failed to retrieve conversations" });
      }

      console.log(`[GetConversations] Retrieved ${result.ok.length} conversations for ${username}`);
      callback?.({ conversations: result.ok });
    } catch (error) {
      console.error(`[GetConversationsError] ${error}`);
      callback?.({ error: "Failed to retrieve conversations" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`[Disconnect] ${username} disconnected: ${reason}`);

    // Remove user after a short delay to handle page refreshes
    setTimeout(() => {
      const currentConnection = activeConnections.get(username);

      // Only remove if this is still the active connection
      if (currentConnection?.socket.id === socket.id) {
        activeConnections.delete(username);
        console.log(`[UserRemoved] ${username} removed from active users`);
        broadcastUsersList();
      }
    }, 5000); // 5 second grace period
  });

  // Update last seen periodically
  const heartbeat = setInterval(() => {
    const connection = activeConnections.get(username);
    if (connection && connection.socket.id === socket.id) {
      connection.lastSeen = Date.now();
    } else {
      clearInterval(heartbeat);
    }
  }, 30000); // Update every 30 seconds

  socket.on("disconnect", () => {
    clearInterval(heartbeat);
  });
});

// Cleanup inactive connections every 2 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 2 * 60 * 1000; // 2 minutes
  let removedUsers = 0;

  for (const [username, connection] of activeConnections.entries()) {
    if (now - connection.lastSeen > timeout) {
      console.log(`[Cleanup] Removing inactive user: ${username}`);
      activeConnections.delete(username);
      removedUsers++;
    }
  }

  if (removedUsers > 0) {
    console.log(`[Cleanup] Removed ${removedUsers} inactive users`);
    broadcastUsersList();
  }
}, 120000);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    activeConnections: activeConnections.size,
    users: getActiveUsers(),
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Socket.IO server running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
});

export default app;
