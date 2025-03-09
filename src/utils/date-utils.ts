import { format, parse, addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, isBefore, isAfter, isSameDay, isSameWeek, isSameMonth, isSameQuarter, isSameYear, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfQuarter, endOfYear, differenceInMilliseconds } from 'date-fns';
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
 * Determines if there's a significant gap between dates based on time scale
 */
export const isSignificantGap = (date1: Date, date2: Date, scale: TimeScale): boolean => {
  switch (scale) {
    case 'day':
      return differenceInDays(date2, date1) > 14; // More than 2 weeks
    case 'week':
      return differenceInWeeks(date2, date1) > 6; // More than 6 weeks
    case 'month':
      return differenceInMonths(date2, date1) > 3; // More than 3 months
    case 'quarter':
      return differenceInMonths(date2, date1) > 6; // More than 6 months
    case 'year':
      return differenceInYears(date2, date1) > 1; // More than 1 year
    default:
      return false;
  }
};

/**
 * Format a date range for display
 */
export const formatDateRange = (start: Date, end: Date, scale: TimeScale): string => {
  switch (scale) {
    case 'day':
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    case 'week':
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    case 'month':
      return `${format(start, 'MMM yyyy')} - ${format(end, 'MMM yyyy')}`;
    case 'quarter': {
      const startQuarter = Math.floor(start.getMonth() / 3) + 1;
      const endQuarter = Math.floor(end.getMonth() / 3) + 1;
      return `Q${startQuarter} ${format(start, 'yyyy')} - Q${endQuarter} ${format(end, 'yyyy')}`;
    }
    case 'year':
      return `${format(start, 'yyyy')} - ${format(end, 'yyyy')}`;
    default:
      return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
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
 * Generates time intervals for the timeline, consolidating gaps
 */
export const generateTimeIntervals = (start: Date, end: Date, scale: TimeScale, commits: { date: string }[] = []) => {
  const intervals = [];
  let current = new Date(start);
  
  // Sort commits by date
  const sortedDates = [...commits]
    .map(commit => new Date(commit.date))
    .sort((a, b) => a.getTime() - b.getTime());
  
  // Add the start date to the sorted dates if it's not already there
  if (sortedDates.length === 0 || start.getTime() !== sortedDates[0].getTime()) {
    sortedDates.unshift(start);
  }
  
  // Add the end date to the sorted dates if it's not already there
  if (end.getTime() !== sortedDates[sortedDates.length - 1].getTime()) {
    sortedDates.push(end);
  }
  
  // Generate intervals, consolidating large gaps
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = sortedDates[i];
    const nextDate = sortedDates[i + 1];
    
    intervals.push(new Date(currentDate));
    
    // Check if there's a significant gap between this date and the next
    if (isSignificantGap(currentDate, nextDate, scale)) {
      // Add a consolidated "gap" interval
      intervals.push({
        isGap: true,
        start: currentDate,
        end: nextDate,
        label: formatDateRange(currentDate, nextDate, scale)
      });
      
      // Skip to the next date
      current = new Date(nextDate);
    } else {
      // Add regular intervals between the dates
      current = new Date(currentDate);
      
      while (current < nextDate) {
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
        
        if (current < nextDate) {
          intervals.push(new Date(current));
        }
      }
    }
  }
  
  // Ensure the last date is in the intervals
  if (intervals[intervals.length - 1] !== end) {
    intervals.push(new Date(end));
  }
  
  return intervals;
};

/**
 * Formats a time interval for display in the timeline
 */
export const formatTimeInterval = (interval: Date | any, scale: TimeScale): string => {
  // If this is a gap interval, return its label
  if (interval.isGap) {
    return interval.label;
  }
  
  // Otherwise format regular date
  switch (scale) {
    case 'day':
      return format(interval, 'MMM d');
    case 'week':
      return `Week of ${format(interval, 'MMM d')}`;
    case 'month':
      return format(interval, 'MMM yyyy');
    case 'quarter':
      const quarter = Math.floor(interval.getMonth() / 3) + 1;
      return `Q${quarter} ${format(interval, 'yyyy')}`;
    case 'year':
      return format(interval, 'yyyy');
    default:
      return format(interval, 'MMM d, yyyy');
  }
};

/**
 * Determines whether a commit falls within a specific time interval based on the scale
 */
export const isCommitInInterval = (commitDate: string, intervalStart: Date, intervalEnd: Date, scale: TimeScale): boolean => {
  const date = new Date(commitDate);
  
  // Get the start of the date unit based on scale for proper comparison
  const commitDateStart = getScaleStart(date, scale);
  
  // For the day scale, use exact day comparison instead of ranges
  if (scale === 'day') {
    return isSameDay(commitDateStart, intervalStart);
  }
  
  // For other scales, check if the commit falls within the correct interval
  const intervalStartFormatted = getScaleStart(intervalStart, scale);
  const nextIntervalStart = getScaleStart(intervalEnd, scale);
  
  return (
    (isSameScalePeriod(date, intervalStart, scale)) || 
    (isAfter(commitDateStart, intervalStartFormatted) && isBefore(commitDateStart, nextIntervalStart))
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
export const getCommitIntervalIndex = (commitDate: Date, intervals: (Date | any)[], scale: TimeScale): number => {
  // For 'day' scale, look for the exact matching day
  if (scale === 'day') {
    for (let i = 0; i < intervals.length; i++) {
      // Skip gap intervals for exact matching
      if (intervals[i].isGap) continue;
      
      if (isSameDay(getScaleStart(commitDate, 'day'), getScaleStart(intervals[i], 'day'))) {
        return i;
      }
    }
    return -1;
  }
  
  // For other scales, find the correct interval by comparing the scale-specific periods
  for (let i = 0; i < intervals.length; i++) {
    // Skip gap intervals for exact matching
    if (intervals[i].isGap) continue;
    
    if (isSameScalePeriod(commitDate, intervals[i], scale)) {
      return i;
    }
  }
  
  // Handle gap intervals - check if commit is within a gap
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i].isGap) {
      if (isAfter(commitDate, intervals[i].start) && isBefore(commitDate, intervals[i].end)) {
        return i;
      }
    }
  }
  
  // If we can't find an exact match, find the closest previous interval
  // This ensures commits are placed in the correct column
  const commitTimeStart = getScaleStart(commitDate, scale);
  for (let i = 1; i < intervals.length; i++) {
    // Skip gap intervals
    if (intervals[i].isGap || intervals[i-1].isGap) continue;
    
    const currentIntervalStart = getScaleStart(intervals[i], scale);
    const previousIntervalStart = getScaleStart(intervals[i-1], scale);
    
    if (isAfter(commitTimeStart, previousIntervalStart) && 
        (isBefore(commitTimeStart, currentIntervalStart) || isSameScalePeriod(commitDate, intervals[i-1], scale))) {
      return i - 1;
    }
  }
  
  // If still no match (e.g., after the last interval), use the closest interval based on date
  const commitTime = commitDate.getTime();
  let closestIndex = 0;
  let closestDiff = Infinity;
  
  for (let i = 0; i < intervals.length; i++) {
    // Skip gap intervals for distance calculation
    if (intervals[i].isGap) continue;
    
    const diff = Math.abs(commitTime - intervals[i].getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  
  return closestIndex;
};

/**
 * Calculates the position of a commit on the timeline
 */
export const calculateCommitPosition = (
  commitDate: string, 
  timeStart: Date,
  timeEnd: Date,
  scale: TimeScale,
  intervals: (Date | any)[]
): number => {
  // Find which interval the commit falls into
  const intervalIndex = getCommitIntervalIndex(new Date(commitDate), intervals, scale);
  
  // Ensure we don't go out of bounds
  if (intervalIndex < 0) return 0;
  if (intervalIndex >= intervals.length - 1) return 100;
  
  // Calculate the interval width as percentage
  const intervalWidth = 100 / (intervals.length - 1);
  
  // Handle gap intervals differently
  if (intervals[intervalIndex].isGap) {
    return intervalIndex * intervalWidth + (intervalWidth / 2); // Center in gap
  }
  
  // Get the actual date and interval boundaries for precise positioning
  const date = new Date(commitDate);
  const intervalStart = getScaleStart(intervals[intervalIndex], scale);
  const intervalEnd = getScaleEnd(intervals[intervalIndex], scale);
  
  // Calculate the position as a percentage within the interval
  const totalIntervalDuration = differenceInMilliseconds(intervalEnd, intervalStart);
  const commitPositionInInterval = differenceInMilliseconds(date, intervalStart);
  
  // Calculate percentage position within the interval (0-1)
  const percentageWithinInterval = totalIntervalDuration > 0 
    ? commitPositionInInterval / totalIntervalDuration 
    : 0.5; // Default to middle if interval has no duration
  
  // Clamp the percentage to stay within reasonable bounds (20%-80% of the column width)
  const clampedPercentage = Math.max(0.2, Math.min(0.8, percentageWithinInterval));
  
  // Calculate final position
  const position = intervalIndex * intervalWidth + (intervalWidth * clampedPercentage);
  
  return position;
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
