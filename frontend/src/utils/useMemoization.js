/**
 * Memoization Utilities for React Components
 * Prevents unnecessary re-renders and expensive computations
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * useMemoComputed - Memoize expensive calculations
 * Only recalculates when dependencies change
 * 
 * @param {Function} computeFn - Function that performs calculation
 * @param {Array} dependencies - Dependencies array
 * @returns {any} - Memoized result
 */
export const useMemoComputed = (computeFn, dependencies = []) => {
  return useMemo(() => computeFn(), dependencies);
};

/**
 * useCallbackMemoized - Memoize callback functions
 * Prevents child components from re-rendering due to function reference changes
 * 
 * @param {Function} callback - Function to memoize
 * @param {Array} dependencies - Dependencies array
 * @returns {Function} - Memoized callback
 */
export const useCallbackMemoized = (callback, dependencies = []) => {
  return useCallback(callback, dependencies);
};

/**
 * Filter events by date - expensive operation
 * Memoized to prevent re-filtering on every render
 */
export const useMemoFilteredEvents = (events = [], filters = {}) => {
  return useMemo(() => {
    console.log('📊 Filtering events...');
    
    return events.filter(event => {
      // Check color filter
      if (filters.color && event.color !== filters.color) {
        return false;
      }

      // Check search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(searchLower);
        const matchesDesc = event.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      // Check date range
      if (filters.startDate && new Date(event.start_time) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(event.end_time) > new Date(filters.endDate)) {
        return false;
      }

      // Check recurring filter
      if (filters.recurring !== undefined && event.recurring !== filters.recurring) {
        return false;
      }

      return true;
    });
  }, [events, filters.color, filters.search, filters.startDate, filters.endDate, filters.recurring]);
};

/**
 * Sort events by date - expensive for large lists
 * Memoized to prevent re-sorting on every render
 */
export const useMemoSortedEvents = (events = [], sortBy = 'start_time') => {
  return useMemo(() => {
    console.log('📊 Sorting events...');
    
    const sorted = [...events].sort((a, b) => {
      switch (sortBy) {
        case 'start_time':
          return new Date(a.start_time) - new Date(b.start_time);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'color':
          return (a.color || '').localeCompare(b.color || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [events, sortBy]);
};

/**
 * Group events by date
 * Expensive for large datasets
 * Memoized for performance
 */
export const useMemoGroupedEvents = (events = []) => {
  return useMemo(() => {
    console.log('📊 Grouping events by date...');
    
    const grouped = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.start_time).toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);
};

/**
 * Calculate calendar day cells
 * Math-heavy operation, should be memoized
 */
export const useMemoCalendarDays = (year, month) => {
  return useMemo(() => {
    console.log('📊 Calculating calendar days...');
    
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Days from next month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    // Generate all days
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [year, month]);
};

/**
 * Check if date is in range
 * Simple check but used frequently, worth memoizing
 */
export const useCheckDateInRange = () => {
  return useCallback((date, startDate, endDate) => {
    const d = new Date(date).getTime();
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return d >= s && d <= e;
  }, []);
};

/**
 * Debounced callback
 * Delays execution until value stops changing
 */
export const useDebouncedCallback = (callback, delay = 300, dependencies = []) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...dependencies]);
};

/**
 * Throttled callback
 * Limits execution frequency
 */
export const useThrottledCallback = (callback, delay = 300, dependencies = []) => {
  const lastRunRef = useRef(Date.now());

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRunRef.current >= delay) {
      callback(...args);
      lastRunRef.current = now;
    }
  }, [callback, delay, ...dependencies]);
};

/**
 * Memoized array comparison
 * Check if two arrays are equal (shallow)
 */
export const useArrayEqual = (array1, array2) => {
  return useMemo(() => {
    if (!Array.isArray(array1) || !Array.isArray(array2)) {
      return false;
    }
    
    if (array1.length !== array2.length) {
      return false;
    }
    
    return array1.every((item, index) => item === array2[index]);
  }, [array1, array2]);
};

/**
 * Memoized object comparison
 * Check if two objects are equal (shallow)
 */
export const useObjectEqual = (obj1, obj2) => {
  return useMemo(() => {
    const keys1 = Object.keys(obj1 || {});
    const keys2 = Object.keys(obj2 || {});
    
    if (keys1.length !== keys2.length) {
      return false;
    }
    
    return keys1.every(key => obj1[key] === obj2[key]);
  }, [obj1, obj2]);
};

/**
 * Previous value hook
 * Remember previous value for comparison
 */
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Only execute callback on value change
 * Skip execution on initial render
 */
export const useDidUpdate = (callback, dependencies = []) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    callback();
  }, dependencies);
};

export default {
  useMemoComputed,
  useCallbackMemoized,
  useMemoFilteredEvents,
  useMemoSortedEvents,
  useMemoGroupedEvents,
  useMemoCalendarDays,
  useCheckDateInRange,
  useDebouncedCallback,
  useThrottledCallback,
  useArrayEqual,
  useObjectEqual,
  usePrevious,
  useDidUpdate
};
