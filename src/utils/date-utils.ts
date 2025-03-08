import { format, parse, addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, isSameYear, isSameMonth, isSameQuarter, isSameWeek, isSameDay, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
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
 * Checks if a date is within a specific interval on the timeline
 */
export const isDateInTimeInterval = (date: Date, intervalStart: Date, intervalEnd: Date | undefined, scale: TimeScale): boolean => {
  if (!intervalEnd) {
    // If there's no end interval, compare based on the scale unit
    switch (scale) {
      case 'day':
        return isSameDay(date, intervalStart);
      case 'week':
        return isSameWeek(date, intervalStart);
      case 'month':
        return isSameMonth(date, intervalStart);
      case 'quarter':
        return isSameQuarter(date, intervalStart);
      case 'year':
        return isSameYear(date, intervalStart);
      default:
        return isSameDay(date, intervalStart);
    }
  }
  
  // Otherwise check if the date is within the interval
  switch (scale) {
    case 'day':
      return isWithinInterval(date, { start: startOfDay(intervalStart), end: endOfDay(intervalEnd) });
    case 'week':
      return isWithinInterval(date, { start: startOfWeek(intervalStart), end: endOfWeek(intervalEnd) });
    case 'month':
      return isWithinInterval(date, { start: startOfMonth(intervalStart), end: endOfMonth(intervalEnd) });
    case 'quarter':
      return isWithinInterval(date, { start: startOfQuarter(intervalStart), end: endOfQuarter(intervalEnd) });
    case 'year':
      return isWithinInterval(date, { start: startOfYear(intervalStart), end: endOfYear(intervalEnd) });
    default:
      return isWithinInterval(date, { start: intervalStart, end: intervalEnd });
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
  
  // Calculate position as a percentage, constrained between 0-100
  return Math.max(0, Math.min(100, (commitDuration / totalDuration) * 100));
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

/**
 * Finds which column a commit belongs to based on its date
 */
export const findCommitColumn = (
  commitDate: string, 
  timeIntervals: Date[], 
  scale: TimeScale
): number => {
  const date = new Date(commitDate);
  
  // Find the column index where this commit belongs
  for (let i = 0; i < timeIntervals.length; i++) {
    const currentInterval = timeIntervals[i];
    const nextInterval = i < timeIntervals.length - 1 ? timeIntervals[i + 1] : null;
    
    if (nextInterval) {
      // Check if commit is between current interval and next interval
      if (isDateInTimeInterval(date, currentInterval, nextInterval, scale)) {
        return i;
      }
    } else {
      // For the last interval
      if (isDateInTimeInterval(date, currentInterval, undefined, scale)) {
        return i;
      }
    }
  }
  
  // Fallback to the first column if we can't determine
  return 0;
};
