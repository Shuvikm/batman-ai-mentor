import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Search, Youtube, Newspaper } from 'lucide-react';
import { chatService, searchService } from '../../lib/mongodb';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatAssistantProps {
  user: any;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const result = await chatService.getChatHistory(user.id);
        if (result.success && result.data) {
          const chatMessages = result.data.map((msg: any) => ({
            id: msg.id,
            type: msg.type,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }));
          setMessages(chatMessages);
        } else {
          // Set welcome message if no history
          setMessages([{
            id: '1',
            type: 'assistant',
            content: `Greetings, ${user.username}! I'm your AI learning companion, powered by Wayne Tech's advanced systems. How can I assist your hero training today?`,
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // Fallback welcome message
        setMessages([{
          id: '1',
          type: 'assistant',
          content: `Greetings, ${user.username}! I'm your AI learning companion, powered by Wayne Tech's advanced systems. How can I assist your hero training today?`,
          timestamp: new Date()
        }]);
      }
    };

    loadChatHistory();
  }, [user.id, user.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Save user message to database
    try {
      await chatService.saveMessage(user.id, {
        type: 'user',
        content: currentInput
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Get enhanced AI response from backend with search integration
    try {
      // First try enhanced chat with search
      const aiResult = await chatService.sendEnhancedMessage(currentInput);
      
      if (aiResult.success) {
        const aiResponse: Message = {
          id: aiResult.botMessage?.id || (Date.now() + 1).toString(),
          type: 'assistant',
          content: aiResult.response || 'Sorry, I encountered an error processing your request.',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback to regular chat
        const fallbackResult = await chatService.sendMessage(currentInput);
        
        if (fallbackResult.success) {
          const aiResponse: Message = {
            id: fallbackResult.messageId || (Date.now() + 1).toString(),
            type: 'assistant',
            content: fallbackResult.response || 'Sorry, I encountered an error processing your request.',
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiResponse]);
        } else {
          // Final fallback response
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: generateAIResponse(currentInput),
            timestamp: new Date()
          };

          setMessages(prev => [...prev, aiResponse]);
          
          // Save fallback response
          try {
            await chatService.saveMessage(user.id, {
              type: 'assistant',
              content: aiResponse.content
            });
          } catch (error) {
            console.error('Error saving fallback AI message:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Final fallback response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(currentInput),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (_userInput: string): string => {
    const responses = [
      "That's an excellent question! In the spirit of Batman's methodical approach, let me break this down for you...",
      "Drawing from Wayne Tech's vast knowledge base, here's what I recommend...",
      "Like Batman preparing for any challenge, knowledge is power. Here's what you should know...",
      "Your dedication to learning reminds me of Batman's commitment to justice. Here's my guidance...",
      "Even the Dark Knight had to learn his skills. Let me help you on your journey...",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           " This is a comprehensive response that would address your specific learning needs and provide actionable guidance for your educational journey.";
  };

  // Search handlers
  const handleSearchAction = async (type: 'youtube' | 'news') => {
    if (!inputMessage.trim()) {
      // Show a message asking user to enter a search query
      const emptyQueryMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔍 Please enter a search query in the text box before searching for ${type === 'youtube' ? 'YouTube videos' : 'news articles'}. For example, try typing "python programming" or "machine learning" and then click the search button.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, emptyQueryMessage]);
      return;
    }

    try {
      setIsTyping(true);
      
      // Add a searching message
      const searchingMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🔍 Searching for ${type === 'youtube' ? 'YouTube videos' : 'news articles'} about "${inputMessage}"...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, searchingMessage]);
      
      if (type === 'youtube') {
        const result = await searchService.searchYouTube(inputMessage);
        if (result.success && result.data.videos?.length > 0) {
          setSearchResults((prev: any) => ({ ...prev, youtube: result.data }));
          setShowSearchResults(true);
          
          // Show success message with results
          const successMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `🎥 Found ${result.data.videos.length} YouTube videos about "${inputMessage}". Check the search results section below for clickable links!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          const noResultsMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `🎥 No YouTube videos found for "${inputMessage}". Try a different search term or check if the YouTube API is configured properly.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noResultsMessage]);
        }
      } else if (type === 'news') {
        const result = await searchService.searchNews(inputMessage);
        if (result.success && result.data.articles?.length > 0) {
          setSearchResults((prev: any) => ({ ...prev, news: result.data }));
          setShowSearchResults(true);
          
          // Show success message with results
          const successMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `📰 Found ${result.data.articles.length} news articles about "${inputMessage}". Check the search results section below for clickable links!`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        } else {
          const noResultsMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `📰 No news articles found for "${inputMessage}". Try a different search term or check if the News API is configured properly.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noResultsMessage]);
        }
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      
      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `❌ Sorry, there was an error searching for ${type === 'youtube' ? 'YouTube videos' : 'news articles'}. Please try again later or check your internet connection.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSearchToggle = () => {
    setShowSearchResults(!showSearchResults);
  };

  const quickPrompts = [
    "How do I start learning programming?",
    "What's the best way to study effectively?",
    "Can you create a study schedule for me?",
    "How do I stay motivated while learning?",
    "What career path should I choose?",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="comic-panel p-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-400 p-3 rounded-full">
            <Bot className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">AI Learning Assistant</h2>
            <p className="text-gray-300">Your personal mentor powered by Wayne Tech AI</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="dashboard-card flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-yellow-400' 
                  : 'bg-gray-700'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-black" />
                ) : (
                  <Bot className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.type === 'user'
                  ? 'user-bubble'
                  : 'chat-bubble text-white'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="chat-bubble text-white px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Search Actions */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">Enhanced search:</p>
            <p className="text-xs text-gray-500">Enter query below, then click a search button</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSearchAction('youtube')}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTyping}
              title={!inputMessage.trim() ? "Enter a search query first" : "Search YouTube for educational videos"}
            >
              <Youtube className="w-3 h-3" />
              YouTube Videos
            </button>
            <button
              onClick={() => handleSearchAction('news')}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isTyping}
              title={!inputMessage.trim() ? "Enter a search query first" : "Search for latest news articles"}
            >
              <Newspaper className="w-3 h-3" />
              Latest News
            </button>
            {Object.keys(searchResults).length > 0 && (
              <button
                onClick={() => handleSearchToggle()}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                <Search className="w-3 h-3" />
                {showSearchResults ? 'Hide Results' : 'Show Results'}
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && Object.keys(searchResults).length > 0 && (
          <div className="border-t border-gray-700 bg-gray-800/50 p-4 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-yellow-400 font-semibold flex items-center gap-2">
                <Search className="w-4 h-4" />
                Enhanced Search Results
              </p>
              <button
                onClick={() => setSearchResults({})}
                className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
              >
                Clear Results
              </button>
            </div>
            <div className="space-y-3">
              {searchResults.youtube && searchResults.youtube.videos?.length > 0 && (
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3">
                  <p className="text-sm text-red-400 font-semibold mb-2 flex items-center gap-2">
                    <Youtube className="w-4 h-4" />
                    YouTube Videos ({searchResults.youtube.videos.length} found)
                  </p>
                  {searchResults.youtube.videos.slice(0, 5).map((video: any, index: number) => (
                    <div key={index} className="mb-2 pb-2 border-b border-red-700/20 last:border-b-0">
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-gray-300 hover:text-yellow-400 transition-colors block font-medium"
                      >
                        🎥 {video.title}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">
                        Channel: {video.channel} • <span className="text-red-400">Watch on YouTube</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.news && searchResults.news.articles?.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                  <p className="text-sm text-blue-400 font-semibold mb-2 flex items-center gap-2">
                    <Newspaper className="w-4 h-4" />
                    News Articles ({searchResults.news.articles.length} found)
                  </p>
                  {searchResults.news.articles.slice(0, 5).map((article: any, index: number) => (
                    <div key={index} className="mb-2 pb-2 border-b border-blue-700/20 last:border-b-0">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-gray-300 hover:text-yellow-400 transition-colors block font-medium"
                      >
                        📰 {article.title}
                      </a>
                      <p className="text-xs text-gray-400 mt-1">
                        Source: {article.source} • <span className="text-blue-400">Read Full Article</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Prompts */}
        <div className="border-t border-gray-700 p-4">
          <p className="text-sm text-gray-400 mb-3">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 3).map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(prompt)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about learning..."
              className="batman-input flex-1 px-4 py-3 rounded-lg focus:outline-none"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="batman-button px-6 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;