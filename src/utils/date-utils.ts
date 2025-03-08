
import { format, parse, addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
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
 * Calculates the time range for the timeline
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
  let start = firstCommitDate;
  let end = lastCommitDate;

  switch (scale) {
    case 'day':
      start = addDays(firstCommitDate, -1);
      end = addDays(lastCommitDate, 1);
      break;
    case 'week':
      start = addDays(firstCommitDate, -7);
      end = addDays(lastCommitDate, 7);
      break;
    case 'month':
      start = addMonths(firstCommitDate, -1);
      end = addMonths(lastCommitDate, 1);
      break;
    case 'quarter':
      start = addMonths(firstCommitDate, -3);
      end = addMonths(lastCommitDate, 3);
      break;
    case 'year':
      start = addYears(firstCommitDate, -1);
      end = addYears(lastCommitDate, 1);
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
 * Calculates the position of a commit on the timeline
 */
export const calculateCommitPosition = (
  commitDate: string,
  timeStart: Date,
  timeEnd: Date,
  scale: TimeScale
): number => {
  const date = new Date(commitDate);
  const totalDuration = getDurationByScale(timeStart, timeEnd, scale);
  const commitDuration = getDurationByScale(timeStart, date, scale);
  
  return (commitDuration / totalDuration) * 100;
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
