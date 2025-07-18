# FS25 Mods Hub

A modern web application for hosting and managing Farming Simulator 25 mods. Built with Vue.js frontend and Node.js/Express backend, using Appwrite as the database.

## 🚀 Features

- **Mod Browsing**: Browse mods by category with search and filtering
- **Mod Details**: Detailed mod pages with image galleries, descriptions, and ratings
- **User Profiles**: User authentication and profile management
- **Admin Panel**: Admin interface for mod approval and management
- **Responsive Design**: Mobile-friendly interface
- **Image Gallery**: Multi-image support with thumbnail navigation

## 🛠️ Technology Stack

### Frontend
- Vue.js 3 with Composition API
- TypeScript for type safety
- Vite for fast development
- Pinia for state management
- Vue Router for navigation

### Backend
- Node.js with Express
- Appwrite for database and authentication
- File upload handling with validation
- RESTful API design

### Database
- Appwrite (hosted database service)
- Collections for mods, users, categories, reviews, and submissions

## 📋 Project Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Appwrite project setup

### Installation

1. **Clone the repository**
```sh
git clone https://github.com/MrCode403/fs25-mods-hub.git
cd fs25-mods-hub
```

2. **Install frontend dependencies**
```sh
npm install
```

3. **Install backend dependencies**
```sh
cd api
npm install
```

4. **Environment Setup**
```sh
# Copy environment template in api directory
cp .env.example .env
# Configure your Appwrite credentials in .env
```

### Development

1. **Start the backend server**
```sh
cd api
npm start
# Server runs on http://localhost:3001
```

2. **Start the frontend development server**
```sh
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Build

```sh
npm run build
```

## 🎯 Current Status

✅ **Completed Features:**
- User authentication and profiles
- Mod upload and submission system
- Admin approval workflow
- Mod browsing with categories
- Image gallery with proper ModImage format
- File size validation and display
- Featured mods functionality
- Responsive UI design

✅ **Recent Fixes:**
- Fixed mod images loading issues
- Corrected API data format compatibility
- Resolved database schema validation
- Fixed author profile integration
- Cleaned up test files and documentation

## 🧹 Project Maintenance

Use the included cleanup script to remove temporary and test files:

```sh
# Preview what would be deleted
node cleanup.cjs

# Actually perform cleanup
node cleanup.cjs --execute
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔧 API Endpoints

### Mods
- `GET /api/mods` - Get all mods with pagination and filtering
- `GET /api/mods/:id` - Get specific mod details
- `POST /api/mods/:id/download` - Increment download counter

### Submissions
- `POST /api/submissions` - Submit new mod for approval
- `GET /api/submissions` - List submissions (admin)

### Categories
- `GET /api/categories` - Get all mod categories

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
