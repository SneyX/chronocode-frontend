
import { format, parse, addDays, addWeeks, addMonths, addYears, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, isBefore, isAfter, isSameDay, isSameWeek, isSameMonth, isSameQuarter, isSameYear, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfDay, endOfWeek, endOfMonth, endOfQuarter, endOfYear, differenceInMilliseconds } from 'date-fns';
import { TimeScale, Commit } from '@/types';

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
 * Generates time intervals for the timeline and filters out intervals without commits
 */
export const generateTimeIntervals = (start: Date, end: Date, scale: TimeScale, commits: Commit[] = []) => {
  // First generate all possible intervals
  const allIntervals = [];
  let current = new Date(start);

  while (current <= end) {
    allIntervals.push(new Date(current));
    
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

  // If no commits to check against, return all intervals
  if (!commits.length) return allIntervals;

  // Create a map to track which intervals have commits
  const intervalsWithCommits = new Map<number, boolean>();
  
  // Mark intervals that contain commits
  commits.forEach(commit => {
    const commitDate = new Date(commit.date);
    
    allIntervals.forEach((interval, index) => {
      const nextInterval = allIntervals[index + 1] || new Date(3000, 0, 1); // Far future date as fallback
      
      // Check if the commit falls in this interval
      if (
        (isAfter(commitDate, interval) || isSameScalePeriod(commitDate, interval, scale)) && 
        (isBefore(commitDate, nextInterval) || (index === allIntervals.length - 1))
      ) {
        intervalsWithCommits.set(index, true);
      }
    });
  });
  
  // Include intervals with commits and their adjacent intervals
  // (to avoid visual jumps in the timeline)
  const filteredIntervals: Date[] = [];
  let addingAdjacent = false;
  
  allIntervals.forEach((interval, index) => {
    const hasCommits = intervalsWithCommits.has(index);
    const prevHasCommits = index > 0 && intervalsWithCommits.has(index - 1);
    const nextHasCommits = index < allIntervals.length - 1 && intervalsWithCommits.has(index + 1);
    
    // Always include first and last intervals
    if (index === 0 || index === allIntervals.length - 1) {
      filteredIntervals.push(interval);
      return;
    }
    
    // Include intervals with commits
    if (hasCommits) {
      filteredIntervals.push(interval);
      addingAdjacent = false;
      return;
    }
    
    // Include intervals adjacent to intervals with commits
    if (prevHasCommits || nextHasCommits) {
      filteredIntervals.push(interval);
      addingAdjacent = false;
      return;
    }
    
    // For long gaps with no commits, add just one interval as a placeholder
    const prevIntervalAdded = filteredIntervals[filteredIntervals.length - 1];
    if (prevIntervalAdded && !addingAdjacent) {
      filteredIntervals.push(interval);
      addingAdjacent = true;
    }
  });
  
  // Return the filtered list of intervals, ensuring uniqueness
  return [...new Set(filteredIntervals)].sort((a, b) => a.getTime() - b.getTime());
};

/**
 * Formats a time interval for display in the timeline
 */
export const formatTimeInterval = (date: Date, scale: TimeScale, isGap?: boolean): string => {
  if (isGap) {
    return "...";
  }
  
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
export const getCommitIntervalIndex = (commitDate: Date, intervals: Date[], scale: TimeScale): number => {
  // Safety check: if intervals array is empty, return -1
  if (!intervals || intervals.length === 0) {
    return -1;
  }
  
  // For 'day' scale, look for the exact matching day
  if (scale === 'day') {
    for (let i = 0; i < intervals.length; i++) {
      if (intervals[i] && isSameDay(getScaleStart(commitDate, 'day'), getScaleStart(intervals[i], 'day'))) {
        return i;
      }
    }
  }
  
  // For other scales, find the correct interval by comparing the scale-specific periods
  for (let i = 0; i < intervals.length; i++) {
    if (intervals[i] && isSameScalePeriod(commitDate, intervals[i], scale)) {
      return i;
    }
  }
  
  // If we can't find an exact match, find the closest previous interval
  // This ensures commits are placed in the correct column
  for (let i = 0; i < intervals.length - 1; i++) {
    const currentInterval = intervals[i];
    const nextInterval = intervals[i + 1];
    
    if (currentInterval && nextInterval &&
      (isAfter(commitDate, currentInterval) || isSameScalePeriod(commitDate, currentInterval, scale)) && 
      isBefore(commitDate, nextInterval)
    ) {
      return i;
    }
  }
  
  // If the date is after the last interval, place it in the last interval
  if (intervals.length > 0 && isAfter(commitDate, intervals[intervals.length - 1])) {
    return intervals.length - 1;
  }
  
  // Default to the closest interval
  if (intervals.length > 0) {
    const commitTime = commitDate.getTime();
    let closestIndex = 0;
    let closestDiff = Math.abs(commitTime - intervals[0].getTime());
    
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i]) {
        const diff = Math.abs(commitTime - intervals[i].getTime());
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
    }
    
    return closestIndex;
  }
  
  return -1; // Fallback if no intervals match
};

/**
 * Determines if an interval represents a gap in the timeline
 */
export const isGapInterval = (interval: Date, allIntervals: Date[], scale: TimeScale): boolean => {
  if (!allIntervals || allIntervals.length <= 2) return false;
  
  const index = allIntervals.findIndex(i => i && interval && i.getTime() === interval.getTime());
  if (index <= 0 || index >= allIntervals.length - 1) return false;
  
  const prevInterval = allIntervals[index - 1];
  if (!prevInterval || !interval) return false;
  
  const expectedPrevInterval = getPreviousInterval(interval, scale);
  
  // If the previous interval in our list is not the expected previous interval
  // based on the scale, then this represents a gap
  return prevInterval.getTime() !== expectedPrevInterval.getTime();
};

/**
 * Gets the previous interval based on scale
 */
const getPreviousInterval = (interval: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return addDays(interval, -1);
    case 'week':
      return addWeeks(interval, -1);
    case 'month':
      return addMonths(interval, -1);
    case 'quarter':
      return addMonths(interval, -3);
    case 'year':
      return addYears(interval, -1);
    default:
      return addDays(interval, -1);
  }
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
  // Safety check for empty intervals
  if (!intervals || intervals.length === 0) {
    return 0;
  }
  
  // Find which interval the commit falls into
  const intervalIndex = getCommitIntervalIndex(new Date(commitDate), intervals, scale);
  
  // Ensure we don't go out of bounds
  if (intervalIndex < 0) return 0;
  if (intervalIndex >= intervals.length - 1) return 100;
  
  // Calculate the interval width as percentage
  const intervalWidth = 100 / (intervals.length - 1);
  
  // Get the actual date and interval boundaries for precise positioning
  const date = new Date(commitDate);
  const intervalStart = intervals[intervalIndex] ? getScaleStart(intervals[intervalIndex], scale) : timeStart;
  const intervalEnd = intervals[intervalIndex] ? getScaleEnd(intervals[intervalIndex], scale) : timeEnd;
  
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
