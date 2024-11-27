import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import InputArea from './components/InputArea';
import Header from './components/Header';

function App() {
  const [messages, setMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 模拟AI响应
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: '这是AI的回复示例',
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <Header 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
      />
      <ChatWindow messages={messages} />
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App; 