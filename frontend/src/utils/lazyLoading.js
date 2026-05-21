/**
 * Lazy Loading Utility - Defers rendering and data loading for better performance
 * Uses Intersection Observer API for efficient viewport-based rendering
 */

/**
 * Lazy load component when it enters viewport
 * @param {Element} element - DOM element to observe
 * @param {Function} onVisible - Callback when element becomes visible
 * @param {Object} options - IntersectionObserver options
 */
export const lazyLoadElement = (element, onVisible, options = {}) => {
  if (!element) return null;

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onVisible(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);

  observer.observe(element);
  return observer;
};

/**
 * Batch render items with stagger for smooth animation
 * @param {Array} items - Items to render
 * @param {Function} renderCallback - Function to call for each item
 * @param {number} batchSize - Items per batch
 * @param {number} delayMs - Delay between batches
 */
export const batchRender = async (items, renderCallback, batchSize = 10, delayMs = 16) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    batch.forEach(renderCallback);
    
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
};

/**
 * Defer heavy computation to next frame
 * @param {Function} callback - Function to defer
 * @returns {number} - RequestAnimationFrame ID
 */
export const deferToNextFrame = (callback) => {
  return requestAnimationFrame(callback);
};

/**
 * Defer computation with idle callback (when browser is idle)
 * @param {Function} callback - Function to defer
 * @returns {number} - Idle callback ID
 */
export const deferToIdle = (callback) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout: 2000 });
  }
  // Fallback to setTimeout for browsers without requestIdleCallback
  return setTimeout(callback, 1);
};

/**
 * Virtual scrolling for large lists (only render visible items)
 * @param {Array} items - All items
 * @param {number} containerHeight - Height of visible container
 * @param {number} itemHeight - Height of each item
 * @param {number} scrollTop - Current scroll position
 * @returns {Object} - { visibleItems, startIndex, endIndex }
 */
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5); // Buffer of 5 items
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + 5);
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    offsetTop: startIndex * itemHeight
  };
};

/**
 * Debounce function for expensive operations
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for recurring events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request Idle Callback polyfill
 * Schedules callback to run when browser is idle
 */
if (!window.requestIdleCallback) {
  window.requestIdleCallback = function(handler) {
    const startTime = Date.now();
    return setTimeout(function() {
      handler({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - startTime));
        }
      });
    }, 1);
  };
}

if (!window.cancelIdleCallback) {
  window.cancelIdleCallback = function(id) {
    clearTimeout(id);
  };
}

export default {
  lazyLoadElement,
  batchRender,
  deferToNextFrame,
  deferToIdle,
  getVisibleItems,
  debounce,
  throttle
};
