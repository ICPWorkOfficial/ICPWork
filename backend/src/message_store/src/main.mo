import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Nat "mo:base/Nat";

persistent actor MessageStore {
    
    // Message data structure matching the provided schema
    public type Message = {
        id: Text;
        text: Text;
        timestamp: Int;
        receiver_id: Text;
        sender_id: Text;
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
    private var messageEntries : [(Text, Message)] = [];
    private transient var messages = Map.HashMap<Text, Message>(0, Text.equal, Text.hash);

    // Stable storage for user conversations (mapping user email to list of conversation partners)
    private var conversationEntries : [(Text, [Text])] = [];
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
    private func generateMessageId() : Text {
        let timestamp = Int.toText(Time.now());
        let counter = Nat.toText(messages.size() + 1);
        "msg_" # timestamp # "_" # counter
    };

    // Helper function to get conversation key (consistent ordering)
    private func _getConversationKey(userA: Text, userB: Text) : Text {
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
        sender_id: Text,
        receiver_id: Text,
        text: Text,
        timestamp: Int
    ) : async Result.Result<Message, MessageError> {
        
        // Validate inputs
        if (not isValidEmail(sender_id)) {
            return #err(#InvalidEmail);
        };
        if (not isValidEmail(receiver_id)) {
            return #err(#InvalidEmail);
        };
        if (Text.size(text) == 0) {
            return #err(#InvalidMessage);
        };

        let messageId = generateMessageId();

        let message : Message = {
            id = messageId;
            text = text;
            timestamp = timestamp;
            receiver_id = receiver_id;
            sender_id = sender_id;
        };

        messages.put(messageId, message);
        updateUserConversations(sender_id, receiver_id);

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
            func(msg) = (msg.sender_id == userA and msg.receiver_id == userB) or (msg.sender_id == userB and msg.receiver_id == userA)
        );

        // Sort by timestamp (newest first)
        let sortedMessages = Array.sort<Message>(
            conversationMessages,
            func(a, b) = Int.compare(b.timestamp, a.timestamp)
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
                        func(msg) = (msg.sender_id == userId and msg.receiver_id == partner) or (msg.sender_id == partner and msg.receiver_id == userId)
                    );

                    let sortedMessages = Array.sort<Message>(
                        conversationMessages,
                        func(a, b) = Int.compare(b.timestamp, a.timestamp)
                    );

                    let lastMessage = if (sortedMessages.size() > 0) {
                        ?sortedMessages[0]
                    } else {
                        null
                    };

                    let lastActivity = switch (lastMessage) {
                        case null { 0 };
                        case (?msg) { msg.timestamp };
                    };

                    {
                        participantA = userId;
                        participantB = partner;
                        lastMessage = lastMessage;
                        unreadCount = 0; // We'll implement read status later if needed
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

    // Delete a message (only sender can delete)
    public func deleteMessage(messageId: Text, userId: Text) : async Result.Result<(), MessageError> {
        if (not isValidEmail(userId)) {
            return #err(#InvalidEmail);
        };

        switch (messages.get(messageId)) {
            case null { #err(#NotFound) };
            case (?message) {
                if (message.sender_id != userId) {
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
                if (message.sender_id != userId and message.receiver_id != userId) {
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