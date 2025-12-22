// Document processing utilities for quiz generation
import { quizService } from './mongodb';

interface ProcessedDocument {
  content: string;
  wordCount: number;
  keyTerms: string[];
  sections: string[];
}

export class DocumentProcessor {
  // Extract text content from different file types
  static async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        
        if (file.type === 'text/plain') {
          resolve(text);
        } else if (file.type.includes('json')) {
          resolve(text);
        } else {
          // For other file types, extract readable text
          resolve(this.cleanText(text));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Clean and process extracted text
  static cleanText(text: string): string {
    return text
      .replace(/[^\w\s\.\?\!]/g, ' ') // Remove special characters except punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  // Analyze document content
  static analyzeDocument(text: string): ProcessedDocument {
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    // Extract key terms (simple frequency analysis)
    const wordFreq = words.reduce((freq: Record<string, number>, word) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && !this.isStopWord(cleanWord)) {
        freq[cleanWord] = (freq[cleanWord] || 0) + 1;
      }
      return freq;
    }, {});

    const keyTerms = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    // Identify sections (simple paragraph-based)
    const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 50);

    return {
      content: text,
      wordCount: words.length,
      keyTerms,
      sections: sections.slice(0, 10) // Limit to 10 sections
    };
  }

  // Simple stop words list
  static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'under', 'within',
      'without', 'this', 'that', 'these', 'those', 'is', 'are', 'was',
      'were', 'been', 'being', 'have', 'has', 'had', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'shall'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  // Generate quiz questions from processed document
  static generateQuizQuestions(doc: ProcessedDocument, count: number = 5): any[] {
    const questions = [];
    const sections = doc.sections;
    const keyTerms = doc.keyTerms;

    // Generate different types of questions
    for (let i = 0; i < count && i < sections.length; i++) {
      const section = sections[i];
      const sectionWords = section.split(' ').filter(w => w.length > 3);
      
      if (sectionWords.length < 10) continue;

      // Type 1: Definition/Concept questions
      if (i % 3 === 0) {
        const keyTerm = keyTerms[i % keyTerms.length];
        const question = this.generateDefinitionQuestion(section, keyTerm);
        if (question) questions.push({ ...question, id: `q${i + 1}` });
      }
      
      // Type 2: Comprehension questions
      else if (i % 3 === 1) {
        const question = this.generateComprehensionQuestion(section, i);
        if (question) questions.push({ ...question, id: `q${i + 1}` });
      }
      
      // Type 3: Application questions
      else {
        const question = this.generateApplicationQuestion(section, keyTerms[i % keyTerms.length]);
        if (question) questions.push({ ...question, id: `q${i + 1}` });
      }
    }

    return questions.slice(0, count);
  }

  // Generate definition-based questions
  static generateDefinitionQuestion(section: string, keyTerm: string): any | null {
    const sentences = section.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length < 2) return null;

    const options = [
      `The primary concept related to ${keyTerm}`,
      `An advanced application of ${keyTerm}`,
      `A common misconception about ${keyTerm}`,
      `The historical context of ${keyTerm}`
    ];

    return {
      question: `Based on the document, what is the main focus regarding "${keyTerm}"?`,
      options: this.shuffleArray(options),
      correctAnswer: 0,
      explanation: `The document discusses ${keyTerm} in the context of the provided material.`
    };
  }

  // Generate comprehension questions
  static generateComprehensionQuestion(section: string, index: number): any | null {
    const sentences = section.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length < 2) return null;

    const options = [
      'The main idea presented in this section',
      'A supporting detail mentioned',
      'An unrelated concept',
      'A contradictory statement'
    ];

    return {
      question: `According to the document, what is emphasized in section ${index + 1}?`,
      options: this.shuffleArray(options),
      correctAnswer: 0,
      explanation: 'This question tests comprehension of the main ideas presented in the document.'
    };
  }

  // Generate application questions
  static generateApplicationQuestion(_section: string, keyTerm: string): any | null {
    const options = [
      `Practical implementation of ${keyTerm} concepts`,
      `Theoretical background only`,
      `Historical significance alone`,
      `Unrelated alternative approaches`
    ];

    return {
      question: `How would you apply the concepts discussed about "${keyTerm}" in a real-world scenario?`,
      options: this.shuffleArray(options),
      correctAnswer: 0,
      explanation: `The document provides guidance on practical applications of ${keyTerm}.`
    };
  }

  // Utility to shuffle array
  static shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Enhanced quiz generation with AI-like intelligence
  static async generateIntelligentQuiz(file: File, userId: string): Promise<any> {
    try {
      // Extract and process document
      const text = await this.extractText(file);
      const doc = this.analyzeDocument(text);

      // Generate questions based on content
      const questions = this.generateQuizQuestions(doc, 5);

      // Create quiz object
      const quiz = {
        title: `Quiz: ${file.name.replace(/\.[^/.]+$/, '')}`,
        questions,
        metadata: {
          sourceFile: file.name,
          wordCount: doc.wordCount,
          keyTerms: doc.keyTerms.slice(0, 5),
          generatedAt: new Date().toISOString()
        }
      };

      // Save to database
      const result = await quizService.saveQuiz(userId, quiz);
      
      if (result.success) {
        return {
          success: true,
          quiz: {
            id: result.data._id,
            title: quiz.title,
            questions: quiz.questions,
            metadata: quiz.metadata
          }
        };
      } else {
        throw new Error(result.error || 'Failed to save quiz');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quiz generation failed'
      };
    }
  }
}

// Export for use in components
export default DocumentProcessor;