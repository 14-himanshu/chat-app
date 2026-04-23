<div align="center">

# 💬 Real Time Chat

**A modern, real-time chat application built with React, TypeScript, and WebSockets.**

Connect instantly. Chat in rooms. No refresh needed.

[![License: MIT](https://img.shields.io/badge/License-MIT-7c3aed.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📖 Description

**Real Time Chat** is a lightweight, production-styled web application that enables multiple users to communicate instantly inside shared chat rooms. Built on a raw WebSocket server (Node.js) and a React + Vite frontend, it demonstrates real-time, bi-directional communication without any third-party messaging service.

Users sign up with a username and password (stored locally), join a named room, and exchange messages that are broadcast in real-time to all room participants.

---

## ✨ Features

- 🔐 **Authentication** — Sign up / Sign in with client-side credential storage
- 🚪 **Room-based Messaging** — Join any named room by ID; rooms are ephemeral
- ⚡ **Real-time Communication** — Powered by raw WebSocket (no polling)
- 👥 **Live User Count** — See how many users are in the room in real time
- 💬 **Chat Bubbles** — Left/right alignment with sender grouping and timestamps
- 📅 **Date Dividers** — Messages are visually grouped by date (Today, Yesterday, etc.)
- 🎨 **Modern Dark UI** — Purple-accented design system with smooth animations
- 📱 **Responsive Design** — Works on desktop and mobile
- ⌨️ **Enter to Send** — Keyboard-first message input

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 19 | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety |
| [Vite](https://vitejs.dev/) | 7 | Build tool & dev server |
| [TailwindCSS](https://tailwindcss.com/) | 4 | Utility-first CSS base |
| CSS Custom Properties | — | Design token system |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Runtime |
| [ws](https://github.com/websockets/ws) | 8 | WebSocket server |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety |
| [dotenv](https://github.com/motdotla/dotenv) | 16 | Environment config |

---

## 🎨 UI Overview

The interface follows a **dark-first design system** built entirely with CSS custom properties and inline styles for maximum portability.

- **Color system** — Deep navy base (`#0a0a0f`) with purple accent (`#7c3aed`) and layered surface elevations
- **Typography** — Inter (Google Fonts) with tight tracking and clear visual hierarchy
- **Components** — `Button`, `Field`, `Card`, `Avatar`, `StatusBadge`, `BrandMark` — all self-contained with no external component library
- **Animations** — `slideUp` for messages, `popIn` for modal cards, pulsing status dots
- **Chat Layout** — Fixed header, scrollable message area, pinned composer footer
- **Bubbles** — Gradient purple for sent messages; dark elevated surface for received; corner shaping for message groups

---

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   └── index.ts          # WebSocket server entry point
│   ├── dist/                 # Compiled output
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatRoom.tsx  # Main chat interface (Header, MessageList, Composer)
│   │   │   ├── JoinRoom.tsx  # Room join screen
│   │   │   └── ui.tsx        # Shared UI component library
│   │   ├── lib/
│   │   │   └── cn.ts         # Class name utility
│   │   ├── App.tsx           # Root component + WebSocket logic
│   │   ├── Auth.tsx          # Authentication screen
│   │   ├── types.ts          # Shared TypeScript interfaces
│   │   ├── index.css         # Design tokens, animations, global styles
│   │   └── main.tsx          # React entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── DESIGN.md
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chat-app.git
cd chat-app
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Copy the example env file and configure it:

```bash
cp .env.example .env
```

Start the WebSocket server:

```bash
npm run dev
```

> The server will start on `ws://localhost:8080` by default.

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Copy the example env file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

> The app will be available at `http://localhost:5173`

---

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port the WebSocket server listens on |

```env
PORT=8080
```

### Frontend — `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_WS_URL` | `ws://localhost:8080` | WebSocket server URL |

```env
VITE_WS_URL=ws://localhost:8080
```

---

## 📋 Usage

### 1. Create an Account

- Open `http://localhost:5173`
- Click **Sign Up** and enter a username (min. 3 chars) and password (min. 4 chars)
- Credentials are stored in `localStorage` — no backend auth required

### 2. Join a Room

- Enter any room ID (e.g. `GENERAL`, `TEAM42`)
- Room IDs are auto-uppercased and capped at 10 characters
- Click **Join Room** or press `Enter`

### 3. Send Messages

- Type in the message input at the bottom
- Press `Enter` or click the send button
- Messages are broadcast in real-time to all users in the same room

### 4. Multi-user Testing

Open a second browser tab or window, sign up as a different user, and join the same room ID to simulate a real conversation.

---

## 🖼️ Screenshots

| Auth Screen | Join Room | Chat Room |
|---|---|---|
| ![Auth](./screenshots/auth.png) | ![Join](./screenshots/join.png) | ![Chat](./screenshots/chat.png) |

> 📸 Add screenshots to a `/screenshots` directory in the project root.

---

## 🔌 WebSocket Message Protocol

The frontend and backend communicate via JSON messages over WebSocket.

### Client → Server

**Join a room**
```json
{
  "type": "join",
  "payload": {
    "roomId": "GENERAL",
    "username": "himanshu"
  }
}
```

**Send a chat message**
```json
{
  "type": "chat",
  "payload": {
    "message": "Hello, World!"
  }
}
```

### Server → Client

**Broadcast a chat message**
```json
{
  "type": "chat",
  "payload": {
    "message": "Hello, World!",
    "username": "himanshu",
    "timestamp": "2026-04-23T14:30:00.000Z"
  }
}
```

**User count update**
```json
{
  "type": "userCount",
  "payload": {
    "count": 3
  }
}
```

---

## 🔮 Future Improvements

- [ ] **Persistent storage** — Save messages to a database (PostgreSQL / MongoDB)
- [ ] **JWT authentication** — Replace localStorage auth with a real backend API
- [ ] **Message reactions** — Emoji reactions on individual messages
- [ ] **File & image sharing** — Upload and preview media in chat
- [ ] **Typing indicators** — Show when other users are typing
- [ ] **Message read receipts** — Delivered / seen status
- [ ] **Multiple rooms sidebar** — Switch between rooms without re-joining
- [ ] **Push notifications** — Browser notifications for new messages
- [ ] **Dark / light theme toggle** — User-configurable appearance
- [ ] **Docker support** — Containerize backend and frontend

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your branch: `git push origin feat/your-feature-name`
5. **Open** a Pull Request against `main`

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     A new feature
fix:      A bug fix
docs:     Documentation changes only
style:    Formatting, missing semicolons, etc.
refactor: Code change that neither fixes a bug nor adds a feature
chore:    Build process or auxiliary tool changes
```

### Code Style

- All code is written in **TypeScript** — no `any` types without justification
- Components use **inline styles + CSS variables** — avoid ad-hoc Tailwind utilities
- Keep components small and single-purpose

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Himanshu Pandey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

Made with ❤️ by [Himanshu Pandey](https://github.com/your-username)

</div>
