
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getUserRepositories, Repository } from '@/services/github-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarIcon, GitForkIcon, LockClosedIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RepositoriesList: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRepositories();
    }
  }, [isAuthenticated, token]);

  const fetchRepositories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const repos = await getUserRepositories(token!);
      setRepositories(repos);
    } catch (err) {
      console.error('Failed to fetch repositories:', err);
      setError('Failed to load repositories. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p>Please log in to see your repositories</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-3 w-1/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No repositories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {repositories.map(repo => (
        <Card key={repo.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">
                <a 
                  href={repo.html_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {repo.name}
                </a>
              </CardTitle>
              {repo.private && <LockClosedIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <CardDescription className="line-clamp-2 h-10">
              {repo.description || 'No description'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {repo.language && <Badge variant="outline">{repo.language}</Badge>}
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <StarIcon className="h-3.5 w-3.5 mr-1" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center">
                <GitForkIcon className="h-3.5 w-3.5 mr-1" />
                <span>{repo.forks_count}</span>
              </div>
            </div>
            <div>
              Updated {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default RepositoriesList;
