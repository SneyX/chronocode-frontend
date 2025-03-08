
import React, { useState } from 'react';
import { MessageCircleQuestion, SendHorizontal, User, Bot, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot';
};

const exampleQuestions = [
  "What motivated the changes in the authentication system?",
  "Tell me about the performance optimization in the data fetching logic",
  "How did the project architecture evolve over time?"
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

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed the commit history around the authentication system. The main motivations were to improve security by implementing JWT tokens and to reduce login failures by 35%. This change was initiated after security audits in March.",
        "The performance optimization in the data fetching logic was implemented to reduce load times by 65%. The key changes included implementing data caching, pagination, and optimizing database queries to minimize response times.",
        "Analyzing your project's architecture evolution, I can see it began as a monolith and gradually moved to a microservices approach. The first separation came 8 months ago when the authentication system was decoupled. This pattern continued with 5 more components becoming standalone services."
      ];
      
      const botMessage: Message = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
              <MessageCircleQuestion className="h-8 w-8" />
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
            
            <CardContent className="p-4 h-[400px] overflow-y-auto">
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
                        </div>
                        {message.sender === 'user' && (
                          <User className="h-5 w-5 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="border-t p-3">
              <div className="w-full space-y-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {exampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-primary/5 border-primary/20 text-muted-foreground"
                      onClick={() => handleExampleClick(question)}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {question.length > 40 ? question.substring(0, 40) + '...' : question}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
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
                  />
                  <Button onClick={handleSendMessage} disabled={!input.trim()}>
                    <SendHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
