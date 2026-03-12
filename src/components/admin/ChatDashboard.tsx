import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Send, CheckCircle, Clock, AlertCircle, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: number;
  session_id: number;
  sender: 'patient' | 'ai' | 'staff';
  message: string;
  timestamp: string;
}

interface Chat {
  session_id: number;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  mobile: string;
  status: 'active' | 'closed' | 'human_escalated';
  agent_id: string | null;
  start_time: string;
}

export const ChatDashboard: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await fetch(`/api/admin/chats/${sessionId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    }
  };

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000); // Poll for new chats
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.session_id);
      const interval = setInterval(() => fetchMessages(selectedChat.session_id), 3000); // Poll for new messages
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    setSending(true);
    try {
      await fetch(`/api/admin/chats/${selectedChat.session_id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, sender: 'staff' })
      });
      setNewMessage('');
      fetchMessages(selectedChat.session_id);
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  const handleTakeOver = async (sessionId: number) => {
    try {
      await fetch(`/api/admin/chats/${sessionId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_name: 'Admin' })
      });
      fetchChats();
    } catch (error) {
      console.error('Failed to take over chat', error);
    }
  };

  const handleCloseChat = async (sessionId: number) => {
    try {
      await fetch(`/api/admin/chats/${sessionId}/close`, {
        method: 'POST'
      });
      setSelectedChat(null);
      fetchChats();
    } catch (error) {
      console.error('Failed to close chat', error);
    }
  };

  const handleAssignDepartment = async (sessionId: number, deptId: number) => {
    try {
      // We'll reuse the assign endpoint or create a new one, 
      // but for now let's just update the agent_id with the department name
      const dept = ['Cardiology', 'Orthopedic', 'ENT', 'General Medicine'][deptId - 1];
      await fetch(`/api/admin/chats/${sessionId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_name: `Dept: ${dept}` })
      });
      fetchChats();
    } catch (error) {
      console.error('Failed to assign department', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-250px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Chat List */}
      <div className="w-80 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600" />
            Active Conversations
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active chats</div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.session_id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 text-left border-b border-slate-100 transition-all hover:bg-slate-50 ${
                  selectedChat?.session_id === chat.session_id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-900">{chat.patient_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(chat.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    chat.status === 'human_escalated' ? 'bg-rose-500 animate-pulse' : 
                    chat.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                  }`} />
                  <span className="text-xs text-slate-500 capitalize">{chat.status.replace('_', ' ')}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{selectedChat.patient_name}</div>
                  <div className="text-xs text-slate-500">ID: {selectedChat.patient_id} • {selectedChat.age}y • {selectedChat.gender}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedChat.status === 'human_escalated' && (
                  <button 
                    onClick={() => handleTakeOver(selectedChat.session_id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                  >
                    Take Over Chat
                  </button>
                )}
                <button 
                  onClick={() => handleCloseChat(selectedChat.session_id)}
                  className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Close Session
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'patient' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                    msg.sender === 'patient' ? 'bg-white text-slate-900 rounded-tl-none shadow-sm' :
                    msg.sender === 'ai' ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tr-none' :
                    'bg-indigo-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    <div className="text-[10px] opacity-50 mb-1 uppercase font-bold tracking-wider">
                      {msg.sender}
                    </div>
                    {msg.message}
                    <div className="text-[10px] opacity-50 mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button 
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare size={64} className="mb-4 opacity-20" />
            <p>Select a conversation to start monitoring</p>
          </div>
        )}
      </div>

      {/* Patient Profile Sidebar */}
      {selectedChat && (
        <div className="w-72 border-l border-slate-200 bg-white p-6 overflow-y-auto">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            Patient Profile
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="text-sm font-bold text-slate-900">{selectedChat.patient_name}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</label>
              <div className="text-sm text-slate-600">{selectedChat.mobile}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                <div className="text-sm text-slate-600">{selectedChat.age} Years</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                <div className="text-sm text-slate-600 capitalize">{selectedChat.gender}</div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Assign to Department</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 1, name: 'Cardiology' },
                  { id: 2, name: 'Orthopedic' },
                  { id: 3, name: 'ENT' },
                  { id: 4, name: 'General Medicine' }
                ].map(dept => (
                  <button 
                    key={dept.id}
                    onClick={() => handleAssignDepartment(selectedChat.session_id, dept.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-wider">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between group">
                  View Medical History <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between group">
                  Recent Lab Reports <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-between group">
                  Upcoming Appointments <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
