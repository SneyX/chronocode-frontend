
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { AppWindow } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn(
      'w-full border-t py-6 md:py-0',
      className
    )}>
      <div className="container flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:h-16">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <AppWindow className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">© {currentYear} Chronocode</span>
          </div>
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
      </div>
    </footer>
  );
};

export default Footer;
