import { format, parse, addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, isBefore, isAfter, isSameDay, isSameWeek, isSameMonth, isSameQuarter, isSameYear, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfQuarter, endOfYear, differenceInMilliseconds, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { TimeScale } from '@/types';

/**
 * Formats a date string into a readable format
 */
export const formatDate = (dateString: string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    const date = new Date(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Calculates the time range for the timeline with proper padding
 */
export const calculateTimeRange = (commits: { date: string }[], scale: TimeScale) => {
  if (!commits.length) return { start: new Date(), end: new Date() };

  // Sort commits by date
  const sortedCommits = [...commits].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get first and last commit dates
  const firstCommitDate = new Date(sortedCommits[0].date);
  const lastCommitDate = new Date(sortedCommits[sortedCommits.length - 1].date);

  // Add padding to the start and end dates based on scale
  let start: Date, end: Date;

  switch (scale) {
    case 'day':
      start = subDays(firstCommitDate, 3);
      end = addDays(lastCommitDate, 3);
      break;
    case 'week':
      start = subWeeks(firstCommitDate, 1);
      end = addWeeks(lastCommitDate, 1);
      break;
    case 'month':
      start = subMonths(firstCommitDate, 1);
      end = addMonths(lastCommitDate, 1);
      break;
    case 'quarter':
      start = subMonths(firstCommitDate, 3);
      end = addMonths(lastCommitDate, 3);
      break;
    case 'year':
      start = subYears(firstCommitDate, 1);
      end = addYears(lastCommitDate, 1);
      break;
    default:
      start = subWeeks(firstCommitDate, 1);
      end = addWeeks(lastCommitDate, 1);
  }

  // Ensure we get clean intervals by snapping to the start/end of the appropriate period
  switch (scale) {
    case 'day':
      start = startOfDay(start);
      end = endOfDay(end);
      break;
    case 'week':
      start = startOfWeek(start);
      end = endOfWeek(end);
      break;
    case 'month':
      start = startOfMonth(start);
      end = endOfMonth(end);
      break;
    case 'quarter':
      start = startOfQuarter(start);
      end = endOfQuarter(end);
      break;
    case 'year':
      start = startOfYear(start);
      end = endOfYear(end);
      break;
  }

  return { start, end };
};

/**
 * Generates time intervals for the timeline
 */
export const generateTimeIntervals = (start: Date, end: Date, scale: TimeScale) => {
  const intervals = [];
  let current = new Date(start);

  while (current <= end) {
    intervals.push(new Date(current));
    
    switch (scale) {
      case 'day':
        current = addDays(current, 1);
        break;
      case 'week':
        current = addWeeks(current, 1);
        break;
      case 'month':
        current = addMonths(current, 1);
        break;
      case 'quarter':
        current = addMonths(current, 3);
        break;
      case 'year':
        current = addYears(current, 1);
        break;
    }
  }

  return intervals;
};

/**
 * Formats a time interval for display in the timeline
 */
export const formatTimeInterval = (date: Date, scale: TimeScale): string => {
  switch (scale) {
    case 'day':
      return format(date, 'MMM d');
    case 'week':
      return `Week of ${format(date, 'MMM d')}`;
    case 'month':
      return format(date, 'MMM yyyy');
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${format(date, 'yyyy')}`;
    case 'year':
      return format(date, 'yyyy');
    default:
      return format(date, 'MMM d, yyyy');
  }
};

/**
 * Determines whether a commit falls within a specific time interval based on the scale
 */
export const isCommitInInterval = (commitDate: string, intervalStart: Date, intervalEnd: Date, scale: TimeScale): boolean => {
  const date = new Date(commitDate);
  
  // Transform dates based on scale for proper comparison
  const commitDateStart = getScaleStart(date, scale);
  const intervalStartFormatted = getScaleStart(intervalStart, scale);
  const intervalEndFormatted = getScaleEnd(intervalEnd, scale);
  
  // Check if commit is within the interval
  return (
    (isAfter(commitDateStart, intervalStartFormatted) || isSameScalePeriod(date, intervalStart, scale)) && 
    (isBefore(commitDateStart, intervalEndFormatted) || isSameScalePeriod(date, intervalEnd, scale))
  );
};

/**
 * Get the start of a time period based on scale
 */
export const getScaleStart = (date: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date);
    case 'month':
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    case 'year':
      return startOfYear(date);
    default:
      return startOfDay(date);
  }
};

/**
 * Get the end of a time period based on scale
 */
export const getScaleEnd = (date: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return endOfDay(date);
    case 'week':
      return endOfWeek(date);
    case 'month':
      return endOfMonth(date);
    case 'quarter':
      return endOfQuarter(date);
    case 'year':
      return endOfYear(date);
    default:
      return endOfDay(date);
  }
};

/**
 * Check if two dates are in the same time period based on scale
 */
export const isSameScalePeriod = (date1: Date, date2: Date, scale: TimeScale): boolean => {
  switch (scale) {
    case 'day':
      return isSameDay(date1, date2);
    case 'week':
      return isSameWeek(date1, date2);
    case 'month':
      return isSameMonth(date1, date2);
    case 'quarter':
      return isSameQuarter(date1, date2);
    case 'year':
      return isSameYear(date1, date2);
    default:
      return isSameDay(date1, date2);
  }
};

/**
 * Get the interval index for a commit (which column it should appear in)
 */
export const getCommitIntervalIndex = (commitDate: string, intervals: Date[], scale: TimeScale): number => {
  const date = new Date(commitDate);
  
  for (let i = 0; i < intervals.length - 1; i++) {
    if (isCommitInInterval(commitDate, intervals[i], intervals[i + 1], scale)) {
      return i;
    }
  }
  
  // Default to the last interval if no match is found
  return intervals.length - 1;
};

/**
 * Calculates the position of a commit on the timeline
 */
export const calculateCommitPosition = (
  commitDate: string, 
  timeStart: Date,
  timeEnd: Date,
  scale: TimeScale,
  intervals: Date[]
): number => {
  const date = new Date(commitDate);
  
  // If we have intervals, use them for more accurate positioning
  if (intervals.length > 1) {
    // Find which interval the commit falls into
    for (let i = 0; i < intervals.length - 1; i++) {
      const start = intervals[i];
      const end = intervals[i + 1];
      
      if ((date >= start && date < end) || (i === intervals.length - 2 && date >= start)) {
        const intervalStart = getScaleStart(start, scale);
        const intervalEnd = getScaleEnd(end, scale);
        
        // Calculate the position within the interval
        const totalIntervalDuration = differenceInMilliseconds(intervalEnd, intervalStart);
        const commitPosition = differenceInMilliseconds(date, intervalStart);
        
        // Calculate position percentage within the interval (0-100)
        const percentageInInterval = Math.min(100, Math.max(0, 
          totalIntervalDuration > 0 ? (commitPosition / totalIntervalDuration) * 100 : 50
        ));
        
        // Map to overall timeline position
        return i * (100 / (intervals.length - 1)) + 
               (percentageInInterval * (100 / (intervals.length - 1)) / 100);
      }
    }
  }
  
  // Fallback to simple linear mapping
  const totalDuration = differenceInMilliseconds(timeEnd, timeStart);
  const commitPosition = differenceInMilliseconds(date, timeStart);
  
  return Math.min(100, Math.max(0, 
    totalDuration > 0 ? (commitPosition / totalDuration) * 100 : 50
  ));
};

/**
 * Gets the duration between two dates based on the scale
 */
const getDurationByScale = (start: Date, end: Date, scale: TimeScale): number => {
  switch (scale) {
    case 'day':
      return Math.max(1, differenceInDays(end, start));
    case 'week':
      return Math.max(1, differenceInWeeks(end, start));
    case 'month':
      return Math.max(1, differenceInMonths(end, start));
    case 'quarter':
      return Math.max(1, differenceInMonths(end, start) / 3);
    case 'year':
      return Math.max(1, differenceInYears(end, start));
    default:
      return Math.max(1, differenceInDays(end, start));
  }
};
