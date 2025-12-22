import React, { useState } from 'react';
import { Network, Target, Clock, ChevronRight, Plus } from 'lucide-react';

interface MindmapGeneratorProps {
  user?: any;
}

interface MindmapData {
  title: string;
  centralNode: string;
  branches: Array<{
    name: string;
    color: string;
    subbranches: Array<{
      name: string;
      topics: string[];
      resources: string[];
      estimatedTime: string;
    }>;
  }>;
  prerequisites: string[];
  totalEstimatedTime: string;
  difficulty: string;
}

const MindmapGenerator: React.FC<MindmapGeneratorProps> = () => {
  const [subject, setSubject] = useState('');
  const [learningGoals, setLearningGoals] = useState<string[]>(['']);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMindmap, setGeneratedMindmap] = useState<MindmapData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'text-green-400' },
    { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-400' },
    { value: 'advanced', label: 'Advanced', color: 'text-red-400' }
  ];

  const popularSubjects = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'Mobile App Development',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Cloud Computing',
    'Blockchain',
    'Digital Marketing'
  ];

  const addLearningGoal = () => {
    setLearningGoals([...learningGoals, '']);
  };

  const updateLearningGoal = (index: number, value: string) => {
    const updated = [...learningGoals];
    updated[index] = value;
    setLearningGoals(updated);
  };

  const removeLearningGoal = (index: number) => {
    if (learningGoals.length > 1) {
      setLearningGoals(learningGoals.filter((_, i) => i !== index));
    }
  };

  const generateMindmap = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject for the mindmap');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('http://localhost:5000/api/learning-paths/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          learningGoals: learningGoals.filter(goal => goal.trim()),
          difficulty
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedMindmap(result.data.mindmap);
        setShowDetails(false);
      } else {
        throw new Error(result.error || 'Failed to generate mindmap');
      }
    } catch (error) {
      console.error('Mindmap generation error:', error);
      alert('Failed to generate mindmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const BranchNode: React.FC<{ branch: any; index: number }> = ({ branch }) => (
    <div className="relative">
      <div 
        className={`p-4 rounded-lg border-2 bg-gray-800/50 backdrop-blur-sm transform hover:scale-105 transition-all duration-300`}
        style={{ borderColor: branch.color }}
      >
        <h4 className="font-bold text-white mb-2 flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: branch.color }}
          ></div>
          {branch.name}
        </h4>
        
        <div className="space-y-2">
          {branch.subbranches.map((subbranch: any, subIndex: number) => (
            <div key={subIndex} className="bg-gray-900/50 p-3 rounded">
              <h5 className="text-sm font-semibold text-gray-200 mb-1">{subbranch.name}</h5>
              <div className="text-xs text-gray-400 space-y-1">
                <div>
                  <span className="font-medium">Topics:</span> {subbranch.topics.slice(0, 2).join(', ')}
                  {subbranch.topics.length > 2 && '...'}
                </div>
                <div className="flex items-center text-yellow-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {subbranch.estimatedTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Connection line to center */}
      <div 
        className="absolute top-1/2 left-0 w-8 h-0.5 bg-gray-600 transform -translate-y-1/2 -translate-x-8"
        style={{ backgroundColor: branch.color, opacity: 0.5 }}
      ></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="comic-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500 p-3 rounded-full">
            <Network className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">AI Learning Path Mindmap</h2>
            <p className="text-gray-300">Generate visual learning paths with AI-powered mindmaps</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="dashboard-card p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Configure Learning Path
            </h3>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject / Field
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject (e.g., React Development)"
                className="batman-input w-full px-4 py-3 rounded-lg"
              />
            </div>

            {/* Popular Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Popular Fields
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {popularSubjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubject(subj)}
                    className="block w-full text-left text-sm text-gray-400 hover:text-yellow-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Goals (Optional)
              </label>
              <div className="space-y-2">
                {learningGoals.map((goal, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateLearningGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                      className="batman-input flex-1 px-3 py-2 text-sm rounded"
                    />
                    {learningGoals.length > 1 && (
                      <button
                        onClick={() => removeLearningGoal(index)}
                        className="text-red-400 hover:text-red-300 px-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addLearningGoal}
                  className="flex items-center text-sm text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </button>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Learning Level
              </label>
              <div className="space-y-2">
                {difficulties.map((diff) => (
                  <label key={diff.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff.value}
                      checked={difficulty === diff.value}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="text-yellow-400"
                    />
                    <span className={`font-semibold ${diff.color}`}>{diff.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateMindmap}
              disabled={isGenerating || !subject.trim()}
              className="batman-button w-full py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Network className="w-5 h-5" />
                  <span>Generate Mindmap</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mindmap Display */}
        <div className="lg:col-span-3">
          {generatedMindmap ? (
            <div className="dashboard-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{generatedMindmap.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-sm font-semibold ${
                      difficulties.find(d => d.value === generatedMindmap.difficulty)?.color
                    }`}>
                      {difficulties.find(d => d.value === generatedMindmap.difficulty)?.label} Level
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {generatedMindmap.totalEstimatedTime}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <span>{showDetails ? 'Hide' : 'Show'} Details</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Prerequisites */}
              {generatedMindmap.prerequisites.length > 0 && (
                <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">Prerequisites:</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    {generatedMindmap.prerequisites.map((prereq, index) => (
                      <li key={index}>• {prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mindmap Visualization */}
              <div className="relative bg-gray-900/50 p-8 rounded-lg min-h-96">
                {/* Central Node */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-yellow-500 text-black p-4 rounded-full font-bold text-center min-w-32">
                    {generatedMindmap.centralNode}
                  </div>
                </div>

                {/* Branch Nodes */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                  {generatedMindmap.branches.map((branch, index) => (
                    <div key={index} className={`flex items-center ${
                      index % 2 === 0 ? 'justify-start' : 'justify-end'
                    }`}>
                      <BranchNode branch={branch} index={index} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed View */}
              {showDetails && (
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white">Learning Path Details</h4>
                  {generatedMindmap.branches.map((branch, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h5 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: branch.color }}
                        ></div>
                        {branch.name}
                      </h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        {branch.subbranches.map((subbranch, subIndex) => (
                          <div key={subIndex} className="bg-gray-900 p-3 rounded">
                            <h6 className="font-semibold text-gray-200 mb-2">{subbranch.name}</h6>
                            <div className="text-sm space-y-2">
                              <div>
                                <span className="text-gray-400">Topics:</span>
                                <ul className="text-gray-300 ml-4 mt-1">
                                  {subbranch.topics.map((topic, topicIndex) => (
                                    <li key={topicIndex}>• {topic}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-gray-400">Resources:</span>
                                <ul className="text-gray-300 ml-4 mt-1">
                                  {subbranch.resources.map((resource, resourceIndex) => (
                                    <li key={resourceIndex}>• {resource}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex items-center text-yellow-400">
                                <Clock className="w-4 h-4 mr-1" />
                                {subbranch.estimatedTime}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-4">
                <button className="batman-button flex-1 py-3 rounded-lg font-bold">
                  Start Learning Path
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Save Mindmap
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Export
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-12 text-center">
              <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Ready to Map Your Learning</h3>
              <p className="text-gray-500">
                Configure your learning path and generate an AI-powered mindmap to visualize your journey
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindmapGenerator;