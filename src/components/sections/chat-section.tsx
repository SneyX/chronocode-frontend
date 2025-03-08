
import React, { useState } from 'react';
import { MessageCircle, SendHorizontal, User, Bot, HelpCircle, GitCommit } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommitModal from '@/components/ui/commit-modal';
import { toast } from 'sonner';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  relatedCommits?: string[];
};

// Mock commits for demonstration (would come from props in a real app)
const mockCommits = [
  {
    sha: '1',
    created_at: '2023-01-01T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-01-01',
    message: 'Initial project setup',
    url: 'https://github.com/example/repo/commit/1',
    description: 'Set up project structure and dependencies',
    commit_analyses: [
      {
        id: '1',
        created_at: '2023-01-01T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Project Initialization',
        idea: 'Setting up the foundation for the project',
        description: 'Created basic structure with core dependencies',
        commit_sha: '1',
        type: 'CHORE',
        epic: 'Project Setup'
      }
    ]
  },
  {
    sha: '2',
    created_at: '2023-01-02T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer2',
    author_url: 'https://github.com/developer2',
    author_email: 'dev2@example.com',
    date: '2023-01-02',
    message: 'Implement authentication system',
    url: 'https://github.com/example/repo/commit/2',
    description: 'Added login and registration functionality',
    commit_analyses: [
      {
        id: '2',
        created_at: '2023-01-02T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Authentication Implementation',
        idea: 'Securing user access with a robust auth system',
        description: 'Implemented JWT-based authentication flow',
        commit_sha: '2',
        type: 'FEATURE',
        epic: 'User Authentication'
      }
    ]
  },
  {
    sha: '3',
    created_at: '2023-01-03T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-01-03',
    message: 'Enhance authentication security',
    url: 'https://github.com/example/repo/commit/3',
    description: 'Improved password hashing and session management',
    commit_analyses: [
      {
        id: '3',
        created_at: '2023-01-03T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Security Enhancements',
        idea: 'Strengthening authentication security measures',
        description: 'Upgraded password hashing and added brute force protection',
        commit_sha: '3',
        type: 'FEATURE',
        epic: 'User Authentication'
      }
    ]
  },
  {
    sha: '6',
    created_at: '2023-01-06T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer3',
    author_url: 'https://github.com/developer3',
    author_email: 'dev3@example.com',
    date: '2023-01-06',
    message: 'Fix authentication edge cases',
    url: 'https://github.com/example/repo/commit/6',
    description: 'Resolved issues with auth token refresh and expired sessions',
    commit_analyses: [
      {
        id: '6',
        created_at: '2023-01-06T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Auth Bug Fixes',
        idea: 'Resolving edge cases in authentication flow',
        description: 'Fixed token refresh mechanism and session handling',
        commit_sha: '6',
        type: 'BUG',
        epic: 'User Authentication'
      }
    ]
  },
  {
    sha: '7',
    created_at: '2023-01-07T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer2',
    author_url: 'https://github.com/developer2',
    author_email: 'dev2@example.com',
    date: '2023-01-07',
    message: 'Implement XSS protection',
    url: 'https://github.com/example/repo/commit/7',
    description: 'Added input sanitization and CSP headers',
    commit_analyses: [
      {
        id: '7',
        created_at: '2023-01-07T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Security Improvements',
        idea: 'Preventing XSS attacks with robust protection',
        description: 'Implemented input validation and content security policy',
        commit_sha: '7',
        type: 'FEATURE',
        epic: 'Security'
      }
    ]
  },
  {
    sha: '8',
    created_at: '2023-01-08T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer1',
    author_url: 'https://github.com/developer1',
    author_email: 'dev1@example.com',
    date: '2023-01-08',
    message: 'Optimize database queries',
    url: 'https://github.com/example/repo/commit/8',
    description: 'Improved query performance with indexes and caching',
    commit_analyses: [
      {
        id: '8',
        created_at: '2023-01-08T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Performance Optimization',
        idea: 'Boosting application speed with efficient queries',
        description: 'Added database indexes and implemented query caching',
        commit_sha: '8',
        type: 'FEATURE',
        epic: 'Performance'
      }
    ]
  },
  {
    sha: '9',
    created_at: '2023-01-09T00:00:00Z',
    repo_name: 'example/repo',
    author: 'developer3',
    author_url: 'https://github.com/developer3',
    author_email: 'dev3@example.com',
    date: '2023-01-09',
    message: 'Version 1.0.0 release',
    url: 'https://github.com/example/repo/commit/9',
    description: 'Final preparations for initial stable release',
    commit_analyses: [
      {
        id: '9',
        created_at: '2023-01-09T00:00:00Z',
        repo_name: 'example/repo',
        title: 'Stable Release',
        idea: 'Launching the first stable version of the application',
        description: 'Finalized documentation and version bumps for 1.0.0 release',
        commit_sha: '9',
        type: 'MILESTONE',
        epic: 'Release'
      }
    ]
  }
];

// Predefined questions with their responses and related commits
const predefinedQuestions = [
  {
    question: "What motivated the authentication changes?",
    response: "The authentication changes were motivated by security concerns and the need to implement better user experience. The team identified several vulnerabilities in the previous implementation and decided to upgrade to JWT-based authentication with better password handling.",
    relatedCommits: ['2', '3', '6']
  },
  {
    question: "How did the performance optimizations improve the system?",
    response: "The performance improvements were focused on optimizing database queries and implementing caching mechanisms, which reduced load times by 65%. This was a response to user feedback about slow page rendering, especially on mobile devices.",
    relatedCommits: ['8']
  },
  {
    question: "What security improvements were made to the system?",
    response: "Security enhancements were implemented to address potential vulnerabilities, including XSS protection and better input validation. These changes were part of a broader security audit conducted in Q2.",
    relatedCommits: ['7']
  }
];

const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm Chronocode's AI assistant. I can answer questions about your code history and architecture. What would you like to know?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    
    setMessages([...messages, userMessage]);
    setCurrentQuestion(input);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      // Find if there's a predefined question that matches
      const matchedQuestion = predefinedQuestions.find(q => 
        input.toLowerCase().includes(q.question.toLowerCase())
      );
      
      let botResponse = "";
      let relatedCommits: string[] | undefined = undefined;
      
      if (matchedQuestion) {
        botResponse = matchedQuestion.response;
        relatedCommits = matchedQuestion.relatedCommits;
      } else {
        // Fallback responses
        const responses = [
          "I've analyzed the commit history around the authentication system. The main motivations were to improve security by implementing JWT tokens and to reduce login failures by 35%. This change was initiated after security audits in March.",
          "The performance optimization in the data fetching logic was implemented to reduce load times by 65%. The key changes included implementing data caching, pagination, and optimizing database queries to minimize response times.",
          "Analyzing your project's architecture evolution, I can see it began as a monolith and gradually moved to a microservices approach. The first separation came 8 months ago when the authentication system was decoupled. This pattern continued with 5 more components becoming standalone services."
        ];
        
        botResponse = responses[Math.floor(Math.random() * responses.length)];
      }
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        relatedCommits
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (relatedCommits && relatedCommits.length > 0) {
        toast.success(`Found ${relatedCommits.length} related commits!`, {
          description: "Click on 'View Commits' to see details."
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleViewCommits = (commitIds: string[]) => {
    setSelectedCommits(commitIds);
    setIsModalOpen(true);
  };

  const handlePredefinedClick = (question: string) => {
    setInput(question);
    
    // Automatically send the predefined question
    const userMessage: Message = {
      id: messages.length + 1,
      text: question,
      sender: 'user'
    };
    
    setMessages([...messages, userMessage]);
    setCurrentQuestion(question);
    setIsLoading(true);
    
    // Find the predefined response
    const matchedQuestion = predefinedQuestions.find(q => q.question === question);
    
    if (matchedQuestion) {
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: matchedQuestion.response,
          sender: 'bot',
          relatedCommits: matchedQuestion.relatedCommits
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        if (matchedQuestion.relatedCommits && matchedQuestion.relatedCommits.length > 0) {
          toast.success(`Found ${matchedQuestion.relatedCommits.length} related commits!`, {
            description: "Click on 'View Commits' to see details."
          });
        }
        
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ask Questions About Your Code</h2>
            <p className="text-xl text-muted-foreground">
              Chronocode understands your project's history and can answer questions about code evolution, 
              developer motivations, and architectural decisions.
            </p>
          </div>
          
          <Card className="border shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center text-xl">
                <Bot className="mr-2 h-5 w-5 text-primary" />
                Code Intelligence Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Predefined Questions Section */}
              <div className="p-4 border-b bg-muted/10">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                  Suggested Questions:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {predefinedQuestions.map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-primary/5 border-primary/20 text-muted-foreground"
                      onClick={() => handlePredefinedClick(item.question)}
                      disabled={isLoading}
                    >
                      <MessageCircle className="h-3 w-3 mr-1 text-primary" />
                      {item.question.length > 40 ? item.question.substring(0, 40) + '...' : item.question}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="p-4 h-[350px] overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {message.sender === 'bot' && (
                            <Bot className="h-5 w-5 mt-0.5 text-primary" />
                          )}
                          <div>
                            <p>{message.text}</p>
                            {message.relatedCommits && message.relatedCommits.length > 0 && (
                              <div className="mt-2 flex items-center">
                                <span className="text-xs opacity-80 mr-2">
                                  {message.relatedCommits.length} relevant commits found
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => handleViewCommits(message.relatedCommits!)}
                                >
                                  <GitCommit className="h-3 w-3 mr-1" />
                                  View Commits
                                </Button>
                              </div>
                            )}
                          </div>
                          {message.sender === 'user' && (
                            <User className="h-5 w-5 mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t p-3">
              <div className="w-full flex gap-2">
                <Input
                  placeholder="Ask about your code history..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading}
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Modal for displaying commits */}
      <CommitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        commits={mockCommits}
        commitIds={selectedCommits}
        question={currentQuestion}
      />
    </section>
  );
};

export default ChatSection;
