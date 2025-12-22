import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Search, Youtube, Newspaper } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatAssistantProps {
  user: any;
}

const ImprovedChatAssistant: React.FC<ChatAssistantProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your personal AI learning assistant. I can help you with:

• **Study Questions** - Ask me anything about any subject
• **Explanations** - Get detailed explanations of complex topics
• **Study Tips** - Personalized learning strategies
• **Research Help** - Find relevant resources and materials
• **Practice Problems** - Generate questions to test your knowledge

What would you like to learn about today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({});
  const [showSearchResults, setShowSearchResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Explain quantum physics in simple terms",
    "Help me understand calculus derivatives",
    "What are the causes of World War 2?",
    "How does photosynthesis work?",
    "Explain machine learning basics",
    "What is the periodic table?",
    "Help me with essay writing",
    "Explain the water cycle"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple AI responses based on keywords
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm excited to help you learn today. What subject or topic interests you most right now?`;
    }
    
    if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      return `Great choice! Mathematics is fundamental to understanding our world. Here are some key tips for mastering math:

🧮 **Start with the basics** - Ensure you understand fundamental concepts
📝 **Practice regularly** - Consistency is key in mathematics
🔍 **Understand, don't memorize** - Focus on why formulas work
📊 **Use visual aids** - Graphs and diagrams can make concepts clearer
🤝 **Work through examples** - Step-by-step problem solving builds confidence

What specific math topic would you like to explore?`;
    }
    
    if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology')) {
      return `Science is amazing! It helps us understand everything from the smallest atoms to the vast universe. Here's how to excel in science:

🔬 **Observe and question** - Science starts with curiosity
🧪 **Hands-on learning** - Experiments make concepts memorable  
📚 **Connect concepts** - See how different areas of science relate
🌟 **Real-world applications** - Understand how science impacts daily life
📝 **Take good notes** - Document observations and explanations

Which scientific field interests you most?`;
    }
    
    if (lowerMessage.includes('history') || lowerMessage.includes('war') || lowerMessage.includes('ancient')) {
      return `History helps us understand our world today! Here's how to make history engaging:

📖 **Stories, not dates** - Focus on the human stories behind events
🗺️ **Use timelines** - Visualize the sequence of events
🔍 **Ask "why"** - Understand causes and consequences
🎭 **Role-playing** - Imagine yourself in historical situations
📺 **Multiple sources** - Get different perspectives on events

What historical period or event would you like to explore?`;
    }
    
    if (lowerMessage.includes('writing') || lowerMessage.includes('essay') || lowerMessage.includes('english')) {
      return `Writing is a powerful skill! Here are proven strategies to improve your writing:

✍️ **Start with an outline** - Organize your thoughts first
📝 **Write drafts** - Don't aim for perfection immediately
🎯 **Clear thesis statement** - Make your main point obvious
📚 **Support with evidence** - Back up your arguments
✂️ **Edit ruthlessly** - Remove unnecessary words
👥 **Get feedback** - Fresh eyes catch what you miss

What type of writing are you working on?`;
    }
    
    if (lowerMessage.includes('study') || lowerMessage.includes('tips') || lowerMessage.includes('learn')) {
      return `Here are my top study strategies that really work:

🎯 **Active recall** - Test yourself instead of just re-reading
📅 **Spaced repetition** - Review material at increasing intervals
🍅 **Pomodoro technique** - 25 minutes focused study, 5 minute break
📝 **Teach others** - Explaining concepts solidifies your understanding
🎨 **Multiple senses** - Use visual, auditory, and kinesthetic learning
💤 **Get enough sleep** - Your brain consolidates memories during sleep
🏃 **Exercise regularly** - Physical activity boosts cognitive function

What subject are you currently studying?`;
    }
    
    // Default response
    return `That's a great question! I'd love to help you explore this topic further. Here's what I suggest:

💡 **Break it down** - Let's tackle this step by step
🔍 **Gather information** - I can help you find reliable sources
📚 **Understand the basics** - We'll start with fundamental concepts
🎯 **Apply knowledge** - Practice with real examples
✅ **Test understanding** - Quiz yourself to ensure retention

Would you like me to explain any specific aspect of "${userMessage}" in more detail?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateAIResponse(inputMessage.trim()),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleSearchAction = async (type: 'youtube' | 'news') => {
    if (!inputMessage.trim()) return;

    setIsTyping(true);
    
    // Simulate search results
    setTimeout(() => {
      const mockResults = {
        youtube: {
          videos: [
            {
              title: `Learn ${inputMessage} - Complete Guide`,
              url: `https://youtube.com/watch?v=example1`,
              channel: 'Educational Channel'
            },
            {
              title: `${inputMessage} Explained Simply`,
              url: `https://youtube.com/watch?v=example2`,
              channel: 'Science Made Easy'
            },
            {
              title: `Master ${inputMessage} in 20 Minutes`,
              url: `https://youtube.com/watch?v=example3`,
              channel: 'Quick Learning'
            }
          ]
        },
        news: {
          articles: [
            {
              title: `Latest Research on ${inputMessage}`,
              url: `https://example.com/article1`,
              source: 'Educational News'
            },
            {
              title: `New Developments in ${inputMessage}`,
              url: `https://example.com/article2`,
              source: 'Science Daily'
            }
          ]
        }
      };

      setSearchResults((prev: any) => ({
        ...prev,
        [type]: mockResults[type]
      }));
      setShowSearchResults(true);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/30 border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Learning Assistant</h2>
            <p className="text-sm text-gray-300">Your personal study companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`p-4 rounded-lg ${message.sender === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-gray-800/50 border border-gray-700/50'}`}>
                <div className="text-white whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="p-2 rounded-lg bg-purple-600">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Search Results */}
      {showSearchResults && Object.keys(searchResults).length > 0 && (
        <div className="border-t border-gray-700 bg-gray-800/50 p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-yellow-400 font-semibold flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Results
            </p>
            <button
              onClick={() => {
                setSearchResults({});
                setShowSearchResults(false);
              }}
              className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
            >
              Clear Results
            </button>
          </div>
          
          {searchResults.youtube && (
            <div className="mb-3">
              <p className="text-sm text-red-400 font-semibold mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube Videos
              </p>
              {searchResults.youtube.videos?.map((video: any, index: number) => (
                <div key={index} className="mb-1">
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    🎥 {video.title}
                  </a>
                </div>
              ))}
            </div>
          )}

          {searchResults.news && (
            <div>
              <p className="text-sm text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                News Articles
              </p>
              {searchResults.news.articles?.map((article: any, index: number) => (
                <div key={index} className="mb-1">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    📰 {article.title}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Search Controls */}
      <div className="border-t border-gray-700 bg-black/20 p-4">
        <div className="mb-3">
          <p className="text-sm text-gray-400 mb-2">Enhanced search:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleSearchAction('youtube')}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1 disabled:opacity-50"
              disabled={isTyping || !inputMessage.trim()}
            >
              <Youtube className="w-3 h-3" />
              YouTube
            </button>
            <button
              onClick={() => handleSearchAction('news')}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1 disabled:opacity-50"
              disabled={isTyping || !inputMessage.trim()}
            >
              <Newspaper className="w-3 h-3" />
              News
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Quick topics:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 4).map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(prompt)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
                disabled={isTyping}
              >
                {prompt.length > 25 ? prompt.substring(0, 25) + '...' : prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask me anything about learning..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:from-blue-600 hover:to-purple-600"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedChatAssistant;