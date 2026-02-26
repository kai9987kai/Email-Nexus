import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, Inbox, User, LogOut, Search,
  Trash, ChevronRight, Plus, X, Loader
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const App = () => {
  const [session, setSession] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('INBOX');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login Form State
  const [loginData, setLoginData] = useState({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    user: '',
    pass: ''
  });

  const handleConnect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/connect`, loginData);
      setSession(res.data);
      fetchEmails(res.data.sessionId);
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async (sid) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/emails`, {
        params: { sessionId: sid, folder: selectedFolder }
      });
      setEmails(res.data);
    } catch (err) {
      setError('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/send`, {
        sessionId: session.sessionId,
        to: formData.get('to'),
        subject: formData.get('subject'),
        text: formData.get('message')
      });
      setIsComposeOpen(false);
    } catch (err) {
      alert('Failed to send: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="glass-card" style={{ width: '400px', padding: '40px', textAlign: 'center' }}>
        <Mail size={48} color="var(--accent)" style={{ marginBottom: '20px' }} />
        <h1>Email Nexus</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Connect to any IMAP server</p>

        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            className="input-field"
            placeholder="IMAP Host (e.g. imap.gmail.com)"
            value={loginData.host}
            onChange={e => setLoginData({ ...loginData, host: e.target.value })}
            required
          />
          <input
            className="input-field"
            placeholder="Email Address"
            value={loginData.user}
            onChange={e => setLoginData({ ...loginData, user: e.target.value })}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="App Password"
            value={loginData.pass}
            onChange={e => setLoginData({ ...loginData, pass: e.target.value })}
            required
          />
          {error && <p style={{ color: '#ff4d4d', fontSize: '14px' }}>{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? <Loader className="spin" size={20} /> : 'Connect Account'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ width: '95vw', height: '90vh', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', borderRight: '1px solid var(--glass-border)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '10px' }}>
            <Mail size={20} />
          </div>
          <h2 style={{ fontSize: '18px' }}>NexusFlow</h2>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="primary-button"
          style={{ width: '100%', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Plus size={20} /> Compose
        </button>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {session.folders.map(f => (
            <div
              key={f.path}
              onClick={() => setSelectedFolder(f.path)}
              style={{
                padding: '12px 15px',
                borderRadius: '12px',
                cursor: 'pointer',
                background: selectedFolder === f.path ? 'var(--bg-hover)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: selectedFolder === f.path ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <Inbox size={18} />
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{f.name}</span>
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-hover)', padding: '15px', borderRadius: '15px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.config.user}</p>
          </div>
          <LogOut size={16} cursor="pointer" onClick={() => setSession(null)} />
        </div>
      </div>

      {/* Email List */}
      <div style={{ width: '350px', borderRight: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '15px' }}>{selectedFolder}</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
            <input className="input-field" placeholder="Search..." style={{ paddingLeft: '40px' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ padding: '20px', textAlign: 'center' }}><Loader className="spin" /></div>}
          {emails.map(email => (
            <div
              key={email.uid}
              onClick={() => setSelectedEmail(email)}
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--glass-border)',
                cursor: 'pointer',
                background: selectedEmail?.uid === email.uid ? 'var(--bg-hover)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{email.from.split(' <')[0]}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {email.preview}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reader */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
        {selectedEmail ? (
          <>
            <div style={{ padding: '30px', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <h1>{selectedEmail.subject}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Trash size={20} color="var(--text-secondary)" cursor="pointer" />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User />
                </div>
                <div>
                  <p style={{ fontWeight: 600 }}>{selectedEmail.from}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    To: {session.config.user} • {new Date(selectedEmail.date).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
              <div
                style={{ color: '#e0e0e0', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: selectedEmail.html || selectedEmail.text.replace(/\n/g, '<br/>') }}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <Mail size={64} opacity={0.1} />
            <p>Select an email to read</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="glass-card"
            style={{
              position: 'fixed', bottom: '40px', right: '40px',
              width: '500px', height: '600px', zIndex: 100,
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ padding: '20px', background: 'var(--bg-hover)', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>New Message</h3>
              <X size={20} cursor="pointer" onClick={() => setIsComposeOpen(false)} />
            </div>
            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '15px' }}>
              <input name="to" className="input-field" placeholder="To" required />
              <input name="subject" className="input-field" placeholder="Subject" required />
              <textarea
                name="message"
                className="input-field"
                placeholder="Write your message..."
                style={{ flex: 1, resize: 'none' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Send size={18} /> Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
