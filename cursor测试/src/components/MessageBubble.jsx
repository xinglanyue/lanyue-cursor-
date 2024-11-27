import React from 'react';

function MessageBubble({ message }) {
  const { text, sender } = message;
  
  return (
    <div className={`message-bubble ${sender}`}>
      <div className="message-content">
        {text}
      </div>
      <div className="message-timestamp">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default MessageBubble; 