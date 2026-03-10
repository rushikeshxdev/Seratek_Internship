# 🚀 Git Commit Guide for Seratek Internship

## Quick Commit Commands

### For Day-3 (NestJS Property API)
```bash
git add Day-3/
git commit -m "✨ Day 3: NestJS Property API with DTOs and validation"
```

### For Day-5 (Full-Stack Authentication)
```bash
git add Day-5/
git commit -m "🔐 Day 5: Full-Stack Authentication with JWT and bcrypt"
```

### For Day-6 (Real-time Notification System)
```bash
git add Day-6/
git commit -m "🔔 Day 6: Real-time Notification System with WebSocket, MongoDB, and comprehensive docs"
```

### Update Main README
```bash
git add README.md
git commit -m "📝 Update README: Added Day 3, 5, and 6 progress"
```

### Push All Changes
```bash
git push origin main
```

## Complete Workflow (All at Once)

```bash
# Stage all changes
git add .

# Create a single commit for all days
git commit -m "🚀 Days 3, 5, 6: NestJS API, Authentication, Real-time Notifications

- Day 3: NestJS Property API with controllers, DTOs, and validation
- Day 5: Full-Stack Authentication with JWT and user management
- Day 6: Real-time Notification System with WebSocket, MongoDB, and docs
- Updated main README with all progress"

# Push to GitHub
git push origin main
```

## Individual Commits (Recommended)

If you want separate commits for better history:

```bash
# Day 3
git add Day-3/
git commit -m "✨ Day 3: NestJS Property API

- Learned NestJS framework architecture
- Created Property module with controllers
- Implemented route parameters and query params
- Used ParseIntPipe and ParseBoolPipe
- Created DTOs for type safety"

# Day 5
git add Day-5/
git commit -m "🔐 Day 5: Full-Stack Authentication

- Built complete authentication system
- User registration and login
- JWT token implementation
- Password hashing with bcrypt
- Protected routes and middleware"

# Day 6
git add Day-6/
git commit -m "🔔 Day 6: Real-time Notification System

- WebSocket with Socket.IO
- MongoDB integration
- Auto-reconnection with localStorage
- User-specific and broadcast notifications
- Offline notification storage
- 10 comprehensive documentation files
- Beautiful responsive web client"

# Update README
git add README.md
git commit -m "📝 Update README with Days 3, 5, 6 progress"

# Push all commits
git push origin main
```

## Verify Before Pushing

```bash
# Check what will be committed
git status

# See the changes
git diff

# View commit history
git log --oneline -5
```

## Emoji Guide for Commits

- ✨ `:sparkles:` - New feature
- 🔐 `:lock:` - Security/Authentication
- 🔔 `:bell:` - Notifications
- 📝 `:memo:` - Documentation
- 🐛 `:bug:` - Bug fix
- 🚀 `:rocket:` - Deployment
- 🎨 `:art:` - UI/Styling
- ⚡ `:zap:` - Performance
- 🔧 `:wrench:` - Configuration

## Tips

1. **Commit often**: Small, focused commits are better than large ones
2. **Write clear messages**: Explain what and why, not how
3. **Use emojis**: Makes commit history more readable
4. **Check before push**: Always review with `git status` and `git diff`

---

**Ready to push? Run the commands above! 🚀**
