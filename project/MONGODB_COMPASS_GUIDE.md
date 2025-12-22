# 🦇 Batman AI Mentor - MongoDB Compass Setup Guide

## 📊 Connect MongoDB Compass to Your Project

### Connection Details
- **Connection String**: `mongodb://localhost:27017`
- **Database Name**: `batman-ai-mentor`
- **Host**: `localhost`
- **Port**: `27017`

---

## 🔧 MongoDB Compass Setup Steps

### 1. Open MongoDB Compass
Launch MongoDB Compass application on your system.

### 2. Create New Connection
1. Click "New Connection" 
2. Enter connection string: `mongodb://localhost:27017`
3. Click "Connect"

### 3. Navigate to Batman Database
Once connected, you'll see:
- Database: `batman-ai-mentor`
- Collections created automatically when data is inserted

---

## 📋 Database Collections Overview

### 🧑‍💼 Users Collection
**Collection Name**: `users`
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name",
  "xp": 0,
  "level": 1,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### 🛤 Learning Paths Collection
**Collection Name**: `learningpaths`
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "subject": "Subject Name",
  "goal": "Learning Goal",
  "timeframe": "4 weeks",
  "modules": [
    {
      "title": "Module Title",
      "description": "Module Description",
      "estimatedTime": "2 hours",
      "resources": [...],
      "completed": false
    }
  ],
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### 💬 Chat Messages Collection
**Collection Name**: `chatmessages`
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "message": "User message",
  "response": "AI response",
  "timestamp": ISODate
}
```

### 📝 Quizzes Collection
**Collection Name**: `quizzes`
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "title": "Quiz Title",
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ],
  "createdAt": ISODate
}
```

### 📊 Quiz Results Collection
**Collection Name**: `quizresults`
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "quizId": ObjectId,
  "answers": [0, 1, 2, 3],
  "score": 85,
  "xpEarned": 25,
  "completedAt": ISODate
}
```

---

## 🔍 Useful MongoDB Compass Features

### 1. Data Visualization
- View documents in tree, table, or JSON format
- Filter and sort data easily
- Export data to JSON, CSV, or other formats

### 2. Query Builder
- Create complex queries using the GUI
- Test aggregation pipelines
- Analyze query performance

### 3. Schema Analysis
- View field types and distribution
- Identify indexing opportunities
- Understand data patterns

### 4. Real-time Monitoring
- Watch collection changes in real-time
- Monitor database performance
- Track connection status

---

## 🛠 Common MongoDB Operations

### View All Users
```javascript
// In MongoDB Compass query bar:
{}
```

### Find User by Email
```javascript
{"email": "test@example.com"}
```

### View Learning Paths for User
```javascript
{"userId": ObjectId("your_user_id_here")}
```

### Check Chat History
```javascript
// Sort by timestamp descending
// Sort: {"timestamp": -1}
{}
```

### Quiz Performance Analysis
```javascript
// Find quizzes with score > 80
{"score": {"$gt": 80}}
```

---

## 📈 Database Monitoring

### Important Metrics to Watch
- **Document Count**: Number of records in each collection
- **Storage Size**: Disk space usage
- **Index Usage**: Query performance optimization
- **Connection Count**: Active database connections

### Performance Tips
1. **Indexes**: Compass will suggest indexes for better performance
2. **Query Analysis**: Use the explain feature to understand query execution
3. **Data Validation**: Check for data consistency and integrity
4. **Backup Strategy**: Export important collections regularly

---

## 🚨 Troubleshooting

### Connection Issues
- Ensure MongoDB service is running
- Check firewall settings for port 27017
- Verify localhost connectivity

### Performance Issues
- Monitor slow queries in Compass
- Create appropriate indexes
- Check document size and complexity

### Data Issues
- Use validation rules in Compass
- Monitor for duplicate data
- Check referential integrity between collections

---

## 🎯 Next Steps

1. **Connect Compass**: Use connection string `mongodb://localhost:27017`
2. **Explore Data**: Browse the `batman-ai-mentor` database
3. **Monitor Usage**: Watch how data changes as you use the app
4. **Optimize Performance**: Add indexes as suggested by Compass
5. **Backup Data**: Export collections for data safety

---

*With MongoDB Compass, you now have a powerful visual tool to manage and monitor your Batman AI Mentor database!* 🦇📊