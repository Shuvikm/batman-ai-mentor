import React, { useState } from 'react';
import { Brain, Clock, Star, TrendingUp, Target, Zap, CheckCircle } from 'lucide-react';
import { learningPathsService } from '../../lib/mongodb';

interface LearningPathsProps {
  user: any;
}

const LearningPaths: React.FC<LearningPathsProps> = ({ user }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    level: 'beginner',
    timeAvailable: '1-2 hours/week',
    goals: ''
  });
  const [generatedPath, setGeneratedPath] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const result = await learningPathsService.generatePath({
        ...formData,
        userId: user.id
      });

      if (result.success && result.data) {
        setGeneratedPath({
          title: result.data.title,
          duration: result.data.duration,
          difficulty: result.data.level,
          modules: result.data.modules
        });
      } else {
        console.error('Failed to generate learning path:', result.error);
        // Fallback to mock data
        const mockPath = {
          title: `Master ${formData.topic}`,
          duration: '8-12 weeks',
          difficulty: formData.level,
          modules: [
            {
              id: 1,
              title: 'Foundations',
              lessons: ['Introduction to Concepts', 'Basic Principles', 'Core Terminology'],
              duration: '2 weeks',
              completed: false
            },
            {
              id: 2,
              title: 'Intermediate Concepts',
              lessons: ['Advanced Topics', 'Practical Applications', 'Real-world Examples'],
              duration: '3 weeks',
              completed: false
            },
            {
              id: 3,
              title: 'Advanced Mastery',
              lessons: ['Expert Techniques', 'Complex Problems', 'Industry Best Practices'],
              duration: '3 weeks',
              completed: false
            },
            {
              id: 4,
              title: 'Final Project',
              lessons: ['Capstone Project', 'Portfolio Creation', 'Peer Review'],
              duration: '2 weeks',
              completed: false
            }
          ]
        };
        setGeneratedPath(mockPath);
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      // Fallback to mock data on error
      const mockPath = {
        title: `Master ${formData.topic}`,
        duration: '8-12 weeks',
        difficulty: formData.level,
        modules: [
          {
            id: 1,
            title: 'Foundations',
            lessons: ['Introduction to Concepts', 'Basic Principles', 'Core Terminology'],
            duration: '2 weeks',
            completed: false
          },
          {
            id: 2,
            title: 'Intermediate Concepts',
            lessons: ['Advanced Topics', 'Practical Applications', 'Real-world Examples'],
            duration: '3 weeks',
            completed: false
          },
          {
            id: 3,
            title: 'Advanced Mastery',
            lessons: ['Expert Techniques', 'Complex Problems', 'Industry Best Practices'],
            duration: '3 weeks',
            completed: false
          },
          {
            id: 4,
            title: 'Final Project',
            lessons: ['Capstone Project', 'Portfolio Creation', 'Peer Review'],
            duration: '2 weeks',
            completed: false
          }
        ]
      };
      setGeneratedPath(mockPath);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="comic-panel p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-yellow-400 p-3 rounded-full">
            <Brain className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">AI Learning Paths</h2>
            <p className="text-gray-300">Personalized learning journeys crafted by Wayne Tech AI</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="dashboard-card p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="w-6 h-6 text-yellow-400 mr-2" />
              Create Learning Path
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you want to learn?
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="batman-input w-full px-4 py-3 rounded-lg"
                  placeholder="e.g., React.js, Machine Learning, Digital Marketing"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your current level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="batman-input w-full px-4 py-3 rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time commitment
                </label>
                <select
                  value={formData.timeAvailable}
                  onChange={(e) => setFormData({...formData, timeAvailable: e.target.value})}
                  className="batman-input w-full px-4 py-3 rounded-lg"
                >
                  <option value="1-2 hours/week">1-2 hours/week</option>
                  <option value="3-5 hours/week">3-5 hours/week</option>
                  <option value="6-10 hours/week">6-10 hours/week</option>
                  <option value="10+ hours/week">10+ hours/week</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specific goals (optional)
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => setFormData({...formData, goals: e.target.value})}
                  className="batman-input w-full px-4 py-3 rounded-lg resize-none"
                  rows={3}
                  placeholder="What do you hope to achieve?"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !formData.topic}
                className="batman-button w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Generating Path...</span>
                  </div>
                ) : (
                  'Generate Learning Path'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          {generatedPath ? (
            <div className="space-y-6">
              {/* Path Overview */}
              <div className="dashboard-card p-6">
                <h3 className="text-2xl font-bold text-white mb-4">{generatedPath.title}</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-2 mx-auto">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-bold text-yellow-400">{generatedPath.duration}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-2 mx-auto">
                      <Star className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-sm text-gray-400">Level</p>
                    <p className="font-bold text-yellow-400 capitalize">{generatedPath.difficulty}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-400 rounded-full mb-2 mx-auto">
                      <TrendingUp className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-sm text-gray-400">Modules</p>
                    <p className="font-bold text-yellow-400">{generatedPath.modules.length}</p>
                  </div>
                </div>

                <button className="batman-button w-full py-3 px-6 rounded-lg font-bold">
                  Start Learning Path
                </button>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {generatedPath.modules.map((module: any, index: number) => (
                  <div key={module.id} className="dashboard-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          module.completed ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          {module.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-white font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{module.title}</h4>
                          <p className="text-sm text-gray-400">{module.duration}</p>
                        </div>
                      </div>
                      <Zap className="w-5 h-5 text-yellow-400" />
                    </div>

                    <div className="space-y-2">
                      {module.lessons.map((lesson: string, lessonIndex: number) => (
                        <div key={lessonIndex} className="flex items-center space-x-2 text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm">{lesson}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <button className="text-yellow-400 hover:text-yellow-300 font-medium text-sm transition-colors">
                        {module.completed ? 'Review Module' : 'Start Module'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-12 text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No Learning Path Generated Yet</h3>
              <p className="text-gray-500">
                Fill out the form to generate a personalized learning path tailored to your goals and schedule.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;