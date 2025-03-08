
import React from 'react';
import { GitGraph, FileCode, MessageSquareText, Search, Brain, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: GitGraph,
      title: 'Timeline Visualization',
      description: 'Transform commit history into a visual timeline that shows the evolution of your codebase.',
      gradient: 'from-blue-500 to-cyan-400',
      delay: 0
    },
    {
      icon: Search,
      title: 'Commit Analysis',
      description: 'Understand the reasoning and motivation behind each commit and code change.',
      gradient: 'from-violet-500 to-purple-400',
      delay: 100
    },
    {
      icon: FileCode,
      title: 'Code Context',
      description: 'Get detailed context about any part of your codebase and its development history.',
      gradient: 'from-amber-500 to-orange-400',
      delay: 200
    },
    {
      icon: MessageSquareText,
      title: 'Natural Language Queries',
      description: 'Ask questions about your code in plain English and get comprehensive answers.',
      gradient: 'from-green-500 to-emerald-400',
      delay: 300
    },
    {
      icon: Brain,
      title: 'Developer Intent',
      description: 'Uncover the thought process and intent behind code changes and architectural decisions.',
      gradient: 'from-rose-500 to-pink-400',
      delay: 400
    }
  ];

  return (
    <section className="py-20 bg-muted/10 relative">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Understand Your Code's Journey</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Chronocode offers a suite of powerful features designed to help developers 
            understand, explore, and communicate about codebases.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden hover:shadow-lg transition-all bg-background animate-scale-in hover:scale-105"
              style={{ animationDelay: `${feature.delay}ms` }}
            >
              <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${feature.gradient}`} />
              <CardContent className="p-8">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 text-white`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/timeline')} 
            variant="default" 
            size="lg" 
            className="animate-fade-in"
          >
            Explore Features <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
