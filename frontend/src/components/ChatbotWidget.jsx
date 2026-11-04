import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am EcoBot, your smart recycling assistant. Ask me anything about waste sorting or platform reporting!' }
  ]);
  const [inputText, setInputText] = useState('');

  const botResponses = [
    { key: 'plastic', response: 'Plastic bottles and containers should be rinsed before discarding. Make sure to separate them from organic waste!' },
    { key: 'organic', response: 'Organic wastes like vegetables and food leftovers can be composted. This reduces landfill methane emissions!' },
    { key: 'report', response: 'To report waste, go to the "Report Waste" page, snap a picture, set the location on the map, and submit!' },
    { key: 'hello', response: 'Hello there! Ready to make your city cleaner today?' },
    { key: 'hi', response: 'Hi! How can I assist you with eco mapping today?' }
  ];

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMsg]);

    const cleanInput = inputText.toLowerCase();
    let reply = "I'm still learning! You can ask about sorting 'plastic', 'organic' waste, or how to 'report' trash.";

    for (const rule of botResponses) {
      if (cleanInput.includes(rule.key)) {
        reply = rule.response;
        break;
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);

    setInputText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="glass flex h-[450px] w-80 flex-col overflow-hidden rounded-2xl border border-[#cfe1d1] shadow-xl md:w-96">
          <div className="bg-gradient-to-r from-neon-blue to-neon-teal p-4 flex items-center justify-between text-dark-bg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-bold text-sm tracking-wide">Eco Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'bot' 
                    ? 'self-start border border-[#dbe4d8] bg-white text-[#35594c]' 
                    : 'self-end border border-[#b8d6bc] bg-[#e8f3e8] text-[#24483b]'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-dark-border flex gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask EcoBot..."
              className="flex-1 rounded-xl border border-[#d4e1d4] bg-[#f8faf7] px-4 py-2 text-xs text-[#24483b] focus:border-[#227c70] focus:outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-neon-blue hover:bg-neon-blue/80 text-dark-bg p-2 rounded-xl transition-colors cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-[#1f6e5f] p-4 text-white shadow-neon-glow transition-all hover:scale-105 hover:bg-[#175648]"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
