import React, { useState } from 'react';
import { Brain, BookOpen, Target, Clock, ChevronRight } from 'lucide-react';

interface QuizGeneratorProps {
  user?: any;
}

interface QuizData {
  subject: string;
  difficulty: string;
  questions: Array<{
    question: string;
    options: { [key: string]: string };
    correctAnswer: string;
    explanation: string;
  }>;
}

const EnhancedQuizGenerator: React.FC<QuizGeneratorProps> = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizData | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  const difficulties = [
    { value: 'easy', label: 'Easy', color: 'text-green-400', description: 'Basic concepts and definitions' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400', description: 'Intermediate understanding required' },
    { value: 'hard', label: 'Hard', color: 'text-red-400', description: 'Advanced concepts and analysis' }
  ];

  const popularSubjects = [
    'JavaScript Programming',
    'React Development',
    'Python Basics',
    'Data Science',
    'Machine Learning',
    'Web Development',
    'Database Management',
    'Cybersecurity',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography'
  ];

  const generateQuiz = async () => {
    if (!subject.trim()) {
      alert('Please enter a subject for the quiz');
      return;
    }

    setIsGenerating(true);
    try {
      const token = localStorage.getItem('batman_token');
      const response = await fetch('http://localhost:5000/api/quizzes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          difficulty,
          numberOfQuestions
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedQuiz(result.data.generatedContent);
        setShowQuestions(false);
      } else {
        throw new Error(result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="comic-panel p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500 p-3 rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">AI Quiz Generator</h2>
            <p className="text-gray-300">Generate custom quizzes on any subject with Batman AI</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quiz Configuration */}
        <div className="lg:col-span-1">
          <div className="dashboard-card p-6 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-yellow-400" />
              Quiz Configuration
            </h3>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject / Topic
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter any subject (e.g., JavaScript, Physics, History)"
                className="batman-input w-full px-4 py-3 rounded-lg"
              />
            </div>

            {/* Popular Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Popular Subjects
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {popularSubjects.map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSubject(subj)}
                    className="text-left text-sm text-gray-400 hover:text-yellow-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors"
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
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
                    <div className="flex-1">
                      <span className={`font-semibold ${diff.color}`}>{diff.label}</span>
                      <p className="text-xs text-gray-400">{diff.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Questions
              </label>
              <select
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                className="batman-input w-full px-4 py-3 rounded-lg"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQuiz}
              disabled={isGenerating || !subject.trim()}
              className="batman-button w-full py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Quiz Display */}
        <div className="lg:col-span-2">
          {generatedQuiz ? (
            <div className="dashboard-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{generatedQuiz.subject} Quiz</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`text-sm font-semibold ${
                      difficulties.find(d => d.value === generatedQuiz.difficulty)?.color
                    }`}>
                      {difficulties.find(d => d.value === generatedQuiz.difficulty)?.label} Level
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {generatedQuiz.questions.length} Questions
                    </span>
                    <span className="text-sm text-gray-400 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      ~{generatedQuiz.questions.length * 2} minutes
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <span>{showQuestions ? 'Hide' : 'Show'} Questions</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showQuestions ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {showQuestions && (
                <div className="space-y-6">
                  {generatedQuiz.questions.map((question, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-3">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {Object.entries(question.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border ${
                              key === question.correctAnswer
                                ? 'border-green-400 bg-green-400/10 text-green-400'
                                : 'border-gray-600 bg-gray-700 text-gray-300'
                            }`}
                          >
                            <span className="font-semibold">{key}.</span> {value}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-900/30 border border-blue-500/30 p-3 rounded-lg">
                        <p className="text-sm text-blue-300">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex space-x-4">
                <button className="batman-button flex-1 py-3 rounded-lg font-bold">
                  Take Quiz
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Save Quiz
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Share Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="dashboard-card p-12 text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">Ready to Generate</h3>
              <p className="text-gray-500">
                Configure your quiz settings and click "Generate Quiz" to create a custom quiz with AI
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuizGenerator;