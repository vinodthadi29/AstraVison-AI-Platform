# AstraVision End-to-End Testing Checklist

Complete checklist for testing all features of the full-stack application.

## Frontend Build & UI

- [ ] Frontend builds without errors: `npm run dev`
- [ ] Landing page displays correctly
- [ ] All UI components load without console errors
- [ ] Animations work smoothly (Framer Motion)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Navigation bar renders correctly
- [ ] All colors match design (violet/blue/black theme)

## Authentication Flow

### Registration
- [ ] "Register" tab appears on auth modal
- [ ] Can enter email, username, password
- [ ] Password confirmation validation works
- [ ] Submit button is clickable
- [ ] Success: Redirect to dashboard after registration
- [ ] Error handling: Show error message for invalid input
- [ ] Error handling: Show error for duplicate email
- [ ] Token is stored in localStorage
- [ ] User state updates in context

### Login
- [ ] "Login" tab appears on auth modal
- [ ] Can enter email and password
- [ ] Submit button is clickable
- [ ] Success: Redirect to dashboard after login
- [ ] Error handling: Show error for invalid credentials
- [ ] Success: Token is stored in localStorage
- [ ] User profile appears in navigation

### Token Management
- [ ] Token persists after page refresh
- [ ] Logout clears token and user state
- [ ] Navigation bar shows logout button when authenticated
- [ ] Clicking logout works correctly

## Image Upload Flow

### Upload Component
- [ ] Upload tab appears in authenticated nav
- [ ] Upload zone displays correctly
- [ ] File input dialog opens when clicking "Select Files"
- [ ] Drag & drop area highlights on drag
- [ ] Drop accepts multiple files

### Upload Process
- [ ] File preview shows correctly
- [ ] Upload status transitions: pending → uploading → success/error
- [ ] Success message displays after upload
- [ ] Error message displays on failure
- [ ] Retry button appears for failed uploads
- [ ] File can be removed from upload list
- [ ] Large files are rejected with error message

### Backend Upload
- [ ] Files are saved to `/uploads/` directory
- [ ] Database records are created with correct metadata
- [ ] File size and type are validated
- [ ] CORS allows requests from frontend
- [ ] JWT token is required and validated

## Dashboard Page

### Display
- [ ] Dashboard tab shows in authenticated nav
- [ ] Page loads without errors
- [ ] Shows "No images" message when empty
- [ ] Shows uploaded images in grid layout
- [ ] Image count displays correctly
- [ ] Each image card shows filename and upload date

### Interaction
- [ ] Images can be clicked/hovered
- [ ] "Analyze" button is clickable (prepare for future feature)
- [ ] "Search" button is clickable (prepare for future feature)
- [ ] Images update after new upload without page refresh

## API Integration

### Auth Endpoints
- [ ] POST `/api/auth/register` returns success with token
- [ ] POST `/api/auth/login` returns success with token
- [ ] POST `/api/auth/logout` works correctly
- [ ] GET `/api/auth/verify` validates token

### Image Endpoints
- [ ] POST `/api/images/upload` accepts multipart form data
- [ ] Response includes image metadata (id, filename, path)
- [ ] GET `/api/images` returns list of user images
- [ ] GET `/api/images/<id>` returns single image details
- [ ] Authorization header is required and checked
- [ ] CORS headers are present in responses

### Error Handling
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing/invalid token
- [ ] 404 Not Found for non-existent resources
- [ ] 500 Server Error shows helpful message
- [ ] Error responses include error field with message

## Backend Services

### Database
- [ ] PostgreSQL connection works
- [ ] Tables are created: users, images
- [ ] Data persists after app restart
- [ ] Foreign key relationships work
- [ ] Indexes are created for performance

### Authentication Service
- [ ] Password hashing works correctly
- [ ] JWT tokens are generated
- [ ] Token validation works
- [ ] Token refresh works
- [ ] User data is returned with token

### Image Service
- [ ] Files are stored correctly
- [ ] Image metadata is saved to database
- [ ] File paths are tracked
- [ ] Duplicate file handling works
- [ ] File cleanup works on delete (future)

## Security

- [ ] Passwords are hashed (bcrypt)
- [ ] JWT tokens are verified
- [ ] CORS whitelist includes only frontend
- [ ] Rate limiting is active
- [ ] Input validation prevents SQL injection
- [ ] XSS protection is in place
- [ ] HTTPS ready (with proper config)

## Performance

- [ ] Page loads quickly (< 2s)
- [ ] Images load and display smoothly
- [ ] Upload progress shows smoothly
- [ ] Navigation transitions are smooth
- [ ] No memory leaks in browser
- [ ] API responses are fast (< 500ms)
- [ ] Database queries are optimized

## Browser Compatibility

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Edge Cases

- [ ] Extremely long filenames handled
- [ ] Special characters in filenames handled
- [ ] Very large files (near 50MB limit)
- [ ] Rapid successive uploads
- [ ] Network interruption during upload
- [ ] Session timeout handled gracefully
- [ ] Multiple tabs open (auth state sync)

## Deployment Readiness

- [ ] No console errors in production build
- [ ] Environment variables are configurable
- [ ] Database migrations run automatically
- [ ] Static files are served correctly
- [ ] Error logs are captured
- [ ] Health check endpoint works
- [ ] CORS is properly configured for deployment

## Future Features (Prepare for)

- [ ] Object detection API endpoints exist
- [ ] Heatmap endpoints exist
- [ ] Search endpoints exist
- [ ] UI placeholders for these features
- [ ] Database schema supports metadata storage

## Sign-Off

- [ ] All tests passed
- [ ] No breaking issues found
- [ ] Code is ready for review
- [ ] Documentation is complete
- [ ] Deployment ready

---

## Testing Commands

```bash
# Frontend build
npm run build

# Run tests
npm test

# Backend tests
cd backend
python -m pytest

# API testing with curl
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

## Common Issues & Solutions

### CORS Error
**Issue**: `Access to XMLHttpRequest has been blocked by CORS policy`
**Solution**: Check backend is running, CORS_ORIGINS includes frontend URL

### Auth Token Not Working
**Issue**: `401 Unauthorized`
**Solution**: Check token is sent in Authorization header, token hasn't expired

### Upload Failing
**Issue**: `413 Payload Too Large` or upload fails
**Solution**: Check file size < 50MB, ensure uploads/ directory exists, check disk space

### Database Error
**Issue**: `Unable to connect to database`
**Solution**: Check PostgreSQL running, database exists, connection string correct

### Blank Page
**Issue**: Frontend loads but nothing displays
**Solution**: Check browser console for errors, ensure all env vars set, clear cache
