 'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, MessageSquare } from 'lucide-react';

// Lightweight design tokens to match dashboard theme
const designTokens = {
  colors: {
    background: '#FCFCFC',
    cardBg: '#FFFFFF',
    primary: '#041D37',
    accent: '#44B0FF',
    muted: '#6F6F6F'
  }
  ,
  typography: {
    labelSmall: 'text-[14px] font-medium leading-[20px] tracking-[1px] uppercase',
    bodySmall: 'text-[14px] leading-[20px]'
  }
};

const logoGradient = 'linear-gradient(30deg, #44B0FF 0%, #973EEE 25%, #F12AE6 50%, #FF7039 75%, #F3BC3B 100%)';

type Contact = { id: string; name: string; avatar?: string; lastMessage?: string; unread?: number };
type Message = { id: string; from: string; to: string; text: string; createdAt: string };

const MessagesView: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showListOnMobile, setShowListOnMobile] = useState(false);
  const [tab, setTab] = useState<'contacts' | 'messages'>('contacts');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // load contacts
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/messages');
        const json = await res.json();
        if (!mounted || !json?.ok) return;
        setContacts(json.contacts || []);
        // auto-select first contact if none
        if (!selected && json.contacts && json.contacts.length) setSelected(json.contacts[0].id);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // load messages for selected contact
  useEffect(() => {
    if (!selected) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/messages?contactId=' + encodeURIComponent(selected));
        const json = await res.json();
        if (!mounted || !json?.ok) return;
        setMessages(json.messages || []);
        // scroll to bottom
        setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50);
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [selected]);

  const send = async () => {
    if (!selected || !input.trim()) return;
    const text = input.trim();
    const temp: Message = { id: 'temp-' + Date.now(), from: 'me', to: selected, text, createdAt: new Date().toISOString() };
    // optimistic UI
    setMessages(prev => [...prev, temp]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 20);
    try {
      setLoading(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: selected, from: 'me', text })
      });
      const json = await res.json();
      if (json?.ok && json.item) {
        // replace temp with actual
        setMessages(prev => prev.map(m => (m.id === temp.id ? json.item as Message : m)));
      }
    } catch (e) {
      // on error, mark message or remove
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#FCFCFC] flex flex-col">
      <div className="w-full flex-1 mx-auto bg-transparent">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Left: contacts */}
          <div
            className={`md:col-span-1 ${showListOnMobile ? 'block' : 'hidden'} md:block`}
            style={{ borderRight: '2px solid', borderImage: `${logoGradient} 1` }}
          > 
            <div className="p-3 border-b border-[#F2F2F2]">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-[#041D37]">Messages</h3>
                <div className="ml-auto md:hidden">
                  <button onClick={() => setShowListOnMobile(false)} aria-label="Close list" className="p-2">✕</button>
                </div>
              </div>
              {/* Tabs */}
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => setTab('contacts')} className={`px-3 py-1 rounded-full ${tab === 'contacts' ? 'bg-[#F3FBFF] text-[#041D37] font-medium' : 'text-[#6F6F6F]'}`}>Contacts</button>
                <button onClick={() => setTab('messages')} className={`px-3 py-1 rounded-full ${tab === 'messages' ? 'bg-[#F3FBFF] text-[#041D37] font-medium' : 'text-[#6F6F6F]'}`}>Messages</button>
              </div>
            </div>
            <div className="p-3">
              <div className="relative">
                <input className="w-full p-3 pl-12 rounded-full border border-[#EEF2F5]" placeholder={tab === 'contacts' ? 'Search contacts' : 'Search messages'} />
                <div className="absolute left-4 top-3 text-[#A8A8A8]"><Search size={16} /></div>
              </div>
            </div>
            <div className="divide-y overflow-auto" style={{ maxHeight: '60vh' }}>
              {contacts.map(c => (
                <button key={c.id} onClick={() => { setSelected(c.id); setShowListOnMobile(false); }} className={`w-full text-left p-3 flex items-center gap-3 hover:bg-[#FAFBFD] ${selected === c.id ? 'bg-[#F3FBFF]' : ''}`}>
                  <div className="p-[2px] rounded-full" style={{ background: logoGradient }}>
                    <div className="w-10 h-10 rounded-full bg-[#EEF2F5] flex items-center justify-center text-sm font-medium text-[#041D37]">{(c.name || 'U').slice(0,2)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#041D37]">{c.name}</div>
                    {tab === 'messages' ? <div className="text-sm text-[#6F6F6F] truncate">{c.lastMessage || 'No messages yet'}</div> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: chat area or add-member form depending on tab */}
          <div className="md:col-span-2">
            <div className="flex flex-col h-full px-2">
              {tab === 'contacts' ? (
                // Add New Member panel
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-[#F2F2F2] flex items-center" style={{ borderBottom: '4px solid transparent', borderImage: `${logoGradient} 1` }}>
                    <div className="font-medium text-[#041D37]">Add New Member</div>
                    <div className="ml-auto text-sm text-[#6F6F6F]">Invite by email</div>
                  </div>
                  <div className="flex-1 p-6 overflow-auto bg-[#FBFCFE]" style={{ minHeight: 0 }}>
                    <AddMemberForm onAdd={(newContact) => {
                      setContacts(prev => [newContact, ...prev]);
                      setSelected(newContact.id);
                      setTab('messages');
                    }} />
                  </div>
                </div>
              ) : (
                // Chat area
                <div className="flex flex-col h-full">
                  <div
                    className="p-4 flex items-center"
                    style={{
                      borderStyle: 'solid',
                      borderWidth: '1px',
                      borderImage: `${logoGradient} 1`,
                      borderImageSlice: 1
                    }}
                  >
                    <div className="md:hidden mr-2">
                      <button onClick={() => setShowListOnMobile(true)} className="p-2">☰</button>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#EEF2F5] flex items-center justify-center text-sm font-medium text-[#041D37]">
                      {selected ? (contacts.find(c => c.id === selected)?.name || 'U').slice(0,2) : '?'}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-[#041D37]">
                        {selected ? (contacts.find(c => c.id === selected)?.name || 'Unknown') : 'Select a conversation'}
                      </div>
                      <div className="text-sm text-[#6F6F6F]">
                        {selected ? 'Active now' : 'Choose a person to start chatting'}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-auto bg-[#FBFCFE]" ref={scrollRef as any} style={{ minHeight: 0 }}>
                    {!selected ? (
                      <div className="text-center text-[#6F6F6F]">No conversation selected</div>
                    ) : (
                      <div className="space-y-4 max-w-3xl mx-auto">
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${m.from === 'me' ? 'bg-[#041D37] text-white' : 'bg-white text-[#041D37]'} p-3 rounded-lg shadow-sm max-w-[85%]`}>{m.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-[#F2F2F2] bg-white">
                    <div className="flex items-center gap-3 max-w-3xl mx-auto">
                      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder={selected ? 'Write a message...' : 'Select a conversation first'} disabled={!selected} className="flex-1 p-3 rounded-md border border-[#EEF2F5]" />
                      <button onClick={send} disabled={!selected || !input.trim() || loading} className="h-10 w-10 rounded-md bg-[#041D37] text-white flex items-center justify-center">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesView;

// Simple add member form component
const AddMemberForm: React.FC<{ onAdd: (c: Contact) => void }> = ({ onAdd }) => {
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [type, setType] = useState<'Client' | 'Freelancer'>('Freelancer');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), memberType: type, companyWebsite: companyWebsite.trim() })
      });
      const json = await res.json();
      if (json?.ok && json.item) {
        const item = json.item as any;
        const newContact: Contact = {
          id: item.id,
          name: item.name,
          avatar: undefined,
          lastMessage: item.lastMessage || '',
          unread: item.unread || 0
        };
        onAdd(newContact);
        setSent(true);
        setEmail('');
        setCompanyWebsite('');
        setType('Freelancer');
      } else {
        // simple fallback: still add locally
        const newContact: Contact = {
          id: 'c-' + Date.now().toString(),
          name: email.split('@')[0] || email,
          lastMessage: '',
          unread: 0
        };
        onAdd(newContact);
      }
    } catch (e) {
      const newContact: Contact = {
        id: 'c-' + Date.now().toString(),
        name: email.split('@')[0] || email,
        lastMessage: '',
        unread: 0
      };
      onAdd(newContact);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-[#041D37]">Add New Member</h1>
        <p className="text-sm text-[#6F6F6F] mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.</p>

        <div className="mt-6 rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full">
          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Enter Email ID</label>
          <input value={email} onChange={e => { setEmail(e.target.value); setSent(false); }} className={`${designTokens.typography.bodySmall} text-[#161616] w-full p-2 rounded border border-transparent focus:border-[#44B0FF]`} placeholder="name@company.com" />
        </div>

        <div className="mt-4 rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white w-full">
          <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>Member Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className={`${designTokens.typography.bodySmall} text-[#161616] w-full p-2 rounded border border-transparent focus:border-[#44B0FF]`}>
            <option value="Freelancer">Freelancer</option>
            <option value="Client">Client</option>
          </select>
        </div>



        <div className="mt-6 flex items-center gap-3">
          <button onClick={submit} disabled={loading} className="px-8 py-3  bg-[#041D37] text-white rounded-3xl">{sent ? 'Invite sent' : 'Send Invite'}</button>
          {/* <button onClick={() => { setEmail(''); setCompanyWebsite(''); setType('Freelancer'); setSent(false); }} className="px-4 py-2 rounded-md border">Reset</button> */}
        </div>
      </div>
    </div>
  );
};
