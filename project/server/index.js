import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Stripe from 'stripe';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your_razorpay_key_id_here',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret_here',
});

// YouTube API Helper
const searchYouTube = async (query, maxResults = 5) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    if (!API_KEY || API_KEY === 'your_youtube_api_key_here') {
      return { error: 'YouTube API key not configured' };
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      videos: data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }))
    };
  } catch (error) {
    console.error('YouTube search error:', error);
    return { error: 'Failed to search YouTube' };
  }
};

// News API Helper
const searchNews = async (query, pageSize = 5) => {
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    if (!API_KEY || API_KEY === 'your_news_api_key_here') {
      return { error: 'News API key not configured' };
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=relevancy&apiKey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      articles: data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        image: article.urlToImage
      }))
    };
  } catch (error) {
    console.error('News search error:', error);
    return { error: 'Failed to search news' };
  }
};

// Enhanced AI Chat with Search
const getEnhancedAIResponse = async (message, searchTopics = []) => {
  try {
    let enhancedPrompt = `You are Batman AI Mentor, a sophisticated AI assistant focused on education and learning. 
    
User message: "${message}"

Please provide a helpful, educational response. If the user is asking about specific topics, provide comprehensive information.`;

    // Add search results if available
    if (searchTopics.length > 0) {
      enhancedPrompt += `\n\nRelevant search topics to consider: ${searchTopics.join(', ')}`;
      
      // Search for YouTube videos if educational content is requested
      if (message.toLowerCase().includes('video') || message.toLowerCase().includes('tutorial') || message.toLowerCase().includes('learn')) {
        const youtubeResults = await searchYouTube(message);
        if (youtubeResults.videos && youtubeResults.videos.length > 0) {
          enhancedPrompt += `\n\nRelevant YouTube educational videos:\n${youtubeResults.videos.map(v => `- ${v.title} (${v.url})`).join('\n')}`;
        }
      }
      
      // Search for news if current information is requested
      if (message.toLowerCase().includes('news') || message.toLowerCase().includes('current') || message.toLowerCase().includes('latest')) {
        const newsResults = await searchNews(message);
        if (newsResults.articles && newsResults.articles.length > 0) {
          enhancedPrompt += `\n\nRelevant recent news:\n${newsResults.articles.map(a => `- ${a.title} (${a.source})`).join('\n')}`;
        }
      }
    }

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Enhanced AI response error:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
  }
};

// Advanced Quiz Generation for Any Subject
const generateSubjectQuiz = async (subject, difficulty = 'medium', numberOfQuestions = 10) => {
  try {
    const prompt = `Generate a comprehensive ${difficulty} level quiz about "${subject}" with exactly ${numberOfQuestions} questions.

For each question, provide:
1. A clear, well-structured question
2. Four answer options (A, B, C, D)
3. The correct answer
4. A brief explanation of why the answer is correct

Format the response as a JSON object with this structure:
{
  "subject": "${subject}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "question": "Question text here",
      "options": {
        "A": "Option A text",
        "B": "Option B text", 
        "C": "Option C text",
        "D": "Option D text"
      },
      "correctAnswer": "A",
      "explanation": "Explanation text here"
    }
  ]
}

Make sure the questions are educational, accurate, and appropriate for the ${difficulty} difficulty level.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let quizData = response.text();
    
    // Clean up the response to ensure it's valid JSON
    quizData = quizData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(quizData);
  } catch (error) {
    console.error('Quiz generation error:', error);
    // Return a fallback quiz structure
    return {
      subject: subject,
      difficulty: difficulty,
      questions: [{
        question: `What is a fundamental concept in ${subject}?`,
        options: {
          A: "This is a basic concept",
          B: "This is an intermediate concept", 
          C: "This is an advanced concept",
          D: "This is not related to the subject"
        },
        correctAnswer: "A",
        explanation: "This is a basic explanation about the subject."
      }]
    };
  }
};

// Generate Learning Path Mindmap
const generateMindmap = async (subject, learningGoals = []) => {
  try {
    const goalsText = learningGoals.length > 0 ? `with focus on: ${learningGoals.join(', ')}` : '';
    
    const prompt = `Create a comprehensive learning path mindmap for "${subject}" ${goalsText}.

Structure the mindmap as a hierarchical JSON object with the following format:
{
  "title": "${subject} Learning Path",
  "centralNode": "${subject}",
  "branches": [
    {
      "name": "Branch Name",
      "color": "#color-code",
      "subbranches": [
        {
          "name": "Subbranch Name",
          "topics": ["Topic 1", "Topic 2", "Topic 3"],
          "resources": ["Resource 1", "Resource 2"],
          "estimatedTime": "X hours/days"
        }
      ]
    }
  ],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "totalEstimatedTime": "X weeks/months",
  "difficulty": "beginner/intermediate/advanced"
}

Include 5-7 main branches covering:
1. Fundamentals/Basics
2. Core Concepts
3. Practical Applications
4. Advanced Topics
5. Projects/Practice
6. Resources/Tools
7. Career/Next Steps

Make it comprehensive and educational.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let mindmapData = response.text();
    
    // Clean up the response to ensure it's valid JSON
    mindmapData = mindmapData.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(mindmapData);
  } catch (error) {
    console.error('Mindmap generation error:', error);
    // Return a fallback mindmap structure
    return {
      title: `${subject} Learning Path`,
      centralNode: subject,
      branches: [
        {
          name: "Fundamentals",
          color: "#3498db",
          subbranches: [
            {
              name: "Basic Concepts",
              topics: [`Introduction to ${subject}`, "Key Principles", "Core Theory"],
              resources: ["Textbooks", "Online Courses", "Documentation"],
              estimatedTime: "2-4 weeks"
            }
          ]
        },
        {
          name: "Applications",
          color: "#e74c3c", 
          subbranches: [
            {
              name: "Practical Use",
              topics: ["Real-world Examples", "Case Studies", "Hands-on Practice"],
              resources: ["Projects", "Tutorials", "Practice Problems"],
              estimatedTime: "4-6 weeks"
            }
          ]
        }
      ],
      prerequisites: ["Basic understanding of related concepts"],
      totalEstimatedTime: "2-3 months",
      difficulty: "beginner to intermediate"
    };
  }
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/batman-ai-mentor';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('🦇 Connected to MongoDB - Batman Database Online!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// User Schema (Base schema for all user types)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Student specific fields
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  // Teacher specific fields
  specializations: [{
    type: String
  }],
  hourlyRate: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  qualifications: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false // Teachers need admin approval
  },
  // Admin specific fields
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_teachers', 'manage_sessions', 'manage_payments', 'view_analytics']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Booking Session Schema
const bookingSessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  notes: {
    type: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Learning Path Schema
const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  timeAvailable: {
    type: String
  },
  totalEstimatedTime: {
    type: String
  },
  goals: String,
  duration: String,
  prerequisites: [String],
  modules: [{
    id: Number,
    title: String,
    lessons: [String],
    duration: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  steps: [{
    title: String,
    description: String,
    order: Number,
    estimatedTime: String,
    resources: [String],
    completed: {
      type: Boolean,
      default: false
    }
  }],
  mindmapData: {
    type: mongoose.Schema.Types.Mixed // Store the full mindmap JSON
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    id: String,
    question: String,
    options: mongoose.Schema.Types.Mixed, // Can be array or object
    correctAnswer: mongoose.Schema.Types.Mixed, // Can be number or string
    explanation: String
  }],
  isGenerated: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Quiz Result Schema
const quizResultSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeTaken: Number, // in seconds
  answers: [{
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Teacher Schema
const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['certificate', 'degree', 'license', 'id_proof'],
      required: true
    },
    filename: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  specializations: [String],
  hourlyRate: {
    type: Number,
    required: true
  },
  bio: String,
  experience: String,
  rating: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  bankDetails: {
    accountNumber: String,
    routingNumber: String,
    bankName: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});



// Payment Schema
const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay'],
    default: 'stripe'
  },
  // Stripe fields
  stripePaymentIntentId: String,
  // Razorpay fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Content Schema for AI-generated materials
const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lesson', 'quiz', 'image', 'video_script'],
    required: true
  },
  title: String,
  content: String,
  imageUrl: String,
  metadata: mongoose.Schema.Types.Mixed,
  tags: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Models
const User = mongoose.model('User', userSchema);
const LearningPath = mongoose.model('LearningPath', learningPathSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Session = mongoose.model('Session', bookingSessionSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Content = mongoose.model('Content', contentSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'batman-secret-key-wayne-tech-2025';

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed!'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Socket.IO connection handling for video calls and real-time chat
io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);

  // Join a session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    socket.to(sessionId).emit('user-joined', socket.id);
  });

  // Handle video call signaling
  socket.on('offer', (data) => {
    socket.to(data.sessionId).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.sessionId).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.sessionId).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Handle chat messages in sessions
  socket.on('session-message', (data) => {
    socket.to(data.sessionId).emit('session-message', {
      message: data.message,
      from: data.from,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Batman AI Mentor API is running!',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes

// Register Student
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, role = 'student' } = req.body;

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be student, teacher, or admin' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with role
    const user = new User({
      email,
      username,
      password: hashedPassword,
      role,
      // Set default permissions for admins
      permissions: role === 'admin' ? ['manage_users', 'manage_teachers', 'manage_sessions', 'manage_payments', 'view_analytics'] : []
    });

    await user.save();

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return role-specific data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.level = user.level;
      userData.points = user.points;
    } else if (role === 'teacher') {
      userData.specializations = user.specializations;
      userData.isApproved = user.isApproved;
      userData.hourlyRate = user.hourlyRate;
    } else if (role === 'admin') {
      userData.permissions = user.permissions;
    }

    res.status(201).json({
      success: true,
      user: userData,
      token,
      message: role === 'teacher' ? 'Teacher registration successful. Awaiting admin approval.' : 'Registration successful!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Register Teacher (with additional fields)
app.post('/api/auth/register-teacher', async (req, res) => {
  try {
    const { 
      email, 
      username, 
      password, 
      specializations = [], 
      hourlyRate = 0, 
      bio = '', 
      experience = '',
      qualifications = []
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new teacher
    const teacher = new User({
      email,
      username,
      password: hashedPassword,
      role: 'teacher',
      specializations: Array.isArray(specializations) ? specializations : [specializations],
      hourlyRate: parseFloat(hourlyRate) || 0,
      bio,
      experience,
      qualifications: Array.isArray(qualifications) ? qualifications : [qualifications],
      isApproved: false // Teachers need admin approval
    });

    await teacher.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: teacher._id, 
        email: teacher.email, 
        username: teacher.username,
        role: teacher.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: teacher._id,
        email: teacher.email,
        username: teacher.username,
        role: teacher.role,
        specializations: teacher.specializations,
        hourlyRate: teacher.hourlyRate,
        bio: teacher.bio,
        experience: teacher.experience,
        qualifications: teacher.qualifications,
        isApproved: teacher.isApproved,
        isActive: teacher.isActive
      },
      token,
      message: 'Teacher registration successful! Your account is pending admin approval.'
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ success: false, error: 'Teacher registration failed' });
  }
});

// Login (supports all roles)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find user
    const query = { email };
    if (role) {
      query.role = role; // Optional role filter
    }
    
    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ success: false, error: 'Account is deactivated. Please contact admin.' });
    }

    // For teachers, check if approved
    if (user.role === 'teacher' && !user.isApproved) {
      return res.status(400).json({ 
        success: false, 
        error: 'Teacher account pending approval. Please wait for admin approval.' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return role-specific data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    };

    // Add role-specific fields
    if (user.role === 'student') {
      userData.level = user.level;
      userData.points = user.points;
    } else if (user.role === 'teacher') {
      userData.specializations = user.specializations;
      userData.hourlyRate = user.hourlyRate;
      userData.bio = user.bio;
      userData.experience = user.experience;
      userData.qualifications = user.qualifications;
      userData.rating = user.rating;
      userData.totalSessions = user.totalSessions;
      userData.isApproved = user.isApproved;
    } else if (user.role === 'admin') {
      userData.permissions = user.permissions;
    }

    res.json({
      success: true,
      user: userData,
      token,
      redirectTo: `/${user.role}` // Suggest redirect based on role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get current user (updated for roles)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return role-specific data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive
    };

    // Add role-specific fields
    if (user.role === 'student') {
      userData.level = user.level;
      userData.points = user.points;
    } else if (user.role === 'teacher') {
      userData.specializations = user.specializations;
      userData.hourlyRate = user.hourlyRate;
      userData.bio = user.bio;
      userData.experience = user.experience;
      userData.qualifications = user.qualifications;
      userData.rating = user.rating;
      userData.totalSessions = user.totalSessions;
      userData.isApproved = user.isApproved;
    } else if (user.role === 'admin') {
      userData.permissions = user.permissions;
    }

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// Role-based middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, error: 'Access denied: No role found' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `Access denied: Requires ${roles.join(' or ')} role` });
    }
    
    next();
  };
};

// Admin Routes
// Get all pending teacher applications
app.get('/api/admin/teachers/pending', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const pendingTeachers = await User.find({ 
      role: 'teacher', 
      isApproved: false 
    }).select('-password');

    res.json({
      success: true,
      teachers: pendingTeachers,
      count: pendingTeachers.length
    });
  } catch (error) {
    console.error('Get pending teachers error:', error);
    res.status(500).json({ success: false, error: 'Failed to get pending teachers' });
  }
});

// Approve/Reject teacher
app.put('/api/admin/teachers/:teacherId/approve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { approved, reason = '' } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    teacher.isApproved = approved;
    await teacher.save();

    // TODO: Send email notification to teacher
    
    res.json({
      success: true,
      message: `Teacher ${approved ? 'approved' : 'rejected'} successfully`,
      teacher: {
        id: teacher._id,
        username: teacher.username,
        email: teacher.email,
        isApproved: teacher.isApproved
      }
    });
  } catch (error) {
    console.error('Approve teacher error:', error);
    res.status(500).json({ success: false, error: 'Failed to update teacher status' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: skip + users.length < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Get all sessions (admin only)
app.get('/api/admin/sessions', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate('student', 'username email')
      .populate('teacher', 'username email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalSessions = await Session.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSessions / limit),
        totalSessions,
        hasNext: skip + sessions.length < totalSessions,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get sessions' });
  }
});

// Teacher Routes
// Get teacher's own sessions
app.get('/api/teacher/sessions', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const sessions = await Session.find({ teacher: req.user.userId })
      .populate('student', 'username email')
      .sort({ scheduledTime: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Get teacher sessions error:', error);
    res.status(500).json({ success: false, error: 'Failed to get sessions' });
  }
});

// Update teacher profile
app.put('/api/teacher/profile', authenticateToken, requireRole(['teacher']), async (req, res) => {
  try {
    const { specializations, hourlyRate, bio, experience, qualifications } = req.body;
    
    const teacher = await User.findById(req.user.userId);
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher not found' });
    }

    // Update fields if provided
    if (specializations) teacher.specializations = Array.isArray(specializations) ? specializations : [specializations];
    if (hourlyRate !== undefined) teacher.hourlyRate = parseFloat(hourlyRate);
    if (bio !== undefined) teacher.bio = bio;
    if (experience !== undefined) teacher.experience = experience;
    if (qualifications) teacher.qualifications = Array.isArray(qualifications) ? qualifications : [qualifications];
    
    teacher.updatedAt = new Date();
    await teacher.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      teacher: {
        id: teacher._id,
        specializations: teacher.specializations,
        hourlyRate: teacher.hourlyRate,
        bio: teacher.bio,
        experience: teacher.experience,
        qualifications: teacher.qualifications
      }
    });
  } catch (error) {
    console.error('Update teacher profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Learning Path Routes

// Create learning path
app.post('/api/learning-paths', authenticateToken, async (req, res) => {
  try {
    const { topic, level, timeAvailable, goals } = req.body;

    // Generate AI-like learning path structure
    const modules = [
      {
        id: 1,
        title: 'Foundations',
        lessons: [
          `Introduction to ${topic}`,
          'Basic Principles and Concepts',
          'Core Terminology',
          'Getting Started Guide'
        ],
        duration: '2 weeks',
        completed: false
      },
      {
        id: 2,
        title: 'Intermediate Concepts',
        lessons: [
          `Advanced ${topic} Topics`,
          'Practical Applications',
          'Real-world Examples',
          'Best Practices'
        ],
        duration: '3 weeks',
        completed: false
      },
      {
        id: 3,
        title: 'Advanced Mastery',
        lessons: [
          'Expert Techniques',
          'Complex Problem Solving',
          'Industry Standards',
          'Advanced Use Cases'
        ],
        duration: '3 weeks',
        completed: false
      },
      {
        id: 4,
        title: 'Final Project',
        lessons: [
          'Capstone Project Planning',
          'Implementation',
          'Portfolio Creation',
          'Peer Review & Feedback'
        ],
        duration: '2 weeks',
        completed: false
      }
    ];

    const learningPath = new LearningPath({
      userId: req.user.userId,
      topic,
      title: `Master ${topic}`,
      level,
      timeAvailable,
      goals,
      duration: '8-12 weeks',
      modules
    });

    await learningPath.save();

    res.status(201).json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({ success: false, error: 'Failed to create learning path' });
  }
});

// Get user's learning paths
app.get('/api/learning-paths', authenticateToken, async (req, res) => {
  try {
    const learningPaths = await LearningPath.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: learningPaths
    });
  } catch (error) {
    console.error('Get learning paths error:', error);
    res.status(500).json({ success: false, error: 'Failed to get learning paths' });
  }
});

// Generate AI-powered mindmap for learning paths
app.post('/api/learning-paths/mindmap', authenticateToken, async (req, res) => {
  try {
    const { subject, learningGoals, difficulty = 'intermediate' } = req.body;
    
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }

    const mindmapData = await generateMindmap(subject, learningGoals || []);
    
    // Save the mindmap as a learning path
    const learningPath = new LearningPath({
      userId: req.user.userId,
      title: mindmapData.title,
      subject: subject,
      difficulty: difficulty,
      description: `AI-generated mindmap for ${subject}`,
      steps: mindmapData.branches.map((branch, index) => ({
        title: branch.name,
        description: branch.subbranches.map(sub => 
          `${sub.name}: ${sub.topics.join(', ')}`
        ).join('\n'),
        order: index + 1,
        estimatedTime: branch.subbranches[0]?.estimatedTime || '1 week',
        resources: branch.subbranches.flatMap(sub => sub.resources || [])
      })),
      mindmapData: mindmapData,
      totalEstimatedTime: mindmapData.totalEstimatedTime,
      prerequisites: mindmapData.prerequisites,
      isGenerated: true,
      generatedAt: new Date()
    });

    await learningPath.save();

    res.status(201).json({
      success: true,
      data: {
        learningPath: learningPath,
        mindmap: mindmapData
      }
    });
  } catch (error) {
    console.error('Generate mindmap error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate mindmap' });
  }
});

// Get mindmap data for a learning path
app.get('/api/learning-paths/:id/mindmap', authenticateToken, async (req, res) => {
  try {
    const learningPath = await LearningPath.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!learningPath) {
      return res.status(404).json({ success: false, error: 'Learning path not found' });
    }

    res.json({
      success: true,
      data: {
        mindmap: learningPath.mindmapData || null,
        steps: learningPath.steps,
        subject: learningPath.subject
      }
    });
  } catch (error) {
    console.error('Get mindmap error:', error);
    res.status(500).json({ success: false, error: 'Failed to get mindmap' });
  }
});

// Chat Message Routes

// Save chat message
app.post('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const { type, content } = req.body;

    const message = new ChatMessage({
      userId: req.user.userId,
      type,
      content
    });

    await message.save();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({ success: false, error: 'Failed to save message' });
  }
});

// Get chat history
app.get('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const messages = await ChatMessage.find({ userId: req.user.userId })
      .sort({ createdAt: 1 })
      .limit(limit);

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to get messages' });
  }
});

// Enhanced Chat with AI and Search
app.post('/api/chat/enhanced', authenticateToken, async (req, res) => {
  try {
    const { message, searchTopics } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // Use provided search topics or default ones
    const topics = searchTopics || process.env.CHATBOT_DEFAULT_SEARCH_TOPICS?.split(',') || [];
    
    // Get enhanced AI response with search integration
    const aiResponse = await getEnhancedAIResponse(message, topics);
    
    // Save user message
    const userMessage = new ChatMessage({
      userId: req.user.userId,
      type: 'user',
      content: message
    });
    await userMessage.save();

    // Save AI response
    const botMessage = new ChatMessage({
      userId: req.user.userId,
      type: 'bot',
      content: aiResponse
    });
    await botMessage.save();

    res.json({
      success: true,
      data: {
        userMessage,
        botResponse: botMessage,
        response: aiResponse
      }
    });
  } catch (error) {
    console.error('Enhanced chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to process enhanced chat' });
  }
});

// YouTube Search API
app.get('/api/search/youtube', authenticateToken, async (req, res) => {
  try {
    const { q: query, maxResults = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const results = await searchYouTube(query, Math.min(maxResults, 25));
    
    if (results.error) {
      return res.status(400).json({ success: false, error: results.error });
    }

    res.json({
      success: true,
      data: {
        query,
        videos: results.videos,
        count: results.videos.length
      }
    });
  } catch (error) {
    console.error('YouTube search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search YouTube' });
  }
});

// News Search API
app.get('/api/search/news', authenticateToken, async (req, res) => {
  try {
    const { q: query, pageSize = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const results = await searchNews(query, Math.min(pageSize, 20));
    
    if (results.error) {
      return res.status(400).json({ success: false, error: results.error });
    }

    res.json({
      success: true,
      data: {
        query,
        articles: results.articles,
        count: results.articles.length
      }
    });
  } catch (error) {
    console.error('News search error:', error);
    res.status(500).json({ success: false, error: 'Failed to search news' });
  }
});

// Get chatbot search configuration
app.get('/api/chat/search-config', authenticateToken, async (req, res) => {
  try {
    const config = {
      searchEnabled: process.env.CHATBOT_SEARCH_ENABLED === 'true',
      defaultTopics: process.env.CHATBOT_DEFAULT_SEARCH_TOPICS?.split(',') || [],
      maxResults: parseInt(process.env.CHATBOT_MAX_SEARCH_RESULTS) || 10,
      availableApis: {
        youtube: !!process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'your_youtube_api_key_here',
        news: !!process.env.NEWS_API_KEY && process.env.NEWS_API_KEY !== 'your_news_api_key_here'
      }
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Get search config error:', error);
    res.status(500).json({ success: false, error: 'Failed to get search configuration' });
  }
});

// Quiz Routes

// Generate quiz for any subject using AI
app.post('/api/quizzes/generate', authenticateToken, async (req, res) => {
  try {
    const { subject, difficulty = 'medium', numberOfQuestions = 10 } = req.body;
    
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }

    const generatedQuiz = await generateSubjectQuiz(subject, difficulty, numberOfQuestions);
    
    // Save the generated quiz to database
    const quiz = new Quiz({
      userId: req.user.userId,
      title: `${subject} Quiz - ${difficulty} Level`,
      subject: subject,
      difficulty: difficulty,
      questions: generatedQuiz.questions,
      isGenerated: true,
      generatedAt: new Date()
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      data: {
        quiz: quiz,
        generatedContent: generatedQuiz
      }
    });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate quiz' });
  }
});

// Get available quiz subjects and statistics
app.get('/api/quizzes/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await Quiz.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { 
        _id: '$subject', 
        count: { $sum: 1 },
        averageDifficulty: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
            { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
            { case: { $eq: ['$difficulty', 'hard'] }, then: 3 }
          ],
          default: 2
        }}}
      }},
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        subjects: subjects,
        totalQuizzes: subjects.reduce((sum, s) => sum + s.count, 0)
      }
    });
  } catch (error) {
    console.error('Get quiz subjects error:', error);
    res.status(500).json({ success: false, error: 'Failed to get quiz subjects' });
  }
});

// Create quiz
app.post('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const { title, questions } = req.body;

    const quiz = new Quiz({
      userId: req.user.userId,
      title,
      questions
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, error: 'Failed to create quiz' });
  }
});

// Get user's quizzes
app.get('/api/quizzes', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get quizzes' });
  }
});

// Submit quiz result
app.post('/api/quiz-results', authenticateToken, async (req, res) => {
  try {
    const { quizId, score, totalQuestions, timeTaken, answers } = req.body;

    const quizResult = new QuizResult({
      quizId,
      userId: req.user.userId,
      score,
      totalQuestions,
      timeTaken,
      answers
    });

    await quizResult.save();

    // Award points to user
    const pointsEarned = Math.floor((score / totalQuestions) * 100);
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { points: pointsEarned }
    });

    res.status(201).json({
      success: true,
      data: quizResult,
      pointsEarned
    });
  } catch (error) {
    console.error('Submit quiz result error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit quiz result' });
  }
});

// Enhanced AI Assistant with Gemini Integration
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { message, includeImage } = req.body;
    
    // Enhanced Batman-themed prompt for better responses
    const batmanPrompt = `You are the Batman AI Mentor, an advanced educational assistant created by Wayne Tech. You have the wisdom of Batman and the knowledge of the world's greatest educators. 

Your personality traits:
- Wise and strategic like Batman
- Encouraging yet realistic
- Focused on practical learning outcomes
- Uses analogies related to training and preparation
- Mentions Wayne Tech, Gotham Academy, or Batman references naturally

User question: "${message}"

Provide a helpful, accurate, and engaging response that would make Batman proud. Focus on actionable advice and learning strategies.`;

    let aiResponse;
    
    try {
      // Use Gemini AI for more accurate responses
      const result = await model.generateContent(batmanPrompt);
      const response = await result.response;
      aiResponse = response.text();
      
      // Ensure response maintains Batman character
      if (!aiResponse.includes('🦇') && Math.random() > 0.5) {
        aiResponse = '🦇 ' + aiResponse;
      }
      
    } catch (geminiError) {
      console.log('Gemini API error, using enhanced fallback:', geminiError.message);
      
      // Enhanced fallback responses with more variety
      const fallbackResponses = {
        learn: [
          "🦇 Learning is like mastering the martial arts - it requires discipline, practice, and patience. Wayne Tech's research shows that consistent daily practice beats cramming every time.",
          "Every expert was once a beginner. Even Batman started with basic training. Focus on fundamentals first, then advance to more complex skills.",
          "🦇 The best learning happens when you're challenged but not overwhelmed. Start with your comfort zone, then gradually expand it."
        ],
        career: [
          "🦇 A career is like Batman's mission - it needs purpose, planning, and continuous skill development. What drives your passion?",
          "Consider what problems you want to solve in the world. The best careers align your skills with meaningful impact.",
          "🦇 Wayne Tech always looks for people who can adapt and grow. Focus on building transferable skills and staying curious."
        ],
        study: [
          "🦇 Effective studying is like Batman's training regimen - structured, consistent, and purposeful. Break large topics into manageable segments.",
          "Use the Feynman Technique: if you can't explain it simply, you don't understand it well enough. Teach others what you learn.",
          "🦇 Create a study environment as focused as the Batcave - eliminate distractions and have all your tools ready."
        ],
        motivation: [
          "🦇 Remember: Batman became a symbol of hope through perseverance. Your learning journey may be challenging, but every step makes you stronger.",
          "Progress isn't always visible day by day, but it compounds over time. Trust the process and celebrate small victories.",
          "🦇 Even the Dark Knight had mentors and allies. Don't hesitate to seek help and learn from others' experiences."
        ],
        default: [
          "🦇 That's an excellent question! Let me analyze this with Wayne Tech's resources and provide you with a strategic approach.",
          "Interesting challenge! Batman always says 'preparation is key.' Let's break this down systematically.",
          "🦇 Based on Wayne Tech's educational database, here's what I recommend for your specific situation..."
        ]
      };
      
      const messageWords = message.toLowerCase();
      let responseCategory = 'default';
      
      if (messageWords.includes('learn') || messageWords.includes('learning')) responseCategory = 'learn';
      else if (messageWords.includes('career') || messageWords.includes('job')) responseCategory = 'career';
      else if (messageWords.includes('study') || messageWords.includes('studying')) responseCategory = 'study';
      else if (messageWords.includes('motivat') || messageWords.includes('discourag')) responseCategory = 'motivation';
      
      const responses = fallbackResponses[responseCategory];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Add contextual follow-up
      aiResponse += "\n\nWhat specific aspect would you like me to elaborate on? I'm here to help you succeed! 🚀";
    }

    // Save both user message and AI response
    const userMessage = new ChatMessage({
      userId: req.user.userId,
      type: 'user',
      content: message
    });
    await userMessage.save();

    const assistantMessage = new ChatMessage({
      userId: req.user.userId,
      type: 'assistant',
      content: aiResponse
    });
    await assistantMessage.save();

    res.json({
      success: true,
      response: aiResponse,
      messageId: assistantMessage._id,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI assistant temporarily unavailable. Wayne Tech is working on it!' 
    });
  }
});

// Generate Educational Content with AI
app.post('/api/ai/generate-content', authenticateToken, async (req, res) => {
  try {
    const { type, topic, difficulty, length } = req.body;
    
    let prompt = `Create ${type} content about "${topic}" for ${difficulty} level learners. `;
    
    if (type === 'lesson') {
      prompt += `Create a comprehensive lesson plan with objectives, key concepts, examples, and practice exercises. Length: ${length || 'medium'} length.`;
    } else if (type === 'quiz') {
      prompt += `Generate 10 multiple-choice questions with explanations. Vary the difficulty appropriately.`;
    } else if (type === 'image_description') {
      prompt += `Describe an educational image or diagram that would help explain this topic visually.`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Save generated content
    const newContent = new Content({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${topic}`,
      content,
      tags: [topic, difficulty, type],
      createdBy: req.user.userId
    });
    await newContent.save();
    
    res.json({
      success: true,
      content,
      contentId: newContent._id
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ success: false, error: 'Content generation failed' });
  }
});

// Teacher Registration and Verification
app.post('/api/teachers/register', authenticateToken, upload.array('documents', 5), async (req, res) => {
  try {
    const { specializations, hourlyRate, bio, experience } = req.body;
    
    // Check if user is already a teacher
    const existingTeacher = await Teacher.findOne({ userId: req.user.userId });
    if (existingTeacher) {
      return res.status(400).json({ success: false, error: 'Already registered as teacher' });
    }
    
    const documents = req.files.map(file => ({
      type: 'certificate', // You can enhance this to detect document type
      filename: file.filename,
      uploadDate: new Date(),
      status: 'pending'
    }));
    
    const teacher = new Teacher({
      userId: req.user.userId,
      specializations: specializations.split(',').map(s => s.trim()),
      hourlyRate: parseFloat(hourlyRate),
      bio,
      experience,
      verificationDocuments: documents
    });
    
    await teacher.save();
    
    // Send notification email to admin for verification
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'New Teacher Registration - Batman AI Mentor',
        html: `
          <h2>New Teacher Registration</h2>
          <p><strong>Teacher ID:</strong> ${teacher._id}</p>
          <p><strong>Specializations:</strong> ${specializations}</p>
          <p><strong>Hourly Rate:</strong> $${hourlyRate}</p>
          <p><strong>Documents Uploaded:</strong> ${documents.length}</p>
          <p>Please review and verify the teacher's credentials.</p>
        `
      });
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }
    
    res.json({
      success: true,
      message: 'Teacher registration submitted. Verification pending.',
      teacherId: teacher._id
    });
  } catch (error) {
    console.error('Teacher registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Get Teacher Profile
app.get('/api/teachers/profile', authenticateToken, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.userId })
      .populate('userId', 'username email');
    
    if (!teacher) {
      return res.status(404).json({ success: false, error: 'Teacher profile not found' });
    }
    
    res.json({ success: true, teacher });
  } catch (error) {
    console.error('Get teacher profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Search Available Teachers
app.get('/api/teachers/search', authenticateToken, async (req, res) => {
  try {
    const { subject, minRating, maxRate } = req.query;
    
    let query = { isVerified: true };
    
    if (subject) {
      query.specializations = { $in: [new RegExp(subject, 'i')] };
    }
    
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) };
    }
    
    const teachers = await Teacher.find(query)
      .populate('userId', 'username')
      .select('-bankDetails -verificationDocuments')
      .sort({ rating: -1, totalSessions: -1 });
    
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('Teacher search error:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Book a Session
app.post('/api/sessions/book', authenticateToken, async (req, res) => {
  try {
    const { teacherId, subject, scheduledTime, duration } = req.body;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher || !teacher.isVerified) {
      return res.status(400).json({ success: false, error: 'Teacher not available' });
    }
    
    const price = teacher.hourlyRate * (duration / 60);
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        teacherId: teacherId.toString(),
        studentId: req.user.userId.toString(),
        subject
      }
    });
    
    const session = new Session({
      teacherId,
      studentId: req.user.userId,
      subject,
      scheduledTime: new Date(scheduledTime),
      duration,
      price,
      paymentIntentId: paymentIntent.id,
      meetingRoom: {
        roomId: uuidv4(),
        joinUrl: `${process.env.CLIENT_URL}/session/${uuidv4()}`
      }
    });
    
    await session.save();
    
    res.json({
      success: true,
      session,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Session booking error:', error);
    res.status(500).json({ success: false, error: 'Booking failed' });
  }
});

// Get User Sessions
app.get('/api/sessions/my-sessions', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query; // 'student' or 'teacher'
    
    let query = {};
    if (type === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.userId });
      if (!teacher) {
        return res.status(404).json({ success: false, error: 'Teacher profile not found' });
      }
      query.teacherId = teacher._id;
    } else {
      query.studentId = req.user.userId;
    }
    
    const sessions = await Session.find(query)
      .populate('teacherId', 'userId specializations rating')
      .populate('studentId', 'username email')
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'username email'
        }
      })
      .sort({ scheduledTime: -1 });
    
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// Join Session (for video calling)
app.get('/api/sessions/:sessionId/join', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await Session.findById(sessionId)
      .populate('teacherId', 'userId')
      .populate('studentId', 'username');
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    // Check if user is authorized to join
    const teacher = await Teacher.findById(session.teacherId);
    const isTeacher = teacher && teacher.userId.toString() === req.user.userId;
    const isStudent = session.studentId._id.toString() === req.user.userId;
    
    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, error: 'Not authorized to join this session' });
    }
    
    // Update session status if starting
    if (session.status === 'scheduled') {
      session.status = 'in_progress';
      await session.save();
    }
    
    res.json({
      success: true,
      session: {
        id: session._id,
        roomId: session.meetingRoom.roomId,
        subject: session.subject,
        duration: session.duration,
        isTeacher,
        isStudent,
        participantName: isTeacher ? teacher.userId.username : session.studentId.username
      }
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ success: false, error: 'Failed to join session' });
  }
});

// Payment Confirmation Webhook
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Update session payment status
    const session = await Session.findOne({ paymentIntentId: paymentIntent.id });
    if (session) {
      session.paymentStatus = 'paid';
      await session.save();
      
      // Create payment record
      const payment = new Payment({
        sessionId: session._id,
        studentId: session.studentId,
        teacherId: session.teacherId,
        amount: paymentIntent.amount / 100,
        stripePaymentIntentId: paymentIntent.id,
        status: 'succeeded'
      });
      await payment.save();
      
      // Update teacher earnings
      const teacher = await Teacher.findById(session.teacherId);
      if (teacher) {
        teacher.earnings += session.price;
        teacher.totalSessions += 1;
        await teacher.save();
      }
    }
  }
  
  res.json({received: true});
});

// Razorpay Payment Routes

// Create Razorpay order
app.post('/api/payments/razorpay/create-order', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'INR', sessionId, notes = {} } = req.body;

    if (!amount || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and session ID are required' 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `session_${sessionId}_${Date.now()}`,
      notes: {
        sessionId: sessionId,
        userId: req.user.userId,
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    // Update session with Razorpay order ID
    await Session.findByIdAndUpdate(sessionId, {
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay'
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create Razorpay order' 
    });
  }
});

// Verify Razorpay payment
app.post('/api/payments/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      sessionId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature' 
      });
    }

    // Update session and payment status
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    session.paymentStatus = 'paid';
    session.razorpayPaymentId = razorpay_payment_id;
    session.paymentVerifiedAt = new Date();
    await session.save();

    // Create payment record
    const payment = new Payment({
      sessionId: sessionId,
      userId: req.user.userId,
      teacherId: session.teacherId,
      amount: session.price,
      currency: 'INR',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'succeeded'
    });
    await payment.save();

    // Update teacher earnings
    const teacher = await Teacher.findById(session.teacherId);
    if (teacher) {
      teacher.earnings += session.price;
      teacher.totalSessions += 1;
      await teacher.save();
    }

    res.json({
      success: true,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        sessionId: sessionId
      }
    });
  } catch (error) {
    console.error('Razorpay verify payment error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment' 
    });
  }
});

// Get payment methods available
app.get('/api/payments/methods', authenticateToken, async (req, res) => {
  try {
    const availableMethods = {
      stripe: {
        available: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here'),
        currencies: ['USD', 'EUR', 'GBP']
      },
      razorpay: {
        available: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id_here'),
        currencies: ['INR']
      }
    };

    res.json({
      success: true,
      data: availableMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get payment methods' 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`🦇 Batman AI Mentor API running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎥 Socket.IO enabled for video calls and real-time chat`);
  console.log(`💳 Stripe integration active for payments`);
  console.log(`🤖 Gemini AI integration ready for enhanced chat`);
});

export default app;