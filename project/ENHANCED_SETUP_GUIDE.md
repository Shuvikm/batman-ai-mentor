# 🦇 Batman AI Mentor - Enhanced Setup Guide

## 🚀 New Features Overview

Your Batman AI Mentor platform has been upgraded with **powerful new features**:

### ✨ **Enhanced Features**
- 🤖 **Gemini AI Integration** - More accurate and intelligent chat responses
- 🎥 **Video Calling** - Real-time 1-on-1 sessions with teachers
- 👨‍🏫 **Teacher Platform** - Become a verified instructor and earn money
- 💳 **Payment System** - Secure payments via Stripe
- 📄 **Certificate Verification** - Upload and verify teaching credentials
- 🎨 **AI Content Generation** - Generate lessons, quizzes, and educational content
- 📊 **Advanced Analytics** - Track earnings, sessions, and performance

---

## 📋 Prerequisites Setup

### 1. **Google Gemini AI API Key**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and update `.env` file:
   ```env
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

### 2. **Stripe Payment Setup**
1. Create account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your test API keys from the Developers section
3. Update `.env` file:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   ```
4. For webhooks (optional): Create webhook endpoint pointing to your server

### 3. **Email Configuration (Optional)**
For teacher verification notifications:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

---

## 🛠 Installation & Setup

### 1. **Install New Dependencies**
```bash
# Backend dependencies (already installed)
npm install @google/generative-ai stripe socket.io multer sharp uuid nodemailer

# Frontend dependencies (already installed) 
npm install @stripe/stripe-js @stripe/react-stripe-js socket.io-client
```

### 2. **Environment Configuration**
Your `.env` file has been updated with all necessary configurations. **Update the API keys** with your actual keys:

```env
# Update these with your actual keys:
GEMINI_API_KEY=your-actual-gemini-api-key
STRIPE_SECRET_KEY=sk_test_your-actual-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-actual-publishable-key
```

### 3. **Create Upload Directory**
```bash
mkdir uploads
```

---

## 🎯 New Features Guide

### 🤖 **Enhanced AI Chat**
- **Powered by Google Gemini**: More accurate and contextual responses
- **Batman Personality**: Maintains the Dark Knight mentor character
- **Intelligent Fallbacks**: Works even if Gemini API is down
- **Rich Responses**: Detailed educational guidance and strategies

**Usage**: Access through the chat feature - responses are now significantly more intelligent and helpful!

### 🎥 **Video Calling System**
- **WebRTC Technology**: Direct peer-to-peer video calls
- **Session Rooms**: Private meeting rooms for each session
- **Audio/Video Controls**: Mute, camera toggle, screen sharing
- **Real-time Chat**: In-session messaging

**How to Use**:
1. Book a session with a teacher
2. Join the session at scheduled time
3. Click "Join Session" to start video call

### 👨‍🏫 **Teacher Platform**
- **Registration**: Upload certificates and credentials
- **Verification**: Admin review process for quality assurance
- **Profile Management**: Set rates, specializations, bio
- **Earnings Tracking**: Monitor income and session stats

**Become a Teacher**:
1. Click "Become a Teacher" on dashboard
2. Fill out registration form
3. Upload verification documents
4. Wait for admin approval (24-48 hours)
5. Start accepting students!

### 💳 **Payment System**
- **Stripe Integration**: Secure payment processing
- **Multiple Payment Methods**: Cards, digital wallets
- **Automatic Payouts**: Weekly payments to teachers
- **Transaction History**: Complete payment tracking

**How It Works**:
1. Student books session → creates payment intent
2. Secure payment via Stripe → session confirmed
3. After session completion → teacher receives payment

### 📄 **Certificate Verification**
- **Document Upload**: Certificates, degrees, licenses
- **Admin Review**: Manual verification process
- **Status Tracking**: Pending, approved, rejected statuses
- **Quality Assurance**: Ensures only qualified teachers

### 🎨 **AI Content Generation**
- **Lesson Plans**: Comprehensive educational content
- **Quiz Generation**: Intelligent question creation
- **Visual Descriptions**: Educational imagery suggestions
- **Difficulty Levels**: Beginner to advanced content

---

## 🚀 Running the Enhanced Application

### 1. **Start Backend Server**
```bash
node server/index.js
```

**Expected Output**:
```
🦇 Batman AI Mentor API running on port 5000
🔗 API URL: http://localhost:5000
📊 Health Check: http://localhost:5000/api/health
🎥 Socket.IO enabled for video calls and real-time chat
💳 Stripe integration active for payments
🤖 Gemini AI integration ready for enhanced chat
🦇 Connected to MongoDB - Batman Database Online!
```

### 2. **Start Frontend**
```bash
npm run dev
```

### 3. **Access Application**
- **Main App**: http://localhost:5173
- **API Health**: http://localhost:5000/api/health

---

## 🎯 Feature Testing Guide

### **Test Enhanced AI Chat**
1. Login to the application
2. Go to AI Assistant
3. Ask complex questions like:
   - "How do I become a full-stack developer?"
   - "What's the best way to learn machine learning?"
   - "I'm struggling with motivation, help me"

**Expected**: Much more detailed, contextual, and helpful responses

### **Test Teacher Registration**
1. Click "Become a Teacher" on dashboard
2. Fill out all fields (specializations, rate, bio, experience)
3. Upload sample documents (PDF, images)
4. Submit application
5. Check teacher dashboard for pending status

### **Test Session Booking**
1. Register as both student and teacher (different accounts)
2. Verify teacher account (manually in database if needed)
3. Browse teachers and book a session
4. Complete payment process
5. Join session at scheduled time

### **Test Video Calling**
1. Open session in two different browsers
2. Join as teacher and student
3. Test audio/video controls
4. Test in-session chat
5. Verify connection quality

---

## 🗄 Database Collections

Your MongoDB now includes these new collections:

### **Teachers Collection**
```javascript
{
  userId: ObjectId,
  isVerified: Boolean,
  verificationDocuments: [...],
  specializations: [...],
  hourlyRate: Number,
  rating: Number,
  totalSessions: Number,
  earnings: Number
}
```

### **Sessions Collection**
```javascript
{
  sessionId: String (UUID),
  teacherId: ObjectId,
  studentId: ObjectId,
  scheduledTime: Date,
  duration: Number,
  price: Number,
  status: String,
  paymentStatus: String,
  meetingRoom: { roomId, joinUrl }
}
```

### **Payments Collection**
```javascript
{
  sessionId: ObjectId,
  studentId: ObjectId,
  teacherId: ObjectId,
  amount: Number,
  stripePaymentIntentId: String,
  status: String
}
```

### **Content Collection** (AI Generated)
```javascript
{
  type: String,
  title: String,
  content: String,
  tags: [...],
  createdBy: ObjectId
}
```

---

## 🛡 Security Features

- **JWT Authentication**: Secure user sessions
- **File Upload Validation**: Safe document handling
- **Payment Security**: PCI-compliant via Stripe
- **Input Sanitization**: SQL injection prevention
- **Rate Limiting**: API abuse protection
- **CORS Configuration**: Cross-origin security

---

## 📊 Monitoring & Analytics

### **Teacher Analytics**
- Total earnings
- Session completion rates
- Student ratings
- Popular subjects

### **Student Analytics**
- Learning progress
- Session history
- Payment history
- Favorite teachers

### **Platform Analytics**
- Total users
- Session volume
- Revenue tracking
- Popular subjects

---

## 🎉 Success Metrics

**Your enhanced platform now supports**:
- ✅ **AI-Powered Learning**: Gemini integration for superior chat
- ✅ **Live Video Sessions**: Real-time teacher-student interaction
- ✅ **Monetization**: Teachers can earn money teaching
- ✅ **Quality Assurance**: Certificate verification system
- ✅ **Secure Payments**: Industry-standard payment processing
- ✅ **Scalable Architecture**: Ready for thousands of users
- ✅ **Professional UI**: Batman-themed, mobile-responsive design

---

## 🔧 Troubleshooting

### **Common Issues**:

**Video Call Not Working**:
- Check camera/microphone permissions
- Ensure HTTPS for production (use ngrok for testing)
- Verify firewall settings

**Payment Failures**:
- Verify Stripe API keys
- Check webhook configuration
- Ensure proper SSL certificates

**Gemini AI Not Responding**:
- Verify API key is correct
- Check API quotas and billing
- Fallback responses will work

**File Upload Issues**:
- Check `uploads/` directory exists
- Verify file size limits
- Ensure proper file permissions

---

## 🚀 Production Deployment

### **Environment Variables for Production**:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-atlas-connection
GEMINI_API_KEY=your-production-gemini-key
STRIPE_SECRET_KEY=sk_live_your-live-stripe-key
CLIENT_URL=https://yourdomain.com
```

### **Deployment Checklist**:
- [ ] Set production environment variables
- [ ] Configure SSL certificates
- [ ] Set up MongoDB Atlas
- [ ] Configure Stripe webhooks
- [ ] Set up file storage (AWS S3/CloudFront)
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Set up monitoring (error tracking)
- [ ] Configure backup strategy

---

**🦇 Your Batman AI Mentor platform is now a comprehensive, full-stack learning ecosystem with video calling, payments, AI integration, and teacher marketplace!**

Happy Learning and Teaching! 🚀📚