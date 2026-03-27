# 🔐 RBAC Authentication System

A production-grade **Role-Based Access Control (RBAC) authentication system** built with the MERN stack, featuring JWT-based authentication, multi-device session management, and comprehensive security measures.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-18.2-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔑 Authentication & Authorization
- **Dual-Token System**: Short-lived access tokens (15 min) + long-lived refresh tokens (7 days)
- **Automatic Token Refresh**: Seamless user experience with transparent token renewal
- **Token Rotation**: Enhanced security through refresh token rotation on each use
- **Role-Based Access Control**: Three-tier permission system (User, Manager, Admin)
- **httpOnly Cookies**: XSS-resistant token storage

### 🛡️ Security
- **Multi-Layer Protection**:
  - Rate Limiting (5 attempts/15 min per IP)
  - Account Lockout (5 failures locks account for 30 min)
  - bcrypt Password Hashing (10 salt rounds)
  - Input Validation (express-validator)
  - CSRF Protection (sameSite cookies)
  - Security Headers (Helmet.js)
- **Comprehensive Audit Logging**: Track all authentication events with IP, device, and timestamp
- **XSS Protection**: httpOnly cookies + React's automatic HTML escaping

### 📱 Session Management
- **Multi-Device Support**: Login from multiple devices simultaneously
- **Device Tracking**: Browser, OS, and IP address detection
- **Session Control**: View all active sessions and revoke them individually or all at once

### 📊 Admin Dashboard
- **User Management**: View all users with roles and registration dates
- **Audit Statistics**: Login attempts, success rates, and recent activity
- **System Monitoring**: Real-time health checks and system status

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt, Helmet.js, express-rate-limit, express-validator
- **Environment**: dotenv

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios with interceptors
- **State Management**: Context API

### DevOps
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Frontend│ ◄─────► │  Express Backend │ ◄─────► │  MongoDB Atlas  │
│   (Vercel)      │  HTTPS  │    (Render)      │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ├─── JWT Tokens ────────────┤
        ├─── httpOnly Cookies ──────┤
        └─── CORS Configured ───────┘
```

### Request Flow

```
User Request
    ↓
Rate Limiter (IP-based)
    ↓
Input Validation
    ↓
Authentication Middleware (JWT verification)
    ↓
Authorization Middleware (Role check)
    ↓
Controller Logic
    ↓
Database Query
    ↓
Audit Logging
    ↓
Response
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rbac-system.git
   cd rbac-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables** (see [Environment Variables](#-environment-variables))

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Run the backend**
   ```bash
   cd server
   npm run dev
   ```

7. **Run the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`
   - API Health Check: `http://localhost:5000/api/health`

---

## 🔐 Environment Variables

### Backend (`server/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/rbac-auth-system
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rbac-auth-system

# JWT Secrets (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
```

### Production Environment Variables

```env
# Backend (Render)
NODE_ENV=production
MONGO_URI=mongodb+srv://...
ACCESS_TOKEN_SECRET=<64-char-secret>
REFRESH_TOKEN_SECRET=<64-char-secret>
CLIENT_URL=https://your-frontend.vercel.app

# Frontend (Vercel)
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 📡 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login user | Public |
| `POST` | `/api/auth/logout` | Logout user | Private |
| `POST` | `/api/auth/refresh` | Refresh access token | Public (with refresh token) |

### User Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/user/profile` | Get user profile | Private |
| `PUT` | `/api/user/profile` | Update user profile | Private |
| `GET` | `/api/user/all` | Get all users | Admin |
| `POST` | `/api/user/unlock/:userId` | Unlock user account | Admin |

### Session Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/sessions` | Get all user sessions | Private |
| `DELETE` | `/api/sessions/:tokenId` | Revoke specific session | Private |
| `POST` | `/api/sessions/revoke-all` | Revoke all sessions | Private |

### Audit Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/audit/logs` | Get all audit logs | Admin |
| `GET` | `/api/audit/user/:userId` | Get user-specific logs | Admin |
| `GET` | `/api/audit/stats` | Get audit statistics | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/health` | Basic health check | Public |
| `GET` | `/api/health/detailed` | Detailed health status | Admin |

---

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with 10 salt rounds
- **Password requirements**: Minimum 6 characters, must include uppercase, lowercase, and number
- **Never stored in plain text** or reversible encryption

### Token Security
- **Access Tokens**: 15-minute expiry, signed with HS256
- **Refresh Tokens**: 7-day expiry, stored in database for revocation
- **Token Rotation**: New refresh token issued on each refresh, old one invalidated
- **httpOnly Cookies**: Prevents XSS token theft

### Brute Force Protection
- **Rate Limiting**:
  - Login: 5 attempts per 15 minutes per IP
  - Register: 3 attempts per hour per IP
  - General API: 100 requests per 15 minutes
- **Account Lockout**: 5 failed attempts locks account for 30 minutes

### Request Security
- **CORS**: Configured for specific origin with credentials
- **Helmet.js**: Sets security headers (CSP, X-Frame-Options, etc.)
- **Input Validation**: express-validator on all endpoints
- **CSRF Protection**: sameSite cookie attribute

### Audit & Monitoring
- **Comprehensive Logging**: All auth events tracked
- **Data Captured**: User ID, action, IP address, user agent, timestamp, status
- **Use Cases**: Security monitoring, compliance (GDPR, SOC 2), debugging

---

## 📁 Project Structure

```
rbac-system/
├── server/                      # Backend
│   ├── src/
│   │   ├── controllers/        # Route handlers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── session.controller.js
│   │   │   └── audit.controller.js
│   │   ├── models/             # Database schemas
│   │   │   ├── User.model.js
│   │   │   └── AuditLog.model.js
│   │   ├── routes/             # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── user.route.js
│   │   │   ├── session.route.js
│   │   │   └── audit.route.js
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── rbac.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── utils/              # Helper functions
│   │   │   ├── jwt.util.js
│   │   │   ├── password.util.js
│   │   │   ├── auditLog.util.js
│   │   │   ├── accountLockout.util.js
│   │   │   ├── deviceDetection.util.js
│   │   │   └── tokenCleanup.util.js
│   │   └── db/                 # Database connection
│   │       └── connect.js
│   ├── index.js                # Server entry point
│   ├── package.json
│   └── .env
│
├── frontend/                    # Frontend
│   ├── src/
│   │   ├── api/                # API configuration
│   │   │   └── axios.js
│   │   ├── components/         # Reusable components
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── context/            # Global state
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── pages/              # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Sessions.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── App.jsx             # Root component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Tailwind styles
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🌐 Deployment

### Backend (Render)

1. **Create Web Service** on Render
2. **Configure**:
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Root Directory: `server`
3. **Set Environment Variables** (see [Environment Variables](#-environment-variables))
4. **Deploy**: Auto-deploys on GitHub push

### Frontend (Vercel)

1. **Import GitHub repository** to Vercel
2. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Set Environment Variable**: `VITE_API_URL`
4. **Deploy**: Auto-deploys on GitHub push

### Database (MongoDB Atlas)

1. **Create cluster** (M0 free tier)
2. **Create database user**
3. **Whitelist IP**: 0.0.0.0/0 (allow from anywhere)
4. **Get connection string** and add to backend env vars

---

## 🧪 Testing

### Test User Accounts

You can create test accounts with different roles:

```bash
# User account
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "User123!",
  "role": "user"
}

# Manager account
POST /api/auth/register
{
  "email": "manager@example.com",
  "password": "Manager123!",
  "role": "manager"
}

# Admin account
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "Admin123!",
  "role": "admin"
}
```

### Testing Rate Limiting

Try logging in with wrong password 6 times to trigger rate limiting and account lockout.

### Testing Multi-Device Sessions

1. Login from different browsers
2. Go to Sessions page
3. See all active sessions with device details
4. Revoke sessions individually

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@anshul051](https://github.com/anshul051)
- LinkedIn: [Anshul Kumar Arya](https://www.linkedin.com/in/anshulkumararya/)
- Email: anshulkumararya51@gmail.com

---

## 🙏 Acknowledgments

- [JWT.io](https://jwt.io/) - JWT documentation and debugger
- [OWASP](https://owasp.org/) - Security best practices
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

## 🔮 Future Enhancements

- [ ] Email verification for new accounts
- [ ] Two-Factor Authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Password reset via email
- [ ] Redis for rate limiting in production
- [ ] Refresh token cleanup cron job
- [ ] Time-series database for audit logs
- [ ] Real-time notifications (WebSocket)
- [ ] Mobile app (React Native)
- [ ] API documentation (Swagger/OpenAPI)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ and ☕

</div>