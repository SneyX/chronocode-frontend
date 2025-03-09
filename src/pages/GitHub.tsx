
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { useAuth } from '@/contexts/auth-context';
import RepositoriesList from '@/components/github/repositories-list';
import RepositoryInput from '@/components/ui/repository-input';
import { toast } from 'sonner';
import { checkRepoExists } from '@/lib/supabase';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import Metadata from '@/components/seo/metadata';
import { Github, Star, GitFork, Clock } from 'lucide-react';

const GitHub: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [submittingRepo, setSubmittingRepo] = useState(false);
  const navigate = useNavigate();

  const handleRepositorySubmit = async (url: string, repoName: string, repoExists?: boolean) => {
    setSubmittingRepo(true);
    try {
      if (repoExists) {
        toast.success('Repository found in our database!', {
          description: 'Redirecting to the timeline view.',
        });
        
        navigate(`/timeline?repo=${encodeURIComponent(repoName)}`);
      } else {
        // Simulate API call for repository analysis
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success('Repository analyzed successfully!', {
          description: 'You can now view the timeline with example data.',
        });
        
        navigate(`/timeline?repo=${encodeURIComponent(repoName)}&example=true`);
      }
    } catch (error) {
      console.error('Error analyzing repository:', error);
      toast.error('Failed to analyze repository', {
        description: 'Please try again later.',
      });
    } finally {
      setSubmittingRepo(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Metadata 
        title="GitHub Repositories" 
        description="View and analyze your GitHub repositories"
      />
      
      <Header />
      
      <main className="flex-grow container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">GitHub Repositories</h1>
          <p className="text-muted-foreground">Connect your GitHub account to view and analyze your repositories</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : isAuthenticated ? (
          <Tabs defaultValue="analyze" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="analyze" className="flex items-center">
                <Github className="mr-2 h-4 w-4" /> 
                Analyze Repository
              </TabsTrigger>
              <TabsTrigger value="repositories" className="flex items-center">
                <GitFork className="mr-2 h-4 w-4" /> 
                My Repositories
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center">
                <Star className="mr-2 h-4 w-4" /> 
                Popular Repositories
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" /> 
                Recent Analyses
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analyze" className="py-4">
              <div className="mb-8 max-w-3xl mx-auto text-center">
                <h2 className="text-2xl font-bold mb-4">Analyze a Repository</h2>
                <p className="text-muted-foreground mb-8">
                  Select one of your repositories or enter a GitHub repository URL to analyze its commit history
                </p>
                
                <RepositoryInput 
                  onSubmit={handleRepositorySubmit}
                  isLoading={submittingRepo}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="repositories">
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-4">Your Repositories</h2>
                <p className="text-muted-foreground mb-6">
                  Browse and select from your GitHub repositories to analyze
                </p>
                <RepositoriesList />
              </div>
            </TabsContent>
            
            <TabsContent value="popular">
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Popular Repositories</h2>
                <p className="text-muted-foreground">
                  Coming soon! This feature will show popular repositories analyzed by other users.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="recent">
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Your Recent Analyses</h2>
                <p className="text-muted-foreground">
                  Coming soon! This feature will show your recently analyzed repositories.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Connect with GitHub</h2>
            <p className="mb-8 text-muted-foreground max-w-md mx-auto">
              Log in with your GitHub account to view and analyze your repositories
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => window.scrollTo(0, 0)} // Scroll to top where the login button is
                className="bg-[#24292e] hover:bg-[#1b1f23] text-white"
              >
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default GitHub;
