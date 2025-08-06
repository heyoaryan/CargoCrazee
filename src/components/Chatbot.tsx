import React, { useState, useRef, useEffect } from 'react';

const BOT_NAME = 'CargoCrazee Buddy';

const initialMessages = [
  { sender: BOT_NAME, text: 'Namaste! I am CargoCrazee Buddy, aapka MSME logistics assistant. Hindi, English, ya Hinglish mein poochhiye – main madad karne ke liye hoon! (Ask me anything about our features, MSMEs, or how to use the platform!)' }
];

const SUPPORT_EMAIL = 'support@cargocrazee.com';
const SUPPORT_PHONE = '+91-9876543210';

const mockBotReply = (userMsg: string, userName?: string) => {
  // Hinglish/Hindi/English keyword matching
  if (/msme|business|enterprise|व्यापार|उद्यम/i.test(userMsg)) {
    return 'MSMEs (Micro, Small & Medium Enterprises) ko humari platform se sasti aur smart logistics, shared trucking, aur micro-warehousing milta hai.';
  }
  if (/feature|kya|can you do|help|सुविधा|मदद/i.test(userMsg)) {
    return 'Main aapki madad kar sakta hoon: route optimization, shipment tracking, shared truck pooling, micro-warehousing, instant quotes, live alerts, aur bhi bahut kuch!';
  }
  if (/profile|account|my name|प्रोफाइल|खाता/i.test(userMsg)) {
    return userName ? `Aapka naam hai ${userName}. Profile page se update kar sakte hain.` : 'Aap Profile page se apna profile dekh aur update kar sakte hain.';
  }
  if (/delivery|shipment|track|डिलीवरी|शिपमेंट|ट्रैक/i.test(userMsg)) {
    return 'Aap nayi delivery add kar sakte hain, shipments track kar sakte hain, aur recent deliveries Dashboard par dekh sakte hain.';
  }
  if (/hello|hi|namaste|hey|नमस्ते|हाय/i.test(userMsg)) {
    return 'Namaste! Kaise madad kar sakta hoon aapki aaj?';
  }
  if (/price|cost|rate|charge|कितना|कीमत|भाड़ा/i.test(userMsg)) {
    return 'Aapko shipment ka estimated price Dashboard ya Add Delivery page par mil jayega. Instant quote lene ke liye shipment details daaliye.';
  }
  if (/warehouse|storage|गोदाम|स्टोरेज/i.test(userMsg)) {
    return 'Hum micro-warehousing aur storage solutions bhi provide karte hain. Details ke liye Features page dekhein.';
  }
  if (/truck|shared|pool|sharing|शेयर|ट्रक/i.test(userMsg)) {
    return 'Shared truck pooling se aap apna cost kam kar sakte hain. Apni delivery details daaliye aur best match paaiye.';
  }
  if (/alert|notification|सूचना|अलर्ट/i.test(userMsg)) {
    return 'Aapko shipment status aur delivery updates ke liye live alerts milenge.';
  }
  if (/contact|support|helpdesk|संपर्क|सपोर्ट/i.test(userMsg)) {
    return `Aap humse Email: ${SUPPORT_EMAIL} ya Phone: ${SUPPORT_PHONE} par sampark kar sakte hain.`;
  }
  if (/about|company|platform|कंपनी|प्लेटफार्म/i.test(userMsg)) {
    return 'CargoCrazee ek MSME-focused logistics platform hai jo aapko affordable aur reliable delivery solutions deta hai.';
  }
  if (/signup|register|sign up|रजिस्टर|साइनअप/i.test(userMsg)) {
    return 'Naya account banane ke liye Sign Up page par jaakar apni details fill karein.';
  }
  if (/login|sign in|लॉगिन|साइनइन/i.test(userMsg)) {
    return 'Aap Sign In page se apne account mein login kar sakte hain.';
  }
  // Fallback: If not understood, provide contact info
  return `Mujhe aapka sawaal sahi se samajh nahi aaya. Kripya apna sawaal dobara poochhein ya humse sampark karein: Email: ${SUPPORT_EMAIL}, Phone: ${SUPPORT_PHONE}`;
};

interface ChatbotProps {
  user?: { name: string; email: string } | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: user?.name || 'You', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      const botReply = mockBotReply(input, user?.name);
      setMessages(prev => [...prev, { sender: BOT_NAME, text: botReply }]);
    }, 700);
  };

  return (
    <>
      {/* Floating button for mobile and desktop */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center focus:outline-none md:bottom-10 md:right-10 group"
        style={{ display: open ? 'none' : 'flex', width: 64, height: 64, minWidth: 64, minHeight: 64, aspectRatio: '1/1' }}
        aria-label="Open Chatbot"
        onClick={() => setOpen(true)}
        title="Chat with CargoCrazee Buddy"
      >
        <span className="material-icons" style={{ fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>chat_bubble</span>
      </button>

      {/* Chatbot window */}
      <div
        className={`fixed z-50 bottom-0 right-0 w-full max-w-xs md:max-w-sm lg:max-w-md h-[60vh] md:h-[70vh] bg-white shadow-2xl border-t md:border-t-0 md:border-l border-gray-200 rounded-t-2xl md:rounded-l-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full md:translate-x-full'} md:translate-y-0 md:translate-x-0`}
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
          <div className="flex items-center gap-2">
            <span className="font-bold">{BOT_NAME}</span>
          </div>
          <button className="text-white hover:text-gray-200" onClick={() => setOpen(false)} aria-label="Close Chatbot">
            <span className="material-icons">close</span>
          </button>
        </div>
        {/* Chat body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-br from-gray-50 via-white to-blue-50" style={{ fontSize: 16 }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.sender === (user?.name || 'You') ? 'justify-end' : 'justify-start'}`}> 
              <div className={`relative px-4 py-3 max-w-[85%] shadow-md rounded-2xl transition-all
                ${msg.sender === (user?.name || 'You')
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-900 border border-blue-100 rounded-bl-sm'}
              `}>
                <span className="block font-semibold text-xs mb-1 opacity-70">
                  {msg.sender === (user?.name || 'You') ? 'You' : BOT_NAME}
                </span>
                <span style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{msg.text}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        {/* Input */}
        <form className="flex items-center gap-2 px-4 py-3 border-t bg-white" onSubmit={handleSend}>
          <input
            type="text"
            className="flex-1 rounded-full border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            aria-label="Type your message"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-semibold focus:outline-none"
            disabled={!input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;