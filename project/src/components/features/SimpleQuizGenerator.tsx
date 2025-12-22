import React, { useState } from 'react';
import { Upload, FileText, Clock, Target, CheckCircle, RotateCcw } from 'lucide-react';

interface QuizGeneratorProps {
  user?: any;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

const SimpleQuizGenerator: React.FC<QuizGeneratorProps> = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const generateMockQuiz = (): Quiz => {
    const topics = ['mathematics', 'science', 'history', 'literature', 'geography'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const questions: QuizQuestion[] = [
      {
        id: '1',
        question: `What is a fundamental concept in ${randomTopic}?`,
        options: [
          'Option A - Basic principle',
          'Option B - Secondary concept',
          'Option C - Advanced theory',
          'Option D - Unrelated topic'
        ],
        correctAnswer: 0,
        explanation: `The fundamental concept in ${randomTopic} forms the basis for understanding more complex topics.`
      },
      {
        id: '2',
        question: `Which approach is most effective for studying ${randomTopic}?`,
        options: [
          'Memorization only',
          'Understanding concepts and practice',
          'Reading textbooks passively',
          'Avoiding difficult topics'
        ],
        correctAnswer: 1,
        explanation: 'Active learning with understanding and practice is always more effective than passive methods.'
      },
      {
        id: '3',
        question: `What is an important skill when learning ${randomTopic}?`,
        options: [
          'Perfect memory',
          'Critical thinking',
          'Speed reading',
          'Avoiding questions'
        ],
        correctAnswer: 1,
        explanation: 'Critical thinking helps you analyze, evaluate, and apply knowledge effectively.'
      }
    ];

    return {
      id: Date.now().toString(),
      title: `${randomTopic.charAt(0).toUpperCase() + randomTopic.slice(1)} Quiz`,
      questions,
      createdAt: new Date()
    };
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    
    // Simulate quiz generation
    setTimeout(() => {
      const quiz = generateMockQuiz();
      setGeneratedQuiz(quiz);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (generatedQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizCompleted(false);
  };

  const handleSubmitQuiz = () => {
    setQuizCompleted(true);
  };

  const calculateScore = () => {
    if (!generatedQuiz) return { score: 0, percentage: 0 };
    
    let correct = 0;
    generatedQuiz.questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    
    const percentage = Math.round((correct / generatedQuiz.questions.length) * 100);
    return { score: correct, percentage };
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setUploadedFile(null);
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
  };

  if (quizCompleted) {
    const { score, percentage } = calculateScore();
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 rounded-xl border border-gray-700 p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
              <p className="text-gray-300">Great job finishing the quiz!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400 mb-1">{score}</div>
                <div className="text-sm text-gray-300">Correct Answers</div>
              </div>
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400 mb-1">{generatedQuiz?.questions.length}</div>
                <div className="text-sm text-gray-300">Total Questions</div>
              </div>
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400 mb-1">{percentage}%</div>
                <div className="text-sm text-gray-300">Score</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Another Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted && generatedQuiz) {
    const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === generatedQuiz.questions.length - 1;
    
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black/30 rounded-xl border border-gray-700 p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{generatedQuiz.title}</h2>
                <div className="text-sm text-gray-400">
                  Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">
                {currentQuestion.question}
              </h3>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      userAnswers[currentQuestion.id] === index
                        ? 'bg-blue-600/30 border-blue-500 text-white'
                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold transition-all duration-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {isLastQuestion ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={userAnswers[currentQuestion.id] === undefined}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold transition-all duration-300 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={userAnswers[currentQuestion.id] === undefined}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold transition-all duration-300 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Quiz Generator</h1>
          <p className="text-gray-300 text-lg">Upload a document and generate an intelligent quiz</p>
        </div>

        {!generatedQuiz ? (
          <div className="bg-black/30 rounded-xl border border-gray-700 p-8">
            <div className="text-center mb-8">
              <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Upload Your Document</h2>
              <p className="text-gray-400">Upload a PDF, Word document, or text file to generate a quiz</p>
            </div>

            {!uploadedFile ? (
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-purple-500 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-400 mb-4">Supports PDF, DOCX, TXT files up to 10MB</p>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  Choose File
                </label>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {uploadedFile && (
              <div className="text-center">
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold text-lg transition-all duration-300 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-black/30 rounded-xl border border-gray-700 p-8">
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">{generatedQuiz.title}</h2>
              <p className="text-gray-400">
                Quiz generated successfully! Ready to test your knowledge with {generatedQuiz.questions.length} questions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{generatedQuiz.questions.length}</div>
                <div className="text-sm text-gray-300">Questions</div>
              </div>
              <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">~{generatedQuiz.questions.length * 2}</div>
                <div className="text-sm text-gray-300">Minutes</div>
              </div>
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">Mixed</div>
                <div className="text-sm text-gray-300">Difficulty</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStartQuiz}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold text-lg transition-all duration-300 hover:from-green-600 hover:to-blue-600 flex items-center gap-3"
              >
                <Clock className="w-5 h-5" />
                Start Quiz
              </button>
              <button
                onClick={resetQuiz}
                className="px-6 py-4 bg-gray-600 text-white rounded-lg font-bold transition-all duration-300 hover:bg-gray-700 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleQuizGenerator;