import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Star, Clock, Filter, Book, FileText, Video, Globe } from 'lucide-react';

interface StudyMaterial {
  id: string;
  title: string;
  type: 'book' | 'article' | 'video' | 'course';
  description: string;
  rating: number;
  duration?: string;
  source: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface StudyMaterialsProps {
  user: any;
}

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'book' | 'article' | 'video' | 'course'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockMaterials: StudyMaterial[] = [
        {
          id: '1',
          title: `Complete Guide to ${searchQuery}`,
          type: 'book',
          description: 'Comprehensive textbook covering all fundamental concepts and advanced topics.',
          rating: 4.8,
          source: 'Academic Publisher',
          url: '#',
          difficulty: 'intermediate'
        },
        {
          id: '2',
          title: `${searchQuery} Tutorial Series`,
          type: 'video',
          description: 'Step-by-step video tutorials for beginners to advanced learners.',
          rating: 4.6,
          duration: '12 hours',
          source: 'YouTube Education',
          url: '#',
          difficulty: 'beginner'
        },
        {
          id: '3',
          title: `Advanced ${searchQuery} Concepts`,
          type: 'article',
          description: 'In-depth articles exploring complex theories and practical applications.',
          rating: 4.7,
          duration: '45 min read',
          source: 'Tech Journal',
          url: '#',
          difficulty: 'advanced'
        },
        {
          id: '4',
          title: `Professional ${searchQuery} Course`,
          type: 'course',
          description: 'Industry-standard course with hands-on projects and certification.',
          rating: 4.9,
          duration: '8 weeks',
          source: 'Online University',
          url: '#',
          difficulty: 'intermediate'
        }
      ];
      
      setMaterials(mockMaterials);
      setIsSearching(false);
    }, 1500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'course': return <Globe className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'book': return 'text-blue-400';
      case 'article': return 'text-green-400';
      case 'video': return 'text-red-400';
      case 'course': return 'text-purple-400';
      default: return 'text-yellow-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const typeMatch = selectedFilter === 'all' || material.type === selectedFilter;
    const difficultyMatch = difficultyFilter === 'all' || material.difficulty === difficultyFilter;
    return typeMatch && difficultyMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="comic-panel p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-400 p-3 rounded-full">
            <BookOpen className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Study Materials</h2>
            <p className="text-gray-300">Access Wayne Tech's vast library of learning resources</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="dashboard-card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="batman-input w-full pl-12 pr-4 py-3 rounded-lg"
                placeholder="Search for books, articles, videos, courses..."
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            className="batman-button px-8 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                <span>Searching...</span>
              </div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Filters */}
        {materials.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Type:</span>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="batman-input px-3 py-1 rounded text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="book">Books</option>
                  <option value="article">Articles</option>
                  <option value="video">Videos</option>
                  <option value="course">Courses</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Difficulty:</span>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value as any)}
                  className="batman-input px-3 py-1 rounded text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {filteredMaterials.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">
            Found {filteredMaterials.length} resource{filteredMaterials.length !== 1 ? 's' : ''} for "{searchQuery}"
          </h3>
          
          <div className="grid gap-6">
            {filteredMaterials.map((material) => (
              <div key={material.id} className="dashboard-card p-6 hover:scale-[1.02] transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-gray-800 ${getTypeColor(material.type)}`}>
                      {getTypeIcon(material.type)}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{material.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span className="capitalize">{material.type}</span>
                        <span>•</span>
                        <span>{material.source}</span>
                        <span>•</span>
                        <span className={getDifficultyColor(material.difficulty)}>
                          {material.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 font-medium">{material.rating}</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{material.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    {material.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{material.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button className="text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors">
                      Save for Later
                    </button>
                    <button className="batman-button px-4 py-2 rounded font-medium text-sm flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Access Resource</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="dashboard-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No results found</h3>
          <p className="text-gray-500">
            Try a different search term or check your spelling.
          </p>
        </div>
      ) : (
        <div className="dashboard-card p-12 text-center">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Ready to Find Learning Materials</h3>
          <p className="text-gray-500">
            Enter a topic to search for books, articles, videos, and courses from trusted sources.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;