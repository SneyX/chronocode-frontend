import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import RepositoryInput from '@/components/ui/repository-input';
import { Button } from '@/components/ui/button';
import Metadata from '@/components/seo/metadata';
import { 
  Sparkles, AlertTriangle, Trophy, Bug, Wrench, ArrowRight, 
  GitGraph, Search, MessageSquareText, FileCode, Brain, MessageCircleQuestion
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { checkRepoExists, createEmbeddingSpace } from '@/lib/supabase';
import FeaturesSection from '@/components/sections/features-section';
import ChatSection from '@/components/sections/chat-section';
import TeamSection from '@/components/sections/team-section';

const Index: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleRepositorySubmit = async (url: string, repoName: string) => {
    setIsLoading(true);
    try {
      console.log('Checking if repository exists:', repoName);
      // Check if repository already exists in our database
      const repoExists = await checkRepoExists(repoName);
      console.log('Repository exists:', repoExists);
      
      if (repoExists) {
        toast.success('Repository found in our database!');
      } else {
        // Simulate API call for repository analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success('Repository analyzed successfully!', {
          description: 'You can now view the timeline with example data.',
        });

        // Navigate to timeline page with example data flag
        navigate(`/timeline?repo=${encodeURIComponent(repoName)}&example=true`);
      }



      // Navigate to timeline page with repo name as parameter
      navigate(`/timeline?repo=${encodeURIComponent(repoName)}`);
    } catch (error) {
      console.error('Error analyzing repository:', error);
      toast.error('Failed to analyze repository', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Metadata 
        title="Home"
        description="Visualize your codebase evolution with an intelligent timeline. Understand patterns, milestones, and key changes in your repository."
        ogType="website"
      />
      
      <Header />
      
      <main className="flex-grow">
        <section className="py-20 md:py-24 lg:py-32 relative">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[30%] -right-[25%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-[30%] -left-[25%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container px-4 relative">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="px-3 py-1 mb-8 bg-primary/10 text-primary border-primary/20 animate-fade-in">
                Visualize code evolution
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
                Understand your repository's journey
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-12 animation-delay-100 animate-slide-up">
                Chronocode analyzes your repository commits and visualizes them on an intelligent timeline, 
                giving you insights into the evolution of your codebase.
              </p>
              
              <div className="animation-delay-200 animate-slide-up">
                <RepositoryInput 
                  onSubmit={handleRepositorySubmit} 
                  isLoading={isLoading}
                />
              </div>
              
              <div className="flex justify-center mt-6 animation-delay-300 animate-fade-in">
                <Button
                  variant="link"
                  onClick={() => navigate('/timeline')}
                  className="text-muted-foreground"
                >
                  View an example <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Chat Section */}
        <ChatSection />
        
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Understand your commits at a glance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: 'Features',
                  description: 'New functionality added to your codebase',
                  icon: Sparkles,
                  color: 'bg-commit-feature text-white'
                },
                {
                  title: 'Warnings',
                  description: 'Potential issues that need attention',
                  icon: AlertTriangle,
                  color: 'bg-commit-warning text-black'
                },
                {
                  title: 'Milestones',
                  description: 'Significant achievements in your project',
                  icon: Trophy,
                  color: 'bg-commit-milestone text-white'
                },
                {
                  title: 'Bugs',
                  description: 'Fixed issues and resolved problems',
                  icon: Bug,
                  color: 'bg-commit-bug text-white'
                },
                {
                  title: 'Chores',
                  description: 'Maintenance and housekeeping tasks',
                  icon: Wrench,
                  color: 'bg-commit-chore text-white'
                }
              ].map((item, index) => (
                <div key={index} className="glass-morphism rounded-lg p-6 flex flex-col items-center text-center animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`h-12 w-12 rounded-full ${item.color} flex items-center justify-center mb-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <TeamSection />
        
        <section className="py-16 md:py-24 container">
          <div className="glass-morphism rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="md:pr-8 mb-6 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to analyze your repository?</h2>
              <p className="text-muted-foreground">Get started now and gain insights into your codebase.</p>
            </div>
            <Button 
              size="lg" 
              className="px-8"
              onClick={() => document.querySelector('.scroll-smooth')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
