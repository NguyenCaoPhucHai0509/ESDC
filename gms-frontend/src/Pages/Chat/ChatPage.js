import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../../features/conservations/conversationSlice';
import { fetchMessages, sendMessage } from '../../features/messages/messageSlice';
import io from 'socket.io-client';
import { createConversation } from '../../features/conservations/conversationSlice';

const ENDPOINT = 'http://localhost:5000';
let socket;

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newChatModal, setNewChatModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const { users } = useSelector((state) => state.users);  
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { conversations, isLoading: conversationsLoading } = useSelector((state) => state.conversations);
  const { messages, isLoading: messagesLoading } = useSelector((state) => state.messages);

  useEffect(() => {
    // Khởi tạo socket và kết nối
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));

    // Xử lý typing
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchMessages(selectedChat._id));
      socket.emit('join chat', selectedChat._id);
    }
  }, [selectedChat, dispatch]);

  useEffect(() => {
    // Cuộn xuống tin nhắn mới nhất
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    // Typing indicator
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
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
      }));
      
      setNewMessage('');
    }
  };

  return (
    <div className="ml-[25%] p-5 w-[75%] h-screen">
      <h1 className="text-2xl font-bold mb-4">Tin nhắn</h1>
      
      <div className="flex h-[calc(100vh-7rem)] bg-white rounded-lg shadow-md overflow-hidden">
        {/* Danh sách cuộc trò chuyện */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-4 border-b bg-gray-100">
            <h2 className="font-semibold">Cuộc trò chuyện</h2>
          </div>
          
          {conversationsLoading ? (
            <div className="flex justify-center items-center h-20">
              <p>Đang tải...</p>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((chat) => (
              <div 
                key={chat._id}
                className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                  selectedChat && selectedChat._id === chat._id ? 'bg-indigo-50' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <h3 className="font-medium">
                  {chat.isGroupChat 
                    ? chat.chatName 
                    : chat.participants.find(p => p._id !== user._id)?.fullName}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {chat.latestMessage ? chat.latestMessage.content : 'Bắt đầu cuộc trò chuyện'}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Không có cuộc trò chuyện nào
            </div>
          )}
        </div>
        
        {/* Khung chat */}
        <div className="w-2/3 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">
                  {selectedChat.isGroupChat 
                    ? selectedChat.chatName 
                    : selectedChat.participants.find(p => p._id !== user._id)?.fullName}
                </h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <p>Đang tải tin nhắn...</p>
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
                      <div className="text-gray-500 italic">Đang nhập...</div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Không có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
                  </div>
                )}
              </div>
              
              <form onSubmit={sendMessageHandler} className="p-4 border-t">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={typingHandler}
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
                  >
                    Gửi
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;