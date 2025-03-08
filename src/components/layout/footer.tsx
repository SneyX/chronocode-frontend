
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { GitBranch, GithubIcon, HeartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn(
      'w-full border-t py-6 md:py-0',
      className
    )}>
      <div className="container flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:h-16">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">© 2023 Chronocode</span>
          <Separator orientation="vertical" className="h-4" />
          <Link 
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/timeline"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Timeline
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
          >
            <HeartIcon className="h-3 w-3" />
            <span>Made with love</span>
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
          >
            <GithubIcon className="h-3 w-3" />
            <span>Source code</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
