const express = require('express');
const cors = require('cors');
const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Stores sessions in memory (for demo purposes)
const sessions = new Map();

app.post('/api/connect', async (req, res) => {
    const { host, port, secure, user, pass } = req.body;
    
    const client = new ImapFlow({
        host,
        port: parseInt(port),
        secure: secure === 'true' || secure === true,
        auth: { user, pass },
        logger: false
    });

    try {
        await client.connect();
        const sessionId = Math.random().toString(36).substring(7);
        sessions.set(sessionId, { client, config: req.body });
        
        // Fetch folders
        const list = await client.list();
        const folders = list.map(f => ({ name: f.name, path: f.path }));
        
        res.json({ sessionId, folders });
    } catch (err) {
        console.error('Connection error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/emails', async (req, res) => {
    const { sessionId, folder = 'INBOX' } = req.query;
    const session = sessions.get(sessionId);
    if (!session) return res.status(401).json({ error: 'Session expired' });

    const { client } = session;
    let lock = await client.getMailboxLock(folder);
    try {
        const messages = [];
        // Fetch last 20 messages
        for await (let msg of client.fetch({ last: 20 }, { envelope: true, source: true })) {
            const parsed = await simpleParser(msg.source);
            messages.push({
                uid: msg.uid,
                subject: parsed.subject,
                from: parsed.from.text,
                date: parsed.date,
                text: parsed.text,
                html: parsed.html,
                preview: parsed.textAsHtml?.substring(0, 100) || parsed.text?.substring(0, 100)
            });
        }
        res.json(messages.reverse());
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: err.message });
    } finally {
        lock.release();
    }
});

app.post('/api/send', async (req, res) => {
    const { sessionId, to, subject, text, html } = req.body;
    const session = sessions.get(sessionId);
    if (!session) return res.status(401).json({ error: 'Session expired' });

    const { config } = session;
    console.log('Sending email using config:', config.user);

    // Note: SMTP host usually differs from IMAP, but often users use the same for simplicity in this demo.
    // In a real app, you'd ask for SMTP details too. We'll try to guess or use provided.
    const transporter = nodemailer.createTransport({
        host: config.smtpHost || config.host.replace('imap', 'smtp'),
        port: config.smtpPort || 465,
        secure: true,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    try {
        await transporter.sendMail({
            from: config.user,
            to,
            subject,
            text,
            html
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Send error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
