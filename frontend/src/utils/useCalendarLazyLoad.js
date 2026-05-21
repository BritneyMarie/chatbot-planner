/**
 * useCalendarLazyLoad Hook - Optimizes calendar rendering with lazy loading
 * Defers rendering of day cells and batches updates for better performance
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { batchRender, deferToIdle } from './lazyLoading';

/**
 * Hook for lazy loading calendar elements
 * @param {boolean} enabled - Enable lazy loading
 * @param {Array} items - Items to render
 * @returns {Object} - { renderedCount, isLoading, resetRendering }
 */
export const useCalendarLazyLoad = (enabled = true, items = []) => {
  const [renderedCount, setRenderedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const renderingRef = useRef(null);

  const startLazyRender = useCallback(async () => {
    if (!enabled || items.length === 0) return;

    setIsLoading(true);
    
    // Cancel any previous rendering
    if (renderingRef.current) {
      clearTimeout(renderingRef.current);
    }

    // Defer batch rendering to idle time
    renderingRef.current = deferToIdle(async () => {
      try {
        const batchSize = Math.ceil(items.length / 10); // Render in 10 batches
        
        await batchRender(
          items,
          (item, index) => {
            setRenderedCount(prev => prev + 1);
          },
          batchSize,
          16 // ~60fps
        );
      } finally {
        setIsLoading(false);
      }
    });
  }, [enabled, items]);

  useEffect(() => {
    setRenderedCount(0);
    startLazyRender();

    return () => {
      if (renderingRef.current) {
        clearTimeout(renderingRef.current);
      }
    };
  }, [startLazyRender]);

  const resetRendering = useCallback(() => {
    setRenderedCount(0);
    if (renderingRef.current) {
      clearTimeout(renderingRef.current);
    }
  }, []);

  return {
    renderedCount,
    totalCount: items.length,
    isLoading,
    progress: items.length > 0 ? (renderedCount / items.length) * 100 : 0,
    resetRendering
  };
};

/**
 * useEventBatching Hook - Batches event rendering for large event lists
 * Prevents rendering all events at once in month view
 * @param {Array} events - All events
 * @param {number} maxVisiblePerDay - Max events to show per day
 * @returns {Object} - { batchedEvents, showMoreCount }
 */
export const useEventBatching = (events = [], maxVisiblePerDay = 2) => {
  const [batchedEvents, setBatchedEvents] = useState([]);

  useEffect(() => {
    if (events.length === 0) {
      setBatchedEvents([]);
      return;
    }

    // Batch events - only show first N per day, rest show as "+X more"
    const batched = events.map(event => {
      if (Array.isArray(event)) {
        return {
          visible: event.slice(0, maxVisiblePerDay),
          hidden: event.length > maxVisiblePerDay ? event.length - maxVisiblePerDay : 0
        };
      }
      return event;
    });

    setBatchedEvents(batched);
  }, [events, maxVisiblePerDay]);

  return { batchedEvents };
};

/**
 * useScrollLazyLoad Hook - Lazy load items as user scrolls
 * @param {Array} items - All items
 * @param {number} initialBatch - Initial items to load
 * @param {number} batchIncrement - Items to load per scroll
 * @returns {Object} - { visibleItems, loadMore, hasMore }
 */
export const useScrollLazyLoad = (items = [], initialBatch = 20, batchIncrement = 10) => {
  const [visibleCount, setVisibleCount] = useState(initialBatch);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + batchIncrement, items.length));
  }, [items.length, batchIncrement]);

  const handleScroll = useCallback((e) => {
    const element = e.target;
    if (element.scrollHeight - element.scrollTop <= 500) { // 500px from bottom
      loadMore();
    }
  }, [loadMore]);

  return {
    visibleItems: items.slice(0, visibleCount),
    loadMore,
    hasMore: visibleCount < items.length,
    onScroll: handleScroll
  };
};

export default {
  useCalendarLazyLoad,
  useEventBatching,
  useScrollLazyLoad
};
