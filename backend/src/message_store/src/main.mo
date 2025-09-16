import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Debug "mo:base/Debug";

persistent actor MessageStore {
    
    // Message data structure
    public type Message = {
        id: Text;
        from: Text;
        to: Text;
        content: Text;
        timestamp: Int;
        serverTimestamp: Int;
        messageType: MessageType;
        isRead: Bool;
        isDelivered: Bool;
    };

    public type MessageType = {
        #text;
        #file;
        #image;
        #systemMessage;
    };

    public type MessageError = {
        #NotFound;
        #Unauthorized;
        #InvalidMessage;
        #InvalidEmail;
        #StorageError: Text;
    };

    public type ConversationSummary = {
        participantA: Text;
        participantB: Text;
        lastMessage: ?Message;
        unreadCount: Nat;
        lastActivity: Int;
    };

    // Stable storage for messages
    private stable var messageEntries : [(Text, Message)] = [];
    private transient var messages = Map.HashMap<Text, Message>(0, Text.equal, Text.hash);

    // Stable storage for user conversations (mapping user email to list of conversation partners)
    private stable var conversationEntries : [(Text, [Text])] = [];
    private transient var userConversations = Map.HashMap<Text, [Text]>(0, Text.equal, Text.hash);

    // System functions for upgrades
    system func preupgrade() {
        messageEntries := Iter.toArray(messages.entries());
        conversationEntries := Iter.toArray(userConversations.entries());
    };

    system func postupgrade() {
        messages := Map.fromIter<Text, Message>(messageEntries.vals(), messageEntries.size(), Text.equal, Text.hash);
        userConversations := Map.fromIter<Text, [Text]>(conversationEntries.vals(), conversationEntries.size(), Text.equal, Text.hash);
        messageEntries := [];
        conversationEntries := [];
    };

    // Helper function to validate email format
    private func isValidEmail(email: Text) : Bool {
        Text.contains(email, #char '@') and Text.size(email) > 3
    };

    // Helper function to generate message ID
    private func generateMessageId(from: Text, to: Text, timestamp: Int) : Text {
        from # "_" # to # "_" # Int.toText(timestamp)
    };

    // Helper function to get conversation key (consistent ordering)
    private func getConversationKey(userA: Text, userB: Text) : Text {
        if (Text.compare(userA, userB) == #less) {
            userA # "_" # userB
        } else {
            userB # "_" # userA
        }
    };

    // Helper function to update user conversations
    private func updateUserConversations(userA: Text, userB: Text) {
        // Update userA's conversations
        switch (userConversations.get(userA)) {
            case null {
                userConversations.put(userA, [userB]);
            };
            case (?conversations) {
                let hasConversation = Array.find<Text>(conversations, func(partner) = partner == userB);
                if (hasConversation == null) {
                    let newConversations = Array.append<Text>(conversations, [userB]);
                    userConversations.put(userA, newConversations);
                };
            };
        };

        // Update userB's conversations
        switch (userConversations.get(userB)) {
            case null {
                userConversations.put(userB, [userA]);
            };
            case (?conversations) {
                let hasConversation = Array.find<Text>(conversations, func(partner) = partner == userA);
                if (hasConversation == null) {
                    let newConversations = Array.append<Text>(conversations, [userA]);
                    userConversations.put(userB, newConversations);
                };
            };
        };
    };

    // Store a new message
    public func storeMessage(
        from: Text,
        to: Text,
        content: Text,
        clientTimestamp: Int,
        messageType: MessageType
    ) : async Result.Result<Message, MessageError> {
        
        // Validate inputs
        if (not isValidEmail(from)) {
            return #err(#InvalidEmail);
        };
        if (not isValidEmail(to)) {
            return #err(#InvalidEmail);
        };
        if (Text.size(content) == 0) {
            return #err(#InvalidMessage);
        };

        let serverTimestamp = Time.now();
        let messageId = generateMessageId(from, to, serverTimestamp);

        let message : Message = {
            id = messageId;
            from = from;
            to = to;
            content = content;
            timestamp = clientTimestamp;
            serverTimestamp = serverTimestamp;
            messageType = messageType;
            isRead = false;
            isDelivered = false;
        };

        messages.put(messageId, message);
        updateUserConversations(from, to);

        #ok(message)
    };

    // Get messages between two users
    public query func getConversationMessages(
        userA: Text,
        userB: Text,
        limit: ?Nat,
        offset: ?Nat
    ) : async Result.Result<[Message], MessageError> {
        
        if (not isValidEmail(userA) or not isValidEmail(userB)) {
            return #err(#InvalidEmail);
        };

        let conversationMessages = Array.filter<Message>(
            Iter.toArray(messages.vals()),
            func(msg) = (msg.from == userA and msg.to == userB) or (msg.from == userB and msg.to == userA)
        );

        // Sort by server timestamp (newest first)
        let sortedMessages = Array.sort<Message>(
            conversationMessages,
            func(a, b) = Int.compare(b.serverTimestamp, a.serverTimestamp)
        );

        // Apply pagination
        let startIndex = switch (offset) {
            case null { 0 };
            case (?off) { off };
        };

        let endIndex = switch (limit) {
            case null { sortedMessages.size() };
            case (?lim) { 
                let calculatedEnd = startIndex + lim;
                if (calculatedEnd > sortedMessages.size()) {
                    sortedMessages.size()
                } else {
                    calculatedEnd
                }
            };
        };

        if (startIndex >= sortedMessages.size()) {
            return #ok([]);
        };

        let paginatedMessages = Array.subArray<Message>(sortedMessages, startIndex, endIndex - startIndex);
        #ok(paginatedMessages)
    };

    // Mark message as read
    public func markMessageAsRead(messageId: Text, userId: Text) : async Result.Result<(), MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        switch (messages.get(messageId)) {
            case null { #err(#NotFound) };
            case (?message) {
                if (message.to != userId) {
                    return #err(#Unauthorized);
                };

                let updatedMessage = {
                    message with isRead = true
                };
                messages.put(messageId, updatedMessage);
                #ok(())
            };
        }
    };

    // Mark message as delivered
    public func markMessageAsDelivered(messageId: Text) : async Result.Result<(), MessageError> {
        switch (messages.get(messageId)) {
            case null { #err(#NotFound) };
            case (?message) {
                let updatedMessage = {
                    message with isDelivered = true
                };
                messages.put(messageId, updatedMessage);
                #ok(())
            };
        }
    };

    // Get user's conversations with summary
    public query func getUserConversations(userId: Text) : async Result.Result<[ConversationSummary], MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        switch (userConversations.get(userId)) {
            case null { #ok([]) };
            case (?partners) {
                let summaries = Array.map<Text, ConversationSummary>(partners, func(partner) {
                    let conversationMessages = Array.filter<Message>(
                        Iter.toArray(messages.vals()),
                        func(msg) = (msg.from == userId and msg.to == partner) or (msg.from == partner and msg.to == userId)
                    );

                    let sortedMessages = Array.sort<Message>(
                        conversationMessages,
                        func(a, b) = Int.compare(b.serverTimestamp, a.serverTimestamp)
                    );

                    let lastMessage = if (sortedMessages.size() > 0) {
                        ?sortedMessages[0]
                    } else {
                        null
                    };

                    let unreadMessages = Array.filter<Message>(
                        conversationMessages,
                        func(msg) = msg.to == userId and not msg.isRead
                    );

                    let lastActivity = switch (lastMessage) {
                        case null { 0 };
                        case (?msg) { msg.serverTimestamp };
                    };

                    {
                        participantA = userId;
                        participantB = partner;
                        lastMessage = lastMessage;
                        unreadCount = unreadMessages.size();
                        lastActivity = lastActivity;
                    }
                });

                // Sort by last activity (most recent first)
                let sortedSummaries = Array.sort<ConversationSummary>(
                    summaries,
                    func(a, b) = Int.compare(b.lastActivity, a.lastActivity)
                );

                #ok(sortedSummaries)
            };
        }
    };

    // Get unread message count for a user
    public query func getUnreadMessageCount(userId: Text) : async Result.Result<Nat, MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        let unreadMessages = Array.filter<Message>(
            Iter.toArray(messages.vals()),
            func(msg) = msg.to == userId and not msg.isRead
        );

        #ok(unreadMessages.size())
    };

    // Delete a message (only sender can delete)
    public func deleteMessage(messageId: Text, userId: Text) : async Result.Result<(), MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        switch (messages.get(messageId)) {
            case null { #err(#NotFound) };
            case (?message) {
                if (message.from != userId) {
                    return #err(#Unauthorized);
                };
                messages.delete(messageId);
                #ok(())
            };
        }
    };

    // Get message by ID
    public query func getMessage(messageId: Text, userId: Text) : async Result.Result<Message, MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        switch (messages.get(messageId)) {
            case null { #err(#NotFound) };
            case (?message) {
                if (message.from != userId and message.to != userId) {
                    return #err(#Unauthorized);
                };
                #ok(message)
            };
        }
    };

    // Get total message count (for admin purposes)
    public query func getTotalMessageCount() : async Nat {
        messages.size()
    };

    // Health check
    public query func healthCheck() : async Bool {
        true
    };
}