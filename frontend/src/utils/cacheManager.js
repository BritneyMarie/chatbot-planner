/**
 * Cache Manager - Handles caching of API responses with TTL and invalidation
 * Reduces redundant API calls and improves application responsiveness
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Generate cache key from endpoint and params
   * @param {string} key - Cache identifier
   * @returns {string} - Normalized cache key
   */
  generateKey(key) {
    return `cache_${key}`;
  }

  /**
   * Get cached value if not expired
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  get(key) {
    const cacheKey = this.generateKey(key);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      // Check if expired
      if (Date.now() > cached.expiresAt) {
        this.invalidate(key);
        return null;
      }
      // Update last accessed time
      cached.lastAccessed = Date.now();
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached value with TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
   */
  set(key, data, ttlMs = 5 * 60 * 1000) {
    const cacheKey = this.generateKey(key);
    
    // Clear existing timer if present
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
    }
    
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(cacheKey, {
      data,
      expiresAt,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });
    
    // Auto-cleanup on expiry
    const timer = setTimeout(() => {
      this.cache.delete(cacheKey);
      this.timers.delete(cacheKey);
    }, ttlMs);
    
    this.timers.set(cacheKey, timer);
  }

  /**
   * Invalidate specific cache entry
   * @param {string} key - Cache key to invalidate
   */
  invalidate(key) {
    const cacheKey = this.generateKey(key);
    this.cache.delete(cacheKey);
    
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
      this.timers.delete(cacheKey);
    }
  }

  /**
   * Invalidate multiple cache entries matching pattern
   * @param {string} pattern - Regex pattern or prefix
   */
  invalidatePattern(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        const originalKey = key.replace('cache_', '');
        this.invalidate(originalKey);
      }
    });
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.forEach((_, key) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
    });
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache stats
   */
  getStats() {
    let totalSize = 0;
    let hitCount = 0;
    let entryCount = this.cache.size;

    this.cache.forEach(cached => {
      totalSize += JSON.stringify(cached.data).length;
      hitCount += 1; // Track access patterns
    });

    return {
      entryCount,
      totalSizeKb: (totalSize / 1024).toFixed(2),
      activeTimers: this.timers.size
    };
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
