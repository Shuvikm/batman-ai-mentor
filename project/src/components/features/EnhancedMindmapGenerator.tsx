import React, { useState } from 'react';
import { Network, Target, Play, Brain, Youtube, ExternalLink } from 'lucide-react';

interface MindmapGeneratorProps {
  user?: any;
}

interface MindmapData {
  title: string;
  centralNode: string;
  branches: Array<{
    id: string;
    title: string;
    subtopics: string[];
    color: string;
    videos?: Array<{
      title: string;
      url: string;
      channel: string;
      duration: string;
    }>;
  }>;
}

interface YouTubeVideo {
  title: string;
  url: string;
  channel: string;
  duration: string;
  thumbnail: string;
}

const EnhancedMindmapGenerator: React.FC<MindmapGeneratorProps> = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [mindmap, setMindmap] = useState<MindmapData | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingVideos, setIsSearchingVideos] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const predefinedSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Geography', 'Literature', 'Psychology', 'Economics'
  ];

  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600'
  ];

  const generateMindmap = async () => {
    if (!subject.trim()) return;

    setIsGenerating(true);
    
    try {
      // Simulate AI-powered mindmap generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockMindmaps = {
        'mathematics': {
          title: 'Mathematics Learning Path',
          centralNode: 'Mathematics',
          branches: [
            {
              id: '1',
              title: 'Algebra',
              subtopics: ['Linear Equations', 'Quadratic Functions', 'Polynomials', 'Systems of Equations'],
              color: colors[0]
            },
            {
              id: '2',
              title: 'Geometry',
              subtopics: ['Triangles', 'Circles', 'Area & Volume', 'Coordinate Geometry'],
              color: colors[1]
            },
            {
              id: '3',
              title: 'Calculus',
              subtopics: ['Limits', 'Derivatives', 'Integrals', 'Applications'],
              color: colors[2]
            },
            {
              id: '4',
              title: 'Statistics',
              subtopics: ['Probability', 'Data Analysis', 'Distributions', 'Hypothesis Testing'],
              color: colors[3]
            }
          ]
        },
        'physics': {
          title: 'Physics Learning Path',
          centralNode: 'Physics',
          branches: [
            {
              id: '1',
              title: 'Mechanics',
              subtopics: ['Motion', 'Forces', 'Energy', 'Momentum'],
              color: colors[0]
            },
            {
              id: '2',
              title: 'Thermodynamics',
              subtopics: ['Heat', 'Temperature', 'Entropy', 'Gas Laws'],
              color: colors[1]
            },
            {
              id: '3',
              title: 'Electromagnetism',
              subtopics: ['Electric Fields', 'Magnetic Fields', 'Circuits', 'Waves'],
              color: colors[2]
            },
            {
              id: '4',
              title: 'Modern Physics',
              subtopics: ['Quantum Mechanics', 'Relativity', 'Atomic Structure', 'Nuclear Physics'],
              color: colors[3]
            }
          ]
        },
        'computer science': {
          title: 'Computer Science Learning Path',
          centralNode: 'Computer Science',
          branches: [
            {
              id: '1',
              title: 'Programming',
              subtopics: ['Variables & Data Types', 'Control Structures', 'Functions', 'Object-Oriented Programming'],
              color: colors[0]
            },
            {
              id: '2',
              title: 'Data Structures',
              subtopics: ['Arrays', 'Linked Lists', 'Trees', 'Hash Tables'],
              color: colors[1]
            },
            {
              id: '3',
              title: 'Algorithms',
              subtopics: ['Sorting', 'Searching', 'Graph Algorithms', 'Dynamic Programming'],
              color: colors[2]
            },
            {
              id: '4',
              title: 'Web Development',
              subtopics: ['HTML/CSS', 'JavaScript', 'Frameworks', 'Backend Development'],
              color: colors[3]
            }
          ]
        }
      };

      const subjectKey = subject.toLowerCase();
      const generatedMindmap = mockMindmaps[subjectKey as keyof typeof mockMindmaps] || {
        title: `${subject} Learning Path`,
        centralNode: subject,
        branches: [
          {
            id: '1',
            title: 'Fundamentals',
            subtopics: ['Basic Concepts', 'Core Principles', 'Foundation Topics'],
            color: colors[0]
          },
          {
            id: '2',
            title: 'Intermediate Topics',
            subtopics: ['Advanced Concepts', 'Applications', 'Problem Solving'],
            color: colors[1]
          },
          {
            id: '3',
            title: 'Advanced Topics',
            subtopics: ['Complex Theory', 'Research Areas', 'Cutting-edge Topics'],
            color: colors[2]
          },
          {
            id: '4',
            title: 'Practical Applications',
            subtopics: ['Real-world Examples', 'Case Studies', 'Industry Applications'],
            color: colors[3]
          }
        ]
      };

      setMindmap(generatedMindmap);
      
      // Auto-search for videos after generating mindmap
      searchYouTubeVideos(subject);
      
    } catch (error) {
      console.error('Error generating mindmap:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const searchYouTubeVideos = async (searchQuery: string) => {
    setIsSearchingVideos(true);
    
    try {
      // Simulate YouTube API search
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockVideos: YouTubeVideo[] = [
        {
          title: `${searchQuery} - Complete Tutorial for Beginners`,
          url: `https://youtube.com/watch?v=example1`,
          channel: 'Educational Channel',
          duration: '15:30',
          thumbnail: 'https://via.placeholder.com/120x90?text=Video+1'
        },
        {
          title: `Master ${searchQuery} in 30 Minutes`,
          url: `https://youtube.com/watch?v=example2`,
          channel: 'Quick Learning',
          duration: '28:45',
          thumbnail: 'https://via.placeholder.com/120x90?text=Video+2'
        },
        {
          title: `${searchQuery} Explained Simply`,
          url: `https://youtube.com/watch?v=example3`,
          channel: 'Science Made Easy',
          duration: '12:15',
          thumbnail: 'https://via.placeholder.com/120x90?text=Video+3'
        },
        {
          title: `Advanced ${searchQuery} Concepts`,
          url: `https://youtube.com/watch?v=example4`,
          channel: 'Advanced Learning',
          duration: '45:20',
          thumbnail: 'https://via.placeholder.com/120x90?text=Video+4'
        },
        {
          title: `${searchQuery} Practice Problems`,
          url: `https://youtube.com/watch?v=example5`,
          channel: 'Problem Solving Hub',
          duration: '22:10',
          thumbnail: 'https://via.placeholder.com/120x90?text=Video+5'
        }
      ];

      setVideos(mockVideos);
      
    } catch (error) {
      console.error('Error searching videos:', error);
    } finally {
      setIsSearchingVideos(false);
    }
  };

  const BranchNode: React.FC<{ branch: any }> = ({ branch }) => (
    <div 
      className={`relative p-4 rounded-lg bg-gradient-to-r ${branch.color} text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      onClick={() => setSelectedBranch(selectedBranch === branch.id ? null : branch.id)}
    >
      <h4 className="font-bold text-lg mb-2">{branch.title}</h4>
      <div className="space-y-1">
        {branch.subtopics.slice(0, 2).map((subtopic: string, index: number) => (
          <div key={index} className="text-sm opacity-90">• {subtopic}</div>
        ))}
        {branch.subtopics.length > 2 && (
          <div className="text-sm opacity-75">+ {branch.subtopics.length - 2} more topics</div>
        )}
      </div>
      
      {selectedBranch === branch.id && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg z-10 text-gray-800">
          <h5 className="font-semibold mb-2">All Topics:</h5>
          {branch.subtopics.map((subtopic: string, index: number) => (
            <div key={index} className="text-sm py-1 px-2 hover:bg-gray-100 rounded cursor-pointer">
              • {subtopic}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Enhanced Mindmap Generator</h1>
          </div>
          <p className="text-gray-300 text-lg">Generate visual learning paths with integrated YouTube videos</p>
        </div>

        {!mindmap ? (
          <div className="max-w-2xl mx-auto">
            {/* Input Section */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="mr-3" />
                Create Your Learning Mindmap
              </h2>

              {/* Subject Input */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Subject or Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter any subject (e.g., Mathematics, Physics, Programming...)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Quick Subject Selection */}
              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Quick Select
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedSubjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setSubject(subj)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        subject === subj
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="mb-8">
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Difficulty Level
                </label>
                <div className="flex space-x-4">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={difficulty === level}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-gray-300 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateMindmap}
                disabled={!subject.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Mindmap...</span>
                  </>
                ) : (
                  <>
                    <Network className="w-5 h-5" />
                    <span>Generate Learning Mindmap</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Mindmap Display */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">{mindmap.title}</h2>
                <button
                  onClick={() => {
                    setMindmap(null);
                    setVideos([]);
                    setSelectedBranch(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Create New
                </button>
              </div>

              {/* Central Node */}
              <div className="flex justify-center mb-8">
                <div className="p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-center">
                  <h3 className="text-2xl font-bold">{mindmap.centralNode}</h3>
                </div>
              </div>

              {/* Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mindmap.branches.map((branch) => (
                  <BranchNode key={branch.id} branch={branch} />
                ))}
              </div>
            </div>

            {/* YouTube Videos Section */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Youtube className="mr-3 text-red-500" />
                  Related YouTube Videos
                </h2>
                {isSearchingVideos && (
                  <div className="flex items-center text-gray-300">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching videos...
                  </div>
                )}
              </div>

              {videos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-15 bg-red-600 rounded flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                            {video.title}
                          </h4>
                          <p className="text-gray-400 text-xs mb-1">{video.channel}</p>
                          <p className="text-gray-500 text-xs">{video.duration}</p>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Youtube className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No videos found. Try generating a mindmap first.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMindmapGenerator;