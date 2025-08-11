# 🎮 Roast Royale - The Ultimate Party Game

**Live Demo:** [Play Now](https://qjh9iecn9yeq.manus.space)

A highly addictive browser-based party game that combines Family Feud and Cards Against Humanity mechanics, perfect for Discord friend groups, Twitch streamers, and party nights!

## 🔥 Features

- **Team-based gameplay** (1v1, 2v2, 3v3, 4v4, 5v5, Free-for-All)
- **Real-time multiplayer** with WebSocket connections
- **Family Feud style** survey questions
- **Cards Against Humanity** roast mode
- **Chaos Cards** power-up system
- **Trending topics** and viral content
- **Mobile + desktop** responsive design
- **Room codes** for easy friend invites

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/roast-royale.git
   cd roast-royale
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend**
   ```bash
   cd backend
   python main.py
   ```

5. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🌐 Deployment

### Railway (Recommended)
1. Push this repo to GitHub
2. Connect Railway to your repository
3. Railway auto-detects Python and deploys
4. Add your custom domain in Railway dashboard

### Other Platforms
- **Render**: Great free tier with auto-SSL
- **DigitalOcean**: $5/month with excellent performance
- **Heroku**: Classic platform, $7/month minimum

See [HOSTING_GUIDE.md](./HOSTING_GUIDE.md) for detailed deployment instructions.

## 🎯 How to Play

1. **Create a room** with your name
2. **Share the 6-character code** with friends
3. **Form teams** and get ready to battle
4. **Answer survey questions** and predict popular responses
5. **Use Chaos Cards** for strategic advantages
6. **Discover** who really knows the group best!

## 🛠 Tech Stack

### Frontend
- **React 19** with hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.IO Client** for real-time features

### Backend
- **Flask** Python web framework
- **Flask-SocketIO** for WebSocket support
- **SQLite** database (production-ready)
- **CORS** enabled for cross-origin requests

## 📁 Project Structure

```
roast-royale/
├── frontend/           # React frontend source
│   ├── components/     # UI components
│   ├── services/       # Socket.IO service
│   └── ...
├── backend/            # Flask backend source
│   ├── main.py         # Main application
│   ├── game_manager.py # Game logic
│   ├── routes/         # API routes
│   └── static/         # Built frontend files
├── package.json        # Frontend dependencies
├── requirements.txt    # Backend dependencies
└── README.md
```

## 🎮 Game Mechanics

### Question Types
- **Survey Questions**: "What's the most annoying thing in Discord voice chat?"
- **Roast Mode**: Cards Against Humanity style prompts
- **Trending Topics**: Current memes and viral content

### Power-ups (Chaos Cards)
- **Double Down**: Double points for next answer
- **Spy Mode**: See other team's discussion
- **Steal**: Take opponent's points on wrong answer
- **Time Freeze**: Extra discussion time
- **Meme Bomb**: Insert trending meme

### Scoring
- Points based on answer popularity (Family Feud style)
- Bonus points for perfect predictions
- Power-up multipliers and effects

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Perfect For

- **Discord friend groups** with voice chat
- **Twitch streamers** looking for interactive content
- **Party hosts** wanting to break the ice
- **Gaming communities** seeking social gameplay
- **Content creators** generating viral moments

## 🔗 Links

- **Live Demo**: https://qjh9iecn9yeq.manus.space
- **Documentation**: See attached hosting guide
- **Issues**: Report bugs and request features

---

**Made with ❤️ for the gaming community**

*Think you know your friends? Think again.* 🔥

