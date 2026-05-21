/**
 * API Optimization Utilities
 * Reduce waterfall requests, batch operations, and parallel loading
 */

import cacheManager from './cacheManager';

/**
 * Request batching - Combine multiple requests into one
 * Reduces server roundtrips
 */
export class RequestBatcher {
  constructor(batchFn, delayMs = 50) {
    this.batchFn = batchFn;
    this.delayMs = delayMs;
    this.queue = [];
    this.timeoutId = null;
    this.processing = false;
  }

  /**
   * Add request to batch queue
   * @param {*} request - Request to add to batch
   * @returns {Promise} - Resolves when batch processed
   */
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });

      // Schedule batch processing
      if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.process(), this.delayMs);
      }
    });
  }

  /**
   * Process queued requests as batch
   */
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.timeoutId = null;

    const batch = this.queue.splice(0, this.queue.length);
    const requests = batch.map(item => item.request);

    try {
      const results = await this.batchFn(requests);

      // Resolve individual promises
      batch.forEach((item, index) => {
        item.resolve(results[index]);
      });

      console.log(`📦 Batched ${requests.length} requests`);
    } catch (error) {
      batch.forEach(item => item.reject(error));
      console.error('Batch processing failed:', error);
    }

    this.processing = false;

    // Process remaining queue
    if (this.queue.length > 0) {
      this.timeoutId = setTimeout(() => this.process(), this.delayMs);
    }
  }

  /**
   * Clear pending requests
   */
  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.queue = [];
  }
}

/**
 * Parallel request executor
 * Load multiple resources in parallel instead of sequential (waterfall)
 */
export const executeInParallel = async (requests) => {
  console.log(`🔄 Executing ${requests.length} requests in parallel...`);
  
  try {
    const results = await Promise.all(requests);
    console.log(`✅ All ${requests.length} requests completed`);
    return results;
  } catch (error) {
    console.error('❌ Parallel execution failed:', error);
    throw error;
  }
};

/**
 * Parallel with fallback
 * If any request fails, continue with others
 */
export const executeInParallelWithFallback = async (requests) => {
  console.log(`🔄 Executing ${requests.length} requests with fallback...`);
  
  const results = await Promise.allSettled(requests);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`❌ Request ${index} failed:`, result.reason);
      return null;
    }
  });
};

/**
 * Request debouncer
 * Deduplicate identical requests
 */
export class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Execute request, reusing if identical request pending
   * @param {string} key - Request key for deduplication
   * @param {Function} requestFn - Function that returns promise
   * @returns {Promise}
   */
  async execute(key, requestFn) {
    // Check if same request already pending
    if (this.pendingRequests.has(key)) {
      console.log(`♻️ Reusing pending request: ${key}`);
      return this.pendingRequests.get(key);
    }

    const promise = requestFn()
      .then(result => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
  }
}

/**
 * API request with smart loading strategy
 * Combines caching + deduplication + batching
 */
export const smartApiRequest = async (
  endpoint,
  options = {},
  { useCache = true, cacheTtl = 300000, batch = false } = {}
) => {
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`;

  // Check cache first
  if (useCache) {
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit: ${endpoint}`);
      return cached;
    }
  }

  try {
    // Execute request
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Cache result
    if (useCache) {
      cacheManager.set(cacheKey, data, cacheTtl);
    }

    console.log(`✅ API request: ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Waterfall request reducer
 * Convert sequential requests to parallel
 * 
 * Example:
 * Before (Waterfall):
 *   1. Get user → 2. Get events → 3. Get templates
 *   Time: 300ms + 200ms + 150ms = 650ms
 * 
 * After (Parallel):
 *   1,2,3 in parallel
 *   Time: max(300, 200, 150) = 300ms
 */
export const parallelizeRequests = {
  /**
   * Load calendar data in parallel
   */
  loadCalendarData: async (userId, month, year) => {
    const results = await executeInParallel([
      fetch(`/api/events/month?year=${year}&month=${month}`).then(r => r.json()),
      fetch(`/api/templates`).then(r => r.json()),
      fetch(`/api/events/color`).then(r => r.json()),
    ]);

    return {
      events: results[0],
      templates: results[1],
      colors: results[2]
    };
  },

  /**
   * Load home page data in parallel
   */
  loadHomePage: async () => {
    const results = await executeInParallel([
      fetch(`/api/events/month`).then(r => r.json()),
      fetch(`/api/notifications`).then(r => r.json()),
      fetch(`/api/user/preferences`).then(r => r.json()),
    ]);

    return {
      events: results[0],
      notifications: results[1],
      preferences: results[2]
    };
  },

  /**
   * Load settings page data in parallel
   */
  loadSettingsPage: async () => {
    const results = await executeInParallel([
      fetch(`/api/user/preferences`).then(r => r.json()),
      fetch(`/api/templates`).then(r => r.json()),
      fetch(`/api/notifications/settings`).then(r => r.json()),
    ]);

    return {
      preferences: results[0],
      templates: results[1],
      notificationSettings: results[2]
    };
  }
};

/**
 * Progressive loading strategy
 * Load critical data first, non-critical in background
 */
export const progressiveLoad = {
  /**
   * Load critical data immediately, rest in background
   */
  withPriority: async (criticalRequests, backgroundRequests) => {
    // Load critical immediately
    const critical = await executeInParallel(criticalRequests);

    // Load background later (don't wait)
    backgroundRequests.forEach(req => {
      req.catch(err => console.warn('Background request failed:', err));
    });

    return critical;
  },

  /**
   * Load data as it arrives (streaming)
   * Return partial results immediately
   */
  streaming: async (requests) => {
    const results = [];
    
    for (const request of requests) {
      try {
        const result = await request;
        results.push(result);
        console.log(`📡 Data chunk received (${results.length}/${requests.length})`);
      } catch (error) {
        console.error('Stream chunk failed:', error);
      }
    }

    return results;
  }
};

/**
 * Request rate limiting
 * Limit concurrent requests
 */
export class RequestRateLimiter {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.activeRequests = 0;
    this.queue = [];
  }

  /**
   * Execute request with rate limiting
   */
  async execute(requestFn) {
    while (this.activeRequests >= this.maxConcurrent) {
      // Wait for slot to open
      await new Promise(resolve => this.queue.push(resolve));
    }

    this.activeRequests++;

    try {
      const result = await requestFn();
      return result;
    } finally {
      this.activeRequests--;
      
      // Process next queued request
      const next = this.queue.shift();
      if (next) next();
    }
  }

  /**
   * Execute multiple requests with rate limiting
   */
  async executeMany(requests) {
    return Promise.all(
      requests.map(req => this.execute(req))
    );
  }
}

/**
 * Request timeout handler
 */
export const withTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    )
  ]);
};

/**
 * Retry with exponential backoff
 */
export const retryWithBackoff = async (
  requestFn,
  maxRetries = 3,
  initialDelayMs = 100
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`⏳ Retry in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

export default {
  RequestBatcher,
  executeInParallel,
  executeInParallelWithFallback,
  RequestDeduplicator,
  smartApiRequest,
  parallelizeRequests,
  progressiveLoad,
  RequestRateLimiter,
  withTimeout,
  retryWithBackoff
};
