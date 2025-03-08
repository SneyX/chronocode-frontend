
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, ClockIcon, FilterIcon, LayersIcon, SearchIcon, Users, XIcon } from 'lucide-react';
import { Commit, CommitType, TimelineFilters, TimeScale, GroupBy } from '@/types';
import { getUniqueAuthors, getCommitTypeColor, getUniqueEpics, getEpicColor } from '@/utils/filter-utils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  commits: Commit[];
  filters: TimelineFilters;
  onFilterChange: (filters: TimelineFilters) => void;
  timeScale: TimeScale;
  onTimeScaleChange: (scale: TimeScale) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  commits,
  filters,
  onFilterChange,
  timeScale,
  onTimeScaleChange,
  groupBy,
  onGroupByChange,
  className,
}) => {
  const authors = getUniqueAuthors(commits);
  const epics = getUniqueEpics(commits);
  const commitTypes: CommitType[] = ['FEATURE', 'WARNING', 'MILESTONE', 'BUG', 'CHORE'];
  
  const handleTypeToggle = (type: CommitType) => {
    if (filters.types.includes(type)) {
      onFilterChange({
        ...filters,
        types: filters.types.filter(t => t !== type)
      });
    } else {
      onFilterChange({
        ...filters,
        types: [...filters.types, type]
      });
    }
  };
  
  const handleAuthorToggle = (author: string) => {
    if (filters.authors.includes(author)) {
      onFilterChange({
        ...filters,
        authors: filters.authors.filter(a => a !== author)
      });
    } else {
      onFilterChange({
        ...filters,
        authors: [...filters.authors, author]
      });
    }
  };

  const handleEpicToggle = (epic: string) => {
    if (filters.epics.includes(epic)) {
      onFilterChange({
        ...filters,
        epics: filters.epics.filter(e => e !== epic)
      });
    } else {
      onFilterChange({
        ...filters,
        epics: [...filters.epics, epic]
      });
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchTerm: e.target.value
    });
  };
  
  const handleClearFilters = () => {
    onFilterChange({
      types: [],
      authors: [],
      epics: [],
      dateRange: { from: null, to: null },
      searchTerm: ''
    });
  };
  
  const activeFiltersCount = 
    filters.types.length + 
    filters.authors.length + 
    filters.epics.length +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    (filters.searchTerm ? 1 : 0);

  return (
    <div className={cn(
      'flex flex-wrap items-center gap-2 pb-4 animate-slide-down',
      className
    )}>
      {/* Search */}
      <div className="relative flex-grow max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search commits..."
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="pl-9 bg-background border-input"
        />
      </div>
      
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-background">
            <FilterIcon className="h-4 w-4 mr-2" />
            Type
            {filters.types.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                {filters.types.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Commit Types</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {commitTypes.map(type => (
              <DropdownMenuItem key={type} onSelect={(e) => {
                e.preventDefault();
                handleTypeToggle(type);
              }}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Badge className={cn(
                      'mr-2',
                      getCommitTypeColor(type)
                    )}>
                      {type}
                    </Badge>
                  </div>
                  {filters.types.includes(type) && <CheckIcon className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Epic Filter */}
      {epics.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-background">
              <LayersIcon className="h-4 w-4 mr-2" />
              Epic
              {filters.epics.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {filters.epics.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel>Epics</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {epics.map(epic => (
                <DropdownMenuItem key={epic} onSelect={(e) => {
                  e.preventDefault();
                  handleEpicToggle(epic);
                }}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <Badge className={cn(
                        'mr-2',
                        getEpicColor(epic)
                      )}>
                        {epic}
                      </Badge>
                    </div>
                    {filters.epics.includes(epic) && <CheckIcon className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Author Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-background">
            <Users className="h-4 w-4 mr-2" />
            Author
            {filters.authors.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                {filters.authors.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
          <DropdownMenuLabel>Authors</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {authors.map(author => (
              <DropdownMenuItem key={author} onSelect={(e) => {
                e.preventDefault();
                handleAuthorToggle(author);
              }}>
                <div className="flex items-center justify-between w-full">
                  <span>{author}</span>
                  {filters.authors.includes(author) && <CheckIcon className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-background">
            <ClockIcon className="h-4 w-4 mr-2" />
            Date Range
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                1
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium mb-1">From</div>
                  <p className="text-xs text-muted-foreground">
                    {filters.dateRange.from 
                      ? format(filters.dateRange.from, 'PPP') 
                      : 'No start date'}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">To</div>
                  <p className="text-xs text-muted-foreground">
                    {filters.dateRange.to 
                      ? format(filters.dateRange.to, 'PPP') 
                      : 'No end date'}
                  </p>
                </div>
              </div>
              <div className="mt-1">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from || undefined}
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined,
                  }}
                  onSelect={(range) => 
                    onFilterChange({
                      ...filters,
                      dateRange: {
                        from: range?.from || null,
                        to: range?.to || null,
                      },
                    })
                  }
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Time Scale */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-background">
            <ClockIcon className="h-4 w-4 mr-2" />
            Scale: {timeScale.charAt(0).toUpperCase() + timeScale.slice(1)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuLabel>Time Scale</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {(['day', 'week', 'month', 'quarter', 'year'] as TimeScale[]).map((scale) => (
              <DropdownMenuItem 
                key={scale}
                onSelect={() => onTimeScaleChange(scale)}
                className="flex justify-between"
              >
                <span>{scale.charAt(0).toUpperCase() + scale.slice(1)}</span>
                {timeScale === scale && <CheckIcon className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Group By */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-background">
            Group: {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuLabel>Group By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {(['type', 'author', 'date', 'epic'] as GroupBy[]).map((group) => (
              <DropdownMenuItem 
                key={group}
                onSelect={() => onGroupByChange(group)}
                className="flex justify-between"
              >
                <span>{group.charAt(0).toUpperCase() + group.slice(1)}</span>
                {groupBy === group && <CheckIcon className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="ghost" 
          onClick={handleClearFilters}
          className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <XIcon className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default FilterBar;
