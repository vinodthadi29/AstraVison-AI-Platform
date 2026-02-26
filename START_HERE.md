# 🎯 START HERE - AstraVision AI Platform

Welcome! This guide will help you get AstraVision running in 5 minutes.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Auto-Start Everything
Choose your OS:

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Windows:**
```bash
start-dev.bat
```

### Step 2: Wait for Services
- Backend will start on port 5000
- Frontend will start on port 5173
- New terminal windows will open

### Step 3: Open Application
Open browser to: **http://localhost:5173**

### Step 4: Test Login
- Email: `test@example.com`
- Password: `TestPassword123`
- Click "Login"
- See success message ✅

**That's it! The app is running!**

---

## 📚 Documentation Guide

### 🔰 For First-Time Users
Start with: **[FINAL_SETUP.md](./FINAL_SETUP.md)**
- Quick start guide
- Default credentials
- Service URLs
- Common test commands

### 🛠️ For Setup & Configuration
Read: **[COMPLETE_SETUP.md](./COMPLETE_SETUP.md)**
- Detailed setup instructions
- Environment configuration
- Database setup
- Architecture overview
- Security best practices

### 🐛 For Troubleshooting
Check: **[COMPLETE_SETUP.md#Troubleshooting](./COMPLETE_SETUP.md)**
- Port conflicts
- Connection issues
- Authentication errors
- Database problems
- Build errors

### 🔍 For Understanding What Was Fixed
See: **[FIXES_APPLIED_FINAL.md](./FIXES_APPLIED_FINAL.md)**
- All issues identified
- Fixes applied
- Verification checklist
- What works now

### 🚀 For Production Deployment
Reference: **[FINAL_SETUP.md#Production-Deployment](./FINAL_SETUP.md)**
- Frontend deployment (Vercel, Netlify)
- Backend deployment (Railway, Render)
- Environment setup
- Performance tips

### 🎓 For Development
Use: **[COMPLETE_SETUP.md#Architecture-Overview](./COMPLETE_SETUP.md)**
- Project structure
- Authentication flow
- Image search flow
- Data models
- API endpoints

---

## 🧪 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5000/api/health
```

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myuser@example.com",
    "password": "SecurePass123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myuser@example.com",
    "password": "SecurePass123"
  }'
```

### Get API Info
```bash
curl http://localhost:5000/api/info
```

---

## ⚠️ If Something Goes Wrong

### Frontend won't start
```bash
# Stop the current process (Ctrl+C)
# Then:
npm install
npm run dev
```

### Backend connection fails
```bash
# Make sure backend is running:
cd backend
python wsgi.py

# Check CORS_ORIGINS in backend/.env includes:
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Database connection error
```bash
# Verify DATABASE_URL in backend/.env
# Test with:
psql "your-connection-string"

# Then restart backend:
cd backend
python wsgi.py
```

### Port already in use
```bash
# Kill process using the port:
# Linux/Mac - Port 5000:
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill

# Linux/Mac - Port 5173:
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill

# Windows - Find process:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## 📊 System Status

After starting services, you should see:

```
✓ Backend started (Port 5000)
✓ Frontend started (Port 5173)
✓ Database connected
✓ Ready for authentication
```

If any of these fail:
1. Check terminal output for error messages
2. Refer to troubleshooting section above
3. Read COMPLETE_SETUP.md for detailed help

---

## 🎯 What You Can Do

### Right Now
- ✅ Register a new user account
- ✅ Login with credentials
- ✅ View the main application
- ✅ Check health status

### Next Steps
- 📤 Upload an image
- 🔍 Search for similar images
- 👤 Update profile information
- 📊 View search history

### Later
- 🚀 Deploy to production
- 🔧 Customize the application
- 🎨 Modify the UI
- 📱 Add more features

---

## 📖 File Structure

```
Project Root/
├── START_HERE.md              ← You are here
├── FINAL_SETUP.md             ← Quick start & API ref
├── COMPLETE_SETUP.md          ← Detailed guide
├── FIXES_APPLIED_FINAL.md     ← What was fixed
├── start-dev.sh               ← Linux/Mac startup
├── start-dev.bat              ← Windows startup
├── frontend/                  ← React app
│   └── src/lib/api.ts        ← API client
└── backend/                   ← Flask API
    ├── wsgi.py               ← Entry point
    ├── app/routes/           ← API routes
    └── app/models/           ← Database models
```

---

## 🔑 Important Files

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.local` | Frontend config | ✏️ If needed |
| `backend/.env` | Backend config | ✏️ Required |
| `backend/.env.example` | Template | 📖 Reference |
| `src/lib/api.ts` | API client | 🔒 Don't modify |
| `backend/wsgi.py` | Backend entry | 🔒 Don't modify |

---

## 🔐 Security Reminder

⚠️ **Important**: Never commit `.env` files to Git!
- Already excluded in `.gitignore`
- Keep secrets private
- Generate new secrets for production

---

## 💡 Pro Tips

### Tip 1: Use Different Terminals
```bash
# Terminal 1: Backend
cd backend
python wsgi.py

# Terminal 2: Frontend
npm run dev
```

### Tip 2: Check Logs During Development
```bash
# Backend logs show API activity
# Frontend console shows frontend errors (F12)
```

### Tip 3: Test API Before UI
```bash
# Use curl to verify backend works
curl http://localhost:5000/api/health
```

### Tip 4: Restart on .env Changes
```bash
# If you change .env files, restart both services
# Kill processes and run start-dev.sh again
```

---

## ❓ FAQ

**Q: Can I change the ports?**
A: Yes, modify in vite.config.ts (frontend) and wsgi.py (backend), then update .env files

**Q: How do I change the database?**
A: Update DATABASE_URL in backend/.env to your Neon/PostgreSQL connection string

**Q: Is this production-ready?**
A: Yes! See FINAL_SETUP.md#Production-Deployment for deployment instructions

**Q: Can I use a different authentication method?**
A: The backend supports JWT. Refer to backend/app/routes/auth.py to extend

**Q: How do I add new API endpoints?**
A: Create new route in backend/app/routes/ and blueprint in backend/app/routes/__init__.py

**Q: Can I deploy just the frontend?**
A: Yes, but you'll need a backend server. See FINAL_SETUP.md for deployment options

---

## 🎓 Learning Path

1. **Day 1**: Get it running (this guide)
2. **Day 2**: Explore API (use curl commands)
3. **Day 3**: Modify frontend (check React components)
4. **Day 4**: Extend backend (add endpoints)
5. **Day 5**: Deploy to production

---

## 📞 Need Help?

1. **Check the logs**: 
   - Browser console (F12)
   - Backend terminal output

2. **Read the docs**:
   - COMPLETE_SETUP.md for detailed info
   - FINAL_SETUP.md for quick ref
   - FIXES_APPLIED_FINAL.md for technical details

3. **Test with curl**:
   - Use provided examples
   - Verify backend is working

4. **Check environment**:
   - Verify .env files exist
   - Verify DATABASE_URL is correct
   - Verify ports are available

---

## ✅ Success Checklist

- ✅ Terminal 1: Backend running on :5000
- ✅ Terminal 2: Frontend running on :5173
- ✅ Browser: Page loads at http://localhost:5173
- ✅ Login: Can login with test@example.com
- ✅ API: curl http://localhost:5000/api/health works
- ✅ Console: No red errors in browser F12

If all checked, **you're ready to go!** 🎉

---

## 🚀 Next: Read [FINAL_SETUP.md](./FINAL_SETUP.md)

That guide has:
- API reference
- Test commands
- Deployment info
- Production config

---

**Good luck! Enjoy AstraVision! 🌟**
