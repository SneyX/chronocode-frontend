import React from 'react';
import { Linkedin, Twitter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  name: string;
  role: string;
  linkedinUrl: string;
  xUrl: string;
  imageUrl: string;
  initials: string;
  quote: string;
  delay: number;
}

const TeamSection: React.FC = () => {
  const teamMembers: TeamMember[] = [
    {
      name: 'Octavio Pavon',
      role: 'Engineer',
      linkedinUrl: 'https://www.linkedin.com/in/octavio-pavon-ab914b210/',
      xUrl: 'https://x.com/octaviopvn1/',
      imageUrl: 'https://media-eze1-1.cdn.whatsapp.net/v/t61.24694-24/437168281_1988067828336884_4249022644510620291_n.jpg?ccb=11-4&oh=01_Q5AaICniDuf7G-jXOlEgz3ZFJrfWoboGGsboUWbJ4gZBrFyG&oe=67DC0F54&_nc_sid=5e03e0&_nc_cat=101',
      initials: 'OP',
      quote: "Building tools that enhance developer productivity is my passion.",
      delay: 0
    },
    {
      name: 'Tiago Prelato',
      role: 'Software Developer',
      linkedinUrl: 'https://www.linkedin.com/in/tiago-prelato-257787210/',
      xUrl: 'https://x.com/SneyX_',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D4D03AQEzrJlXrr-HFA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1706643760066?e=1747267200&v=beta&t=B9GlAdVrIqQ29pXRGmaiRNtrm7zTS-BsYXPhQumcmqA',
      initials: 'TP',
      quote: "I love creating elegant solutions to complex problems.",
      delay: 100
    },
    {
      name: 'Octavio Kerbs',
      role: 'Backend Developer',
      linkedinUrl: 'https://www.linkedin.com/in/octavio-kerbs/',
      xUrl: 'https://x.com/octokerbs',
      imageUrl: 'https://media.licdn.com/dms/image/v2/D4D03AQEFA2yvA4RHDQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1671566126552?e=1747267200&v=beta&t=6qiGXW0jofts7XlwScy1rl5eTdlY5m3QHUTEnQkEqyk',
      initials: 'OK',
      quote: "Optimizing systems and building robust architectures drives me.",
      delay: 200
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container px-4 relative">
        <div className="text-center mb-16">
          <Badge className="px-3 py-1 mb-6 bg-primary/10 text-primary border-primary/20 animate-fade-in">
            Our Team
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">Meet the Developers</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in animation-delay-100">
            The talented team behind Chronocode who are passionate about making code evolution more accessible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden hover:shadow-lg transition-all bg-background/80 backdrop-blur-sm animate-scale-in hover:scale-105 border-primary/10"
              style={{ animationDelay: `${member.delay}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50" />
              <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
                <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg mb-6">
                  <AvatarImage src={member.imageUrl} alt={member.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/40 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-muted-foreground mb-6">{member.role}</p>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 border-primary/20 hover:bg-primary/10"
                    onClick={() => window.open(member.linkedinUrl, '_blank')}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={() => window.open(member.xUrl, '_blank')}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-primary/10 w-full">
                  <p className="text-sm text-muted-foreground italic">
                    "{member.quote}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection; 