import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Plus, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/ai/MessageBubble';

export default function AIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const unsub = base44.agents.subscribeToConversation(activeConversation.id, (data) => {
        setMessages(data.messages || []);
        setSending(false);
      });
      return () => unsub();
    }
  }, [activeConversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    const list = await base44.agents.listConversations({ agent_name: 'recruitment_assistant' });
    setConversations(list || []);
  };

  const newConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: 'recruitment_assistant',
      metadata: { name: `Chat ${new Date().toLocaleDateString('en-AU')}` },
    });
    setConversations(prev => [conv, ...prev]);
    setActiveConversation(conv);
    setMessages([]);
  };

  const openConversation = async (conv) => {
    const full = await base44.agents.getConversation(conv.id);
    setActiveConversation(full);
    setMessages(full.messages || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeConversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(activeConversation, { role: 'user', content: text });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-2">
        <Button onClick={newConversation} className="gap-2 w-full">
          <Plus className="w-4 h-4" /> New Chat
        </Button>
        <div className="flex-1 overflow-y-auto space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-colors ${
                activeConversation?.id === conv.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 inline mr-2 opacity-60" />
              {conv.metadata?.name || 'Chat'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">STS AI Recruitment Assistant</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Match candidates, draft job ads, check compliance gaps, create mobilisation checklists, and more.
              </p>
            </div>
            <Button onClick={newConversation} className="gap-2 mt-2">
              <Plus className="w-4 h-4" /> Start a Chat
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-border">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about candidates, jobs, compliance..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || sending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}