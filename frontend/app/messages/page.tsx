"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  receiver_id: string;
  sender_id: string;
}

interface User {
  email: string;
  name?: string;
}

interface ConversationSummary {
  participantA: string;
  participantB: string;
  lastMessage?: Message;
  unreadCount: number;
  lastActivity: bigint;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.email) return;

    const newSocket = io("http://localhost:4000", {
      auth: {
        username: user.email,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to chat server");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from chat server");
    });

    newSocket.on("authenticated", (data) => {
      console.log("Authenticated:", data);
    });

    newSocket.on("usersList", (data) => {
      setActiveUsers(data.users);
    });

    newSocket.on("privateMessage", (newMessage: Message) => {
      setMessages((prev) => {
        const existingMessage = prev.find((msg) => msg.id === newMessage.id);
        if (!existingMessage) {
          return [...prev, newMessage];
        }
        return prev;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversation = (otherUser: string) => {
    if (!socket) return;

    setSelectedUser(otherUser);

    socket.emit("getMessageHistory", { otherUser }, (response: any) => {
      if (response.messages) {
        setMessages(response.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    });
  };

  const loadConversations = () => {
    if (!socket) return;

    socket.emit("getConversations", (response: any) => {
      if (response.conversations) {
        setConversations(response.conversations);
      }
    });
  };

  const sendMessage = () => {
    if (!socket || !selectedUser || !message.trim()) return;

    socket.emit("privateMessage", {
      to: selectedUser,
      text: message,
      timestamp: new Date(),
    }, (response: any) => {
      if (response.success) {
        setMessage("");
      }
    });
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (timestamp.toDateString() === today.toDateString()) {
      return "Today";
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getOtherParticipant = (conversation: ConversationSummary) => {
    return conversation.participantA === user?.email
      ? conversation.participantB
      : conversation.participantA;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">
            Please log in to access messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={loadConversations}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Conversations
            </button>
            <button
              onClick={() => socket?.emit("getUsers", (response: any) => {
                setActiveUsers(response.users);
              })}
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Active Users
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Recent Conversations</h3>
              {conversations.map((conversation, index) => {
                const otherUser = getOtherParticipant(conversation);
                const isActive = activeUsers.includes(otherUser);

                return (
                  <div
                    key={index}
                    onClick={() => loadConversation(otherUser)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser === otherUser
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {otherUser.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {isActive && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{otherUser}</div>
                          {conversation.lastMessage && (
                            <div className="text-sm text-gray-600 truncate max-w-[200px]">
                              {conversation.lastMessage.text}
                            </div>
                          )}
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Users ({activeUsers.length})</h3>
            {activeUsers
              .filter(email => email !== user.email)
              .map((email) => (
                <div
                  key={email}
                  onClick={() => loadConversation(email)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUser === email
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{email}</div>
                      <div className="text-sm text-green-600">Online</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedUser.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedUser}</div>
                  <div className="text-sm text-green-600">
                    {activeUsers.includes(selectedUser) ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser = msg.sender_id === user.email;
                const showDateHeader = index === 0 ||
                  new Date(msg.timestamp).toDateString() !==
                  new Date(messages[index - 1].timestamp).toDateString();

                return (
                  <div key={msg.id}>
                    {showDateHeader && (
                      <div className="text-center text-sm text-gray-500 my-2">
                        {formatDate(msg.timestamp)}
                      </div>
                    )}
                    <div
                      className={`flex ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="text-sm">{msg.text}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isCurrentUser ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-600">
                Choose a user from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}