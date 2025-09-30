import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

actor ChatSystem {
    // Types
    public type MessageId = Nat;
    public type UserId = Text;
    public type Timestamp = Int;
    
    public type ChatMessage = {
        id: MessageId;
        text: Text;
        timestamp: Timestamp;
        to: UserId;
        from: UserId;
        messageType: MessageType;
        delivered: Bool;
        read: Bool;
    };
    
    public type MessageType = {
        #Private;
        #Group;
        #System;
    };
    
    public type User = {
        id: UserId;
        username: Text;
        principal: ?Principal;
        lastSeen: Timestamp;
        isOnline: Bool;
        createdAt: Timestamp;
        profile: ?UserProfile;
    };
    
    public type UserProfile = {
        displayName: ?Text;
        avatar: ?Text;
        status: ?Text;
        bio: ?Text;
    };
    
    public type Connection = {
        userId: UserId;
        lastSeen: Timestamp;
        isActive: Bool;
    };
    
    public type ChatRoom = {
        id: Text;
        name: Text;
        participants: [UserId];
        createdAt: Timestamp;
        isPrivate: Bool;
        lastMessage: ?MessageId;
    };
    
    public type MessageResult = Result.Result<ChatMessage, Text>;
    public type UserResult = Result.Result<User, Text>;
    public type ConnectionResult = Result.Result<Connection, Text>;
    
    // Stable variables for persistence
    private stable var messagesEntries: [(MessageId, ChatMessage)] = [];
    private stable var usersEntries: [(UserId, User)] = [];
    private stable var connectionsEntries: [(UserId, Connection)] = [];
    private stable var chatRoomsEntries: [(Text, ChatRoom)] = [];
    private stable var userMessagesEntries: [(UserId, [MessageId])] = [];
    private stable var nextMessageId: MessageId = 1;
    
    // Transient variables
    private var messages = HashMap.HashMap<MessageId, ChatMessage>(0, Nat.equal, Nat.hash);
    private var users = HashMap.HashMap<UserId, User>(0, Text.equal, Text.hash);
    private var connections = HashMap.HashMap<UserId, Connection>(0, Text.equal, Text.hash);
    private var chatRooms = HashMap.HashMap<Text, ChatRoom>(0, Text.equal, Text.hash);
    private var userMessages = HashMap.HashMap<UserId, [MessageId]>(0, Text.equal, Text.hash);
    
    // System functions
    system func preupgrade() : () {
        messagesEntries := Iter.toArray(messages.entries());
        usersEntries := Iter.toArray(users.entries());
        connectionsEntries := Iter.toArray(connections.entries());
        chatRoomsEntries := Iter.toArray(chatRooms.entries());
        userMessagesEntries := Iter.toArray(userMessages.entries());
    };
    
    system func postupgrade() : () {
        messages := HashMap.fromIter<MessageId, ChatMessage>(messagesEntries.vals(), messagesEntries.size(), Nat.equal, Nat.hash);
        users := HashMap.fromIter<UserId, User>(usersEntries.vals(), usersEntries.size(), Text.equal, Text.hash);
        connections := HashMap.fromIter<UserId, Connection>(connectionsEntries.vals(), connectionsEntries.size(), Text.equal, Text.hash);
        chatRooms := HashMap.fromIter<Text, ChatRoom>(chatRoomsEntries.vals(), chatRoomsEntries.size(), Text.equal, Text.hash);
        userMessages := HashMap.fromIter<UserId, [MessageId]>(userMessagesEntries.vals(), userMessagesEntries.size(), Text.equal, Text.hash);
        messagesEntries := [];
        usersEntries := [];
        connectionsEntries := [];
        chatRoomsEntries := [];
        userMessagesEntries := [];
    };
    
    // User Management
    public shared func createUser(userId: UserId, username: Text, principal: ?Principal): async UserResult {
        if (users.get(userId) != null) {
            return #err("User already exists");
        };
        
        let user: User = {
            id = userId;
            username = username;
            principal = principal;
            lastSeen = Time.now();
            isOnline = false;
            createdAt = Time.now();
            profile = null;
        };
        
        users.put(userId, user);
        userMessages.put(userId, []);
        
        Debug.print("User created: " # userId);
        #ok(user)
    };
    
    public shared query func getUser(userId: UserId): async UserResult {
        switch (users.get(userId)) {
            case (?user) #ok(user);
            case null #err("User not found");
        }
    };
    
    public func updateUserProfile(userId: UserId, profile: UserProfile): UserResult {
        switch (users.get(userId)) {
            case (?user) {
                let updatedUser = {
                    user with profile = ?profile;
                };
                users.put(userId, updatedUser);
                #ok(updatedUser)
            };
            case null #err("User not found");
        }
    };
    
    public func getAllUsers(): [User] {
        Iter.toArray(users.vals())
    };
    
    public func getOnlineUsers(): [User] {
        Array.filter<User>(Iter.toArray(users.vals()), func(user) = user.isOnline)
    };
    
    // Connection Management
    public func connectUser(userId: UserId): ConnectionResult {
        switch (users.get(userId)) {
            case (?user) {
                let connection: Connection = {
                    userId = userId;
                    lastSeen = Time.now();
                    isActive = true;
                };
                
                connections.put(userId, connection);
                
                // Update user online status
                let updatedUser = {
                    user with 
                    isOnline = true;
                    lastSeen = Time.now();
                };
                users.put(userId, updatedUser);
                
                Debug.print("User connected: " # userId);
                #ok(connection)
            };
            case null #err("User not found");
        }
    };
    
    public func disconnectUser(userId: UserId): ConnectionResult {
        switch (connections.get(userId)) {
            case (?connection) {
                let updatedConnection = {
                    connection with 
                    isActive = false;
                    lastSeen = Time.now();
                };
                connections.put(userId, updatedConnection);
                
                // Update user online status
                switch (users.get(userId)) {
                    case (?user) {
                        let updatedUser = {
                            user with 
                            isOnline = false;
                            lastSeen = Time.now();
                        };
                        users.put(userId, updatedUser);
                    };
                    case null {};
                };
                
                Debug.print("User disconnected: " # userId);
                #ok(updatedConnection)
            };
            case null #err("Connection not found");
        }
    };
    
    public func updateLastSeen(userId: UserId): ConnectionResult {
        switch (connections.get(userId)) {
            case (?connection) {
                let updatedConnection = {
                    connection with 
                    lastSeen = Time.now();
                };
                connections.put(userId, updatedConnection);
                
                // Update user last seen
                switch (users.get(userId)) {
                    case (?user) {
                        let updatedUser = {
                            user with 
                            lastSeen = Time.now();
                        };
                        users.put(userId, updatedUser);
                    };
                    case null {};
                };
                
                #ok(updatedConnection)
            };
            case null #err("Connection not found");
        }
    };
    
    public func isUserOnline(userId: UserId): Bool {
        switch (connections.get(userId)) {
            case (?connection) connection.isActive;
            case null false;
        }
    };
    
    public func getActiveConnections(): [Connection] {
        Array.filter<Connection>(Iter.toArray(connections.vals()), func(conn) = conn.isActive)
    };
    
    // Message Management
    public func sendPrivateMessage(from: UserId, to: UserId, text: Text): MessageResult {
        // Validate users exist
        switch (users.get(from), users.get(to)) {
            case (?fromUser, ?toUser) {
                // Check if recipient is online
                if (not isUserOnline(to)) {
                    return #err("Recipient is not online");
                };
                
                let message: ChatMessage = {
                    id = nextMessageId;
                    text = text;
                    timestamp = Time.now();
                    to = to;
                    from = from;
                    messageType = #Private;
                    delivered = false;
                    read = false;
                };
                
                messages.put(nextMessageId, message);
                
                // Add message to user's message list
                switch (userMessages.get(from)) {
                    case (?messageList) {
                        userMessages.put(from, Array.append(messageList, [nextMessageId]));
                    };
                    case null {
                        userMessages.put(from, [nextMessageId]);
                    };
                };
                
                switch (userMessages.get(to)) {
                    case (?messageList) {
                        userMessages.put(to, Array.append(messageList, [nextMessageId]));
                    };
                    case null {
                        userMessages.put(to, [nextMessageId]);
                    };
                };
                
                nextMessageId += 1;
                
                Debug.print("Message sent from " # from # " to " # to);
                #ok(message)
            };
            case (null, _) #err("Sender not found");
            case (_, null) #err("Recipient not found");
        }
    };
    
    public func markMessageDelivered(messageId: MessageId): MessageResult {
        switch (messages.get(messageId)) {
            case (?message) {
                let updatedMessage = {
                    message with delivered = true;
                };
                messages.put(messageId, updatedMessage);
                #ok(updatedMessage)
            };
            case null #err("Message not found");
        }
    };
    
    public func markMessageRead(messageId: MessageId): MessageResult {
        switch (messages.get(messageId)) {
            case (?message) {
                let updatedMessage = {
                    message with read = true;
                };
                messages.put(messageId, updatedMessage);
                #ok(updatedMessage)
            };
            case null #err("Message not found");
        }
    };
    
    public func getMessage(messageId: MessageId): MessageResult {
        switch (messages.get(messageId)) {
            case (?message) #ok(message);
            case null #err("Message not found");
        }
    };
    
    public func getUserMessages(userId: UserId, limit: ?Nat): [ChatMessage] {
        switch (userMessages.get(userId)) {
            case (?messageIds) {
                let userMessagesList = Array.map<MessageId, ?ChatMessage>(
                    messageIds, 
                    func(id) = messages.get(id)
                );
                let validMessages = Array.filter<?ChatMessage>(
                    userMessagesList, 
                    func(msg) = Option.isSome(msg)
                );
                let messages = Array.map<?ChatMessage, ChatMessage>(
                    validMessages,
                    func(msg) = Option.unwrap(msg)
                );
                
                // Sort by timestamp (newest first)
                let sortedMessages = Array.sort<ChatMessage>(
                    messages,
                    func(a, b) = Int.compare(b.timestamp, a.timestamp)
                );
                
                // Apply limit if specified
                switch (limit) {
                    case (?l) {
                        if (l < sortedMessages.size()) {
                            Array.take<ChatMessage>(sortedMessages, l)
                        } else {
                            sortedMessages
                        }
                    };
                    case null sortedMessages;
                }
            };
            case null [];
        }
    };
    
    public func getConversation(userId1: UserId, userId2: UserId, limit: ?Nat): [ChatMessage] {
        let allMessages = getUserMessages(userId1, null);
        let conversationMessages = Array.filter<ChatMessage>(
            allMessages,
            func(msg) = (msg.from == userId1 and msg.to == userId2) or (msg.from == userId2 and msg.to == userId1)
        );
        
        // Sort by timestamp (oldest first for conversation)
        let sortedMessages = Array.sort<ChatMessage>(
            conversationMessages,
            func(a, b) = Int.compare(a.timestamp, b.timestamp)
        );
        
        // Apply limit if specified
        switch (limit) {
            case (?l) {
                if (l < sortedMessages.size()) {
                    Array.take<ChatMessage>(sortedMessages, l)
                } else {
                    sortedMessages
                }
            };
            case null sortedMessages;
        }
    };
    
    // Chat Room Management
    public func createChatRoom(roomId: Text, name: Text, participants: [UserId], isPrivate: Bool): Result.Result<ChatRoom, Text> {
        if (chatRooms.get(roomId) != null) {
            return #err("Chat room already exists");
        };
        
        let chatRoom: ChatRoom = {
            id = roomId;
            name = name;
            participants = participants;
            createdAt = Time.now();
            isPrivate = isPrivate;
            lastMessage = null;
        };
        
        chatRooms.put(roomId, chatRoom);
        
        Debug.print("Chat room created: " # roomId);
        #ok(chatRoom)
    };
    
    public func getChatRoom(roomId: Text): Result.Result<ChatRoom, Text> {
        switch (chatRooms.get(roomId)) {
            case (?room) #ok(room);
            case null #err("Chat room not found");
        }
    };
    
    public func addParticipantToRoom(roomId: Text, userId: UserId): Result.Result<ChatRoom, Text> {
        switch (chatRooms.get(roomId)) {
            case (?room) {
                if (Array.find<UserId>(room.participants, func(id) = id == userId) != null) {
                    return #err("User already in room");
                };
                
                let updatedRoom = {
                    room with 
                    participants = Array.append(room.participants, [userId]);
                };
                chatRooms.put(roomId, updatedRoom);
                #ok(updatedRoom)
            };
            case null #err("Chat room not found");
        }
    };
    
    public func removeParticipantFromRoom(roomId: Text, userId: UserId): Result.Result<ChatRoom, Text> {
        switch (chatRooms.get(roomId)) {
            case (?room) {
                let updatedParticipants = Array.filter<UserId>(
                    room.participants,
                    func(id) = id != userId
                );
                
                let updatedRoom = {
                    room with 
                    participants = updatedParticipants;
                };
                chatRooms.put(roomId, updatedRoom);
                #ok(updatedRoom)
            };
            case null #err("Chat room not found");
        }
    };
    
    public func getAllChatRooms(): [ChatRoom] {
        Iter.toArray(chatRooms.vals())
    };
    
    public func getUserChatRooms(userId: UserId): [ChatRoom] {
        Array.filter<ChatRoom>(
            Iter.toArray(chatRooms.vals()),
            func(room) = Array.find<UserId>(room.participants, func(id) = id == userId) != null
        )
    };
    
    // System Information
    public func getSystemStats(): {
        totalUsers: Nat;
        onlineUsers: Nat;
        totalMessages: Nat;
        totalChatRooms: Nat;
        activeConnections: Nat;
    } {
        {
            totalUsers = users.size();
            onlineUsers = Array.size(Array.filter<User>(Iter.toArray(users.vals()), func(user) = user.isOnline));
            totalMessages = messages.size();
            totalChatRooms = chatRooms.size();
            activeConnections = Array.size(Array.filter<Connection>(Iter.toArray(connections.vals()), func(conn) = conn.isActive));
        }
    };
    
    public func getSystemInfo(): {
        version: Text;
        uptime: Int;
        lastMessageId: MessageId;
    } {
        {
            version = "1.0.0";
            uptime = Time.now();
            lastMessageId = nextMessageId - 1;
        }
    };
    
    // Cleanup functions
    public func cleanupInactiveConnections(timeoutSeconds: Int): Nat {
        let now = Time.now();
        let timeout = timeoutSeconds * 1_000_000_000; // Convert to nanoseconds
        var removedCount = 0;
        
        for ((userId, connection) in connections.entries()) {
            if (connection.isActive and (now - connection.lastSeen) > timeout) {
                let updatedConnection = {
                    connection with 
                    isActive = false;
                    lastSeen = now;
                };
                connections.put(userId, updatedConnection);
                
                // Update user online status
                switch (users.get(userId)) {
                    case (?user) {
                        let updatedUser = {
                            user with 
                            isOnline = false;
                            lastSeen = now;
                        };
                        users.put(userId, updatedUser);
                    };
                    case null {};
                };
                
                removedCount += 1;
                Debug.print("Cleaned up inactive connection: " # userId);
            };
        };
        
        removedCount
    };
    
    // Health check
    public func healthCheck(): {
        status: Text;
        activeConnections: Nat;
        onlineUsers: [UserId];
        systemStats: {
            totalUsers: Nat;
            onlineUsers: Nat;
            totalMessages: Nat;
            totalChatRooms: Nat;
            activeConnections: Nat;
        };
    } {
        let stats = getSystemStats();
        let onlineUserIds = Array.map<User, UserId>(
            Array.filter<User>(Iter.toArray(users.vals()), func(user) = user.isOnline),
            func(user) = user.id
        );
        
        {
            status = "healthy";
            activeConnections = stats.activeConnections;
            onlineUsers = onlineUserIds;
            systemStats = stats;
        }
    };
}


