# Email Nexus

A premium, glassmorphic email client built with React and Node.js. Connect to any IMAP/SMTP provider and manage your emails with a modern, high-performance interface.

![Email Nexus Login](file:///C:/Users/kai99/.gemini/antigravity/brain/b9371448-bbe6-417e-a943-48e4d6c169cc/email_nexus_login_1772141635106.png)

## ✨ Features

- **💎 Premium Design**: Glassmorphic UI with frosted glass effects, subtle glows, and dark-mode aesthetics.
- **🌐 Universal Access**: Connect to Gmail, Outlook, Yahoo, or any custom IMAP/SMTP server.
- **📥 Real-time Sync**: Fetch latest messages and navigate through mail folders seamlessly.
- **📩 Rich Email Reader**: Securely renders HTML and plaintext emails.
- **✍️ Modern Composer**: Floating compose window with a clean, focused writing experience.
- **⚡ Performance**: Built on Vite for lightning-fast frontend loading.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. **Clone or Download** the project.
2. **Setup Backend**:
   ```bash
   cd server
   npm install
   ```
3. **Setup Frontend**:
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   cd server
   node index.js
   ```
   The server will run on `http://localhost:3001`.

2. **Start the Frontend Development Server**:
   ```bash
   cd client
   npm run dev
   ```
   The app will be accessible at `http://localhost:5173`.

## 🛠️ Technologies Used

- **Frontend**: React, Vite, Framer Motion (animations), Lucide React (icons), Axios.
- **Backend**: Node.js, Express, ImapFlow, Nodemailer, Mailparser.
- **Styling**: Vanilla CSS with custom modern design tokens.

## 🔒 Security Note

For providers like **Gmail** or **Outlook**, you must use an **App Password** instead of your regular account password. Standard login is often blocked by these providers for third-party apps unless an app-specific token is generated in your account security settings.

## 📁 Project Structure

```text
├── client/          # Vite + React frontend
│   ├── src/
│   │   ├── App.jsx  # Main application logic & UI
│   │   └── index.css # Global glassmorphic styles
├── server/          # Node.js + Express backend
│   └── index.js     # IMAP/SMTP bridge logic
└── README.md
```

---
Built with 💜 by Antigravity
