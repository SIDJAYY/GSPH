import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Minus } from 'lucide-react';

const AGENT = {
  name: 'JironAI',
  avatar: `${import.meta.env.BASE_URL}jiron.jpg`,
};

const EDGE_PADDING = 24; // px

export const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hi! I’m JironAI, your smart assistant. Just type your question below, and I’ll do my best to help you! 🚀', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(Date.now().toString());

  // Draggable floating icon position
  const [iconPos, setIconPos] = useState({ x: null, y: null, edge: 'bottom-right' });
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const chatWindowRef = useRef(null);

  // Tooltip animation
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }, 7000);
    return () => clearInterval(interval);
  }, [open]);

  // Send message to Dialogflow and handle response
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input, time: new Date() };
    setMessages((msgs) => [...msgs, userMessage]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', { // Updated URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId: sessionId.current }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: 'bot', text: data.reply, time: new Date() }]);
    } catch (err) {
      console.error('Chat API error:', err); // Add error logging
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Sorry, something went wrong.', time: new Date() }]);
    }
    setInput('');
    setLoading(false);
  };

  // Drag handlers for floating icon
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;

    const rect = dragRef.current?.getBoundingClientRect();
    const currentX = iconPos.x ?? window.innerWidth - EDGE_PADDING - 56;
    const currentY = iconPos.y ?? window.innerHeight - EDGE_PADDING - 56;

    offset.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;

    // Keep icon within viewport bounds
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 56));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 56));

    setIconPos({
      x: boundedX,
      y: boundedY,
      edge: null,
    });
  };

  const snapToEdge = (x, y) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const iconSize = 56;

    // Calculate distances to all four edges
    const distToTop = y;
    const distToBottom = h - y - iconSize;
    const distToLeft = x;
    const distToRight = w - x - iconSize;

    // Find the minimum distance to determine which edge to snap to
    const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);

    let newX = x;
    let newY = y;
    let edge = '';

    if (minDist === distToTop) {
      // Snap to top edge
      newY = EDGE_PADDING;
      edge = 'top';
    } else if (minDist === distToBottom) {
      // Snap to bottom edge
      newY = h - iconSize - EDGE_PADDING;
      edge = 'bottom';
    } else if (minDist === distToLeft) {
      // Snap to left edge
      newX = EDGE_PADDING;
      edge = 'left';
    } else {
      // Snap to right edge
      newX = w - iconSize - EDGE_PADDING;
      edge = 'right';
    }

    // For top/bottom edges, keep the horizontal position but ensure it's within bounds
    if (edge === 'top' || edge === 'bottom') {
      newX = Math.max(EDGE_PADDING, Math.min(x, w - iconSize - EDGE_PADDING));
    }

    // For left/right edges, keep the vertical position but ensure it's within bounds
    if (edge === 'left' || edge === 'right') {
      newY = Math.max(EDGE_PADDING, Math.min(y, h - iconSize - EDGE_PADDING));
    }

    return { x: newX, y: newY, edge };
  };

  const handleMouseUp = () => {
    if (!dragging.current) return;

    dragging.current = false;
    document.body.style.userSelect = ''; // Restore text selection

    // Don't snap to edge on drag release - let user position freely
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Close chat function
  const closeChat = () => {
    setOpen(false);
    setMinimized(false);
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (open && !minimized && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        closeChat();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, minimized]);

  // ESC key detection
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && open) {
        closeChat();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [open]);

  // Reset icon position to default when chatbox is open, snap to edge when closed
  useEffect(() => {
    if (open && !minimized) {
      setIconPos({ x: null, y: null, edge: 'bottom-right' });
    } else if (!open && iconPos.x !== null && iconPos.y !== null) {
      // When chat is closed, snap to nearest edge
      const snappedPos = snapToEdge(iconPos.x, iconPos.y);
      setIconPos(snappedPos);
    }
  }, [open, minimized]);

  // Floating button style
  const floatingStyle = iconPos.x !== null && iconPos.y !== null
    ? { 
        left: iconPos.x, 
        top: iconPos.y, 
        position: 'fixed', 
        zIndex: 50,
        transition: dragging.current ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    : { 
        right: EDGE_PADDING, 
        bottom: EDGE_PADDING, 
        position: 'fixed', 
        zIndex: 50,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      };

  // Chat window style (always centered)
  const chatWindowClasses = `
    fixed left-1/2 top-1/2 z-50 transition-all duration-300
    ${open && !minimized ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
  `;
  const chatWindowStyle = {
    transform: 'translate(-50%, -50%)',
    width: 370,
    maxWidth: '90vw',
  };

  return (
    <>
      {/* Floating Button (when closed or minimized) */}
      {(!open || minimized) && (
        <button
          aria-label="Open Chatbot"
          ref={dragRef}
          style={floatingStyle}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center transition-transform duration-200 active:scale-90"
          onClick={() => { setOpen(true); setMinimized(false); }}
          onMouseDown={handleMouseDown}
        >
          {showTooltip && (
            <span className="absolute -top-10 right-1/2 translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded shadow-md animate-bounce whitespace-nowrap pointer-events-none">
              Need Help?
            </span>
          )}
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window (centered) */}
      <div ref={chatWindowRef} className={chatWindowClasses} style={chatWindowStyle}>
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-200"
          style={{ minHeight: minimized ? 56 : 480, height: minimized ? 56 : 480 }}>
          {/* Titlebar */}
          <div className="flex items-center justify-between px-5 py-3 bg-orange-500">
            <div className="flex items-center gap-2">
              <img
                src={AGENT.avatar}
                alt={AGENT.name}
                className="w-7 h-7 rounded-full border-2 border-white"
              />
              <span className="font-semibold text-white text-lg">{AGENT.name}</span>
            </div>
            <div className="flex gap-2">
              {/* Minimize/Maximize */}
              <button
                aria-label={minimized ? 'Maximize Chat' : 'Minimize Chat'}
                className="text-white hover:text-orange-200"
                onClick={() => setMinimized(m => !m)}
              >
                {minimized ? <MessageCircle className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {/* Custom Chat UI */}
          {!minimized && (
            <div className="w-full h-[424px] bg-[#fff7ed] flex flex-col">
              <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 340 }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-orange-200' : 'bg-gray-100'}`}>
                      <div>{msg.text}</div>
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {msg.time && new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="mb-2 flex justify-start">
                    <span className="px-3 py-2 rounded-lg text-sm bg-gray-100">...</span>
                  </div>
                )}
              </div>
              <form onSubmit={sendMessage} className="flex border-t px-2 py-2">
                <input
                  className="flex-1 px-2 py-1 rounded border mr-2"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-1 rounded"
                  disabled={loading}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};