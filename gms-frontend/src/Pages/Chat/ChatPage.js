import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations, createConversation } from '../../features/conservations/conversationSlice';
import { fetchMessages, sendMessage } from '../../features/messages/messageSlice';
import { getUsers } from '../../features/users/userSlice';
import io from 'socket.io-client';
import Modal from '../../Components/Modal/modal';
import { toast } from 'react-toastify';

const ENDPOINT = 'http://localhost:5000';
let socket;

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newChatModal, setNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { conversations, isLoading: conversationsLoading } = useSelector((state) => state.conversations);
  const { messages, isLoading: messagesLoading } = useSelector((state) => state.messages);

  useEffect(() => {
    // Initialize socket and connect
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));

    // Handle typing events
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));
    
    // Handle online users
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    
    // Handle new messages
    socket.on('message received', (newMessageReceived) => {
      if (selectedChat && selectedChat._id === newMessageReceived.conversation) {
        dispatch(fetchMessages(selectedChat._id));
      } else {
        // Can show notification toast here
        toast.info(`New message from ${newMessageReceived.sender.fullName}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, dispatch, selectedChat]);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessages(selectedChat._id));
      socket.emit('join chat', selectedChat._id);
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    // Scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing indicator logic
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const sendMessageHandler = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() && selectedChat) {
      socket.emit('stop typing', selectedChat._id);
      
      dispatch(sendMessage({
        content: newMessage,
        conversationId: selectedChat._id
      })).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          setNewMessage('');
          
          // Emit socket event for real-time
          socket.emit('new message', {
            ...res.payload,
            conversation: selectedChat
          });
        }
      });
    }
  };
  
  const handleCreateNewChat = () => {
    if (selectedUser) {
      dispatch(createConversation({
        userId: selectedUser._id
      })).then((res) => {
        if (res.meta.requestStatus === 'fulfilled') {
          setSelectedChat(res.payload);
          setNewChatModal(false);
          setSelectedUser(null);
        } else {
          toast.error('Failed to create conversation');
        }
      });
    }
  };
  
  // Filter users based on role - trainers can only chat with their customers and vice versa
  const getAvailableUsers = () => {
    if (!users) return [];
    
    if (user.role === 'trainer') {
      return users.filter(u => 
        u._id !== user._id && 
        u.role === 'customer' && 
        u.trainer && u.trainer.toString() === user._id.toString() &&
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (user.role === 'customer') {
      return users.filter(u => 
        u._id !== user._id && 
        ((u.role === 'trainer' && user.trainer && user.trainer.toString() === u._id.toString()) || 
         u.role === 'receptionist' || 
         u.role === 'admin') &&
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // Admin and receptionist can chat with anyone
      return users.filter(u => 
        u._id !== user._id && 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };
  
  const filteredUsers = getAvailableUsers();

  const ChatUserModal = () => (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Start a new conversation</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="max-h-60 overflow-y-auto mb-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <div
              key={u._id}
              className={`p-2 border-b flex items-center cursor-pointer hover:bg-gray-100 ${
                selectedUser && selectedUser._id === u._id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedUser(u)}
            >
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 relative">
                {u.avatar ? (
                  <img 
                    src={`http://localhost:5000/uploads/${u.avatar}`} 
                    alt={u.fullName} 
                    className="h-full w-full rounded-full object-cover" 
                  />
                ) : (
                  u.fullName.charAt(0)
                )}
                {onlineUsers.includes(u._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <p className="font-medium">{u.fullName}</p>
                <p className="text-sm text-gray-500">{
                  u.role === 'admin' ? 'Admin' : 
                  u.role === 'receptionist' ? 'Receptionist' : 
                  u.role === 'trainer' ? 'Trainer' : 'Customer'
                }</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No users found</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2"
          onClick={() => {
            setNewChatModal(false);
            setSelectedUser(null);
          }}
        >
          Cancel
        </button>
        <button
          className={`px-4 py-2 bg-blue-500 text-white rounded-md ${!selectedUser ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleCreateNewChat}
          disabled={!selectedUser}
        >
          Create conversation
        </button>
      </div>
    </div>
  );

  return (
    <div className="ml-[25%] p-5 w-[75%] h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={() => setNewChatModal(true)}
        >
          New conversation
        </button>
      </div>
      
      <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Conversation list */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-100">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          
          {conversationsLoading ? (
            <div className="flex justify-center items-center h-20">
              <p>Loading...</p>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((chat) => {
              // Find the other participant
              const otherParticipant = chat.participants.find(p => p._id !== user._id);
              
              return (
                <div 
                  key={chat._id}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                    selectedChat && selectedChat._id === chat._id ? 'bg-indigo-50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 relative">
                      {otherParticipant && otherParticipant.avatar ? (
                        <img 
                          src={`http://localhost:5000/uploads/${otherParticipant.avatar}`} 
                          alt={otherParticipant.fullName} 
                          className="h-full w-full rounded-full object-cover" 
                        />
                      ) : (
                        <span>{otherParticipant ? otherParticipant.fullName.charAt(0) : '?'}</span>
                      )}
                      {otherParticipant && onlineUsers.includes(otherParticipant._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {chat.isGroupChat 
                          ? chat.groupName 
                          : otherParticipant?.fullName || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.latestMessage ? chat.latestMessage.content : 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="w-2/3 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex items-center">
                {selectedChat.participants.find(p => p._id !== user._id) && (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 relative">
                    {selectedChat.participants.find(p => p._id !== user._id).avatar ? (
                      <img 
                        src={`http://localhost:5000/uploads/${selectedChat.participants.find(p => p._id !== user._id).avatar}`} 
                        alt={selectedChat.participants.find(p => p._id !== user._id).fullName} 
                        className="h-full w-full rounded-full object-cover" 
                      />
                    ) : (
                      <span>{selectedChat.participants.find(p => p._id !== user._id).fullName.charAt(0)}</span>
                    )}
                    {onlineUsers.includes(selectedChat.participants.find(p => p._id !== user._id)._id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                )}
                
                <div>
                  <h2 className="font-semibold">
                    {selectedChat.isGroupChat 
                      ? selectedChat.groupName 
                      : selectedChat.participants.find(p => p._id !== user._id)?.fullName || 'Unknown User'}
                  </h2>
                  {onlineUsers.includes(selectedChat.participants.find(p => p._id !== user._id)?._id) && (
                    <p className="text-xs text-green-500">Online</p>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <p>Loading messages...</p>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <>
                    {messages.map((msg) => (
                      <div 
                        key={msg._id}
                        className={`mb-4 max-w-[70%] ${
                          msg.sender._id === user._id 
                            ? 'ml-auto bg-blue-500 text-white rounded-lg p-3' 
                            : 'bg-gray-200 rounded-lg p-3'
                        }`}
                      >
                        {msg.sender._id !== user._id && (
                          <p className="text-xs font-semibold mb-1">{msg.sender.fullName}</p>
                        )}
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 text-right opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="text-gray-500 italic">Typing...</div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No messages yet. Start a conversation!
                  </div>
                )}
              </div>
              
              <form onSubmit={sendMessageHandler} className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={typingHandler}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
      
      {newChatModal && (
        <Modal
          header="New Conversation"
          content={<ChatUserModal />}
          handleClose={() => {
            setNewChatModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default ChatPage;