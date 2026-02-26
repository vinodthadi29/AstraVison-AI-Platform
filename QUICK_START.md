# AstraVision - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- PostgreSQL 13+
- Backend code (Flask app)

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Start Frontend Dev Server
```bash
npm run dev
```
Opens on: `http://localhost:5173`

### Step 3: Start Backend (in separate terminal)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Runs on: `http://localhost:5000`

### Step 4: Test the Application
1. Open http://localhost:5173 in your browser
2. You should see the AstraVision UI with no errors
3. Click "Initialize Session" to open login
4. Enter email and password (auto-creates account on first login)
5. Upload an image to test the search

---

## 🐛 Troubleshooting

### Frontend shows blank white screen
**Solution:** Ensure `tailwind.config.ts` exists
```bash
ls -la tailwind.config.ts
# Should exist - if not, run: npm install
```

### Login fails with "Request timeout"
**Solution:** Backend not running or unreachable
```bash
# Check backend is running
curl http://localhost:5000/api/health
# Should return: {"status": "ok"}

# If not, start backend:
cd backend && python app.py
```

### Image upload shows error
**Solution:** Check backend API error
```bash
# Check console for [v0] logs
# Backend might need database connection
curl http://localhost:5000/api/images

# If 500 error, check backend logs for database issues
```

### Build fails with TypeScript errors
**Solution:** Rebuild dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Environment Configuration

### Development (Default)
Backend assumed on: `http://localhost:5000/api`
```bash
npm run dev
```

### Custom Backend Location
```bash
# Create .env.local
echo "VITE_API_URL=http://your-backend:5000/api" > .env.local
npm run dev
```

### Production Build
```bash
VITE_API_URL=https://api.example.com/api npm run build
npm run preview
```

---

## 📊 What Each Component Does

### Frontend (This Directory)
- React + TypeScript UI
- Vite build system
- Tailwind styling
- Error handling & logging

### Backend (backend/ directory)
- Flask API server
- PostgreSQL database
- MobileNetV2 embeddings
- Similarity search

### Database (PostgreSQL)
- Image metadata
- Vector embeddings
- User authentication

---

## 🔍 Debug Logging

Everything important logs with `[v0]` prefix:

1. Open DevTools (F12)
2. Go to Console tab
3. Filter by: `[v0]`
4. You'll see:
   - API calls
   - Token management
   - Authentication flow
   - Upload progress
   - Errors with context

Example:
```
[v0] Attempting login...
[v0] Login successful
[v0] API call starting with params...
[v0] Error occurred in function...
```

---

## ✅ Verification

Run the verification script:
```bash
bash VERIFY_FIXES.sh
```

Should show all checks passing ✓

---

## 📚 Full Documentation

- **DEBUGGING_GUIDE.md** - In-depth troubleshooting
- **FIXES_APPLIED.md** - What was fixed
- **STATUS_REPORT.md** - Complete status
- **VERIFY_FIXES.sh** - Automated checks

---

## 🎯 Key Features

✅ Real visual similarity search using MobileNetV2  
✅ JWT authentication with token management  
✅ PostgreSQL vector database  
✅ Beautiful animated UI with Framer Motion  
✅ Error handling that never shows blank screen  
✅ Timeout protection for network issues  
✅ Debug logging for troubleshooting  

---

## 🚨 Emergency Help

If something goes wrong:

1. **Check DevTools Console** (F12)
   - Filter by `[v0]`
   - Look for error messages

2. **Check Backend Running**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Check Logs**
   - Frontend: Browser console
   - Backend: Terminal running Flask

4. **Reset Everything**
   ```bash
   # Frontend
   rm -rf node_modules && npm install && npm run dev
   
   # Backend (in separate terminal)
   cd backend && python app.py
   ```

5. **See Full Guides**
   - Read: DEBUGGING_GUIDE.md
   - Check: STATUS_REPORT.md

---

**Still having issues?** See **DEBUGGING_GUIDE.md** for comprehensive troubleshooting.

Happy building! 🚀
