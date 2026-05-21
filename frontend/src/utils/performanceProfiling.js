/**
 * Performance Profiling and Validation Utilities
 * Measure and validate all performance optimizations
 */

/**
 * Performance metrics collector
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.marks = {};
  }

  /**
   * Start measuring a named operation
   * @param {string} name - Operation name
   */
  startMeasure(name) {
    if (!performance.mark) {
      console.warn('Performance API not available');
      return;
    }

    performance.mark(`${name}-start`);
    this.marks[name] = Date.now();
    console.log(`⏱️ Started: ${name}`);
  }

  /**
   * End measuring and log time
   * @param {string} name - Operation name
   * @returns {number} - Duration in ms
   */
  endMeasure(name) {
    if (!performance.mark) return 0;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const measure = performance.getEntriesByName(name)[0];
    const duration = measure.duration;

    this.metrics[name] = duration;

    console.log(`⏱️ Ended: ${name} - ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * Get all Core Web Vitals
   */
  getCoreWebVitals() {
    const vitals = {};

    // First Contentful Paint (FCP)
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcp) vitals.FCP = fcp.startTime;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.LCP = entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
      });

      try {
        perfObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP not available:', e);
      }
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            vitals.CLS = (vitals.CLS || 0) + entry.value;
          }
        }
      });

      try {
        perfObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('CLS not available:', e);
      }
    }

    return vitals;
  }

  /**
   * Get resource timing info
   */
  getResourceTimings() {
    const resources = performance.getEntriesByType('resource');
    const summary = {
      total: resources.length,
      byType: {},
      totalSize: 0,
      totalTime: 0
    };

    resources.forEach(resource => {
      const type = resource.initiatorType || 'other';
      if (!summary.byType[type]) {
        summary.byType[type] = { count: 0, size: 0, time: 0 };
      }

      summary.byType[type].count++;
      summary.byType[type].size += resource.transferSize || 0;
      summary.byType[type].time += resource.duration;
      summary.totalSize += resource.transferSize || 0;
      summary.totalTime += resource.duration;
    });

    return summary;
  }

  /**
   * Generate performance report
   */
  getReport() {
    const vitals = this.getCoreWebVitals();
    const resources = this.getResourceTimings();

    return {
      timestamp: new Date().toISOString(),
      coreWebVitals: vitals,
      resources,
      customMetrics: this.metrics,
      summary: {
        totalResources: resources.total,
        totalSize: `${(resources.totalSize / 1024 / 1024).toFixed(2)}MB`,
        totalTime: `${resources.totalTime.toFixed(2)}ms`,
        averageResourceTime: `${(resources.totalTime / resources.total).toFixed(2)}ms`
      }
    };
  }

  /**
   * Print formatted report to console
   */
  printReport() {
    const report = this.getReport();
    
    console.log('═══════════════════════════════════════');
    console.log('📊 PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════');
    
    console.log('\n📈 Core Web Vitals:');
    console.table(report.coreWebVitals);
    
    console.log('\n📦 Resources:');
    console.table(report.summary);
    
    console.log('\n⏱️ Custom Metrics:');
    console.table(this.metrics);
    
    console.log('\n📊 Resources by Type:');
    console.table(report.resources.byType);
  }

  /**
   * Validate performance against budgets
   */
  validateBudget(budgets) {
    const vitals = this.getCoreWebVitals();
    const results = {
      passed: 0,
      failed: 0,
      warnings: []
    };

    Object.entries(budgets).forEach(([metric, budget]) => {
      const value = vitals[metric] || this.metrics[metric];
      
      if (value === undefined) {
        results.warnings.push(`${metric} not available`);
        return;
      }

      if (value <= budget) {
        console.log(`✅ ${metric}: ${value.toFixed(2)}ms (budget: ${budget}ms)`);
        results.passed++;
      } else {
        console.error(`❌ ${metric}: ${value.toFixed(2)}ms (budget: ${budget}ms) - EXCEEDED`);
        results.failed++;
      }
    });

    return results;
  }

  /**
   * Clear all measurements
   */
  clear() {
    this.metrics = {};
    this.marks = {};
    
    if (performance.clearMarks) {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

/**
 * Cache effectiveness metrics
 */
export class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.size = 0;
  }

  /**
   * Record cache hit
   */
  recordHit(size = 0) {
    this.hits++;
    this.size = Math.max(this.size, size);
  }

  /**
   * Record cache miss
   */
  recordMiss() {
    this.misses++;
  }

  /**
   * Get cache stats
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: `${hitRate.toFixed(2)}%`,
      maxSize: `${(this.size / 1024).toFixed(2)}KB`
    };
  }

  /**
   * Print cache report
   */
  printReport() {
    console.log('═══════════════════════════════════════');
    console.log('💾 CACHE REPORT');
    console.log('═══════════════════════════════════════');
    console.table(this.getStats());
  }

  /**
   * Reset metrics
   */
  reset() {
    this.hits = 0;
    this.misses = 0;
    this.size = 0;
  }
}

/**
 * Network request metrics
 */
export class NetworkMetrics {
  constructor() {
    this.requests = [];
    this.waterfalls = [];
  }

  /**
   * Record network request
   */
  recordRequest(url, startTime, endTime, size = 0) {
    this.requests.push({
      url,
      duration: endTime - startTime,
      size,
      timestamp: startTime
    });
  }

  /**
   * Detect waterfall patterns
   */
  detectWaterfalls() {
    const sorted = [...this.requests].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      // Check if next request starts after current ends (waterfall)
      if (next.timestamp >= (current.timestamp + current.duration)) {
        this.waterfalls.push({
          wait: next.timestamp - (current.timestamp + current.duration),
          requests: [current, next]
        });
      }
    }
  }

  /**
   * Get network stats
   */
  getStats() {
    const totalTime = this.requests.reduce((sum, r) => sum + r.duration, 0);
    const totalSize = this.requests.reduce((sum, r) => sum + r.size, 0);
    const avgTime = this.requests.length > 0 ? totalTime / this.requests.length : 0;

    return {
      requests: this.requests.length,
      totalTime: `${totalTime.toFixed(2)}ms`,
      totalSize: `${(totalSize / 1024).toFixed(2)}KB`,
      averageTime: `${avgTime.toFixed(2)}ms`,
      waterfalls: this.waterfalls.length
    };
  }

  /**
   * Print network report
   */
  printReport() {
    this.detectWaterfalls();
    
    console.log('═══════════════════════════════════════');
    console.log('🌐 NETWORK REPORT');
    console.log('═══════════════════════════════════════');
    console.table(this.getStats());
    
    if (this.waterfalls.length > 0) {
      console.warn(`⚠️ Found ${this.waterfalls.length} waterfall patterns`);
      this.waterfalls.forEach((w, i) => {
        console.warn(`Waterfall ${i + 1}: ${w.wait.toFixed(2)}ms wait`);
      });
    }
  }

  /**
   * Reset metrics
   */
  reset() {
    this.requests = [];
    this.waterfalls = [];
  }
}

/**
 * Memory usage metrics
 */
export class MemoryMetrics {
  constructor() {
    this.samples = [];
  }

  /**
   * Record memory snapshot
   */
  recordSnapshot() {
    if (!performance.memory) {
      console.warn('Memory API not available');
      return;
    }

    this.samples.push({
      timestamp: Date.now(),
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    });
  }

  /**
   * Get memory stats
   */
  getStats() {
    if (this.samples.length === 0) return null;

    const latest = this.samples[this.samples.length - 1];
    const earliest = this.samples[0];

    return {
      currentUsed: `${(latest.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      currentTotal: `${(latest.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(latest.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      growth: `${((latest.usedJSHeapSize - earliest.usedJSHeapSize) / 1024 / 1024).toFixed(2)}MB`
    };
  }

  /**
   * Print memory report
   */
  printReport() {
    const stats = this.getStats();
    
    console.log('═══════════════════════════════════════');
    console.log('💾 MEMORY REPORT');
    console.log('═══════════════════════════════════════');
    console.table(stats);
  }

  /**
   * Reset metrics
   */
  reset() {
    this.samples = [];
  }
}

/**
 * Comprehensive performance validator
 */
export class PerformanceValidator {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.cacheMetrics = new CacheMetrics();
    this.networkMetrics = new NetworkMetrics();
    this.memoryMetrics = new MemoryMetrics();
  }

  /**
   * Run full performance audit
   */
  audit() {
    return {
      performance: this.monitor.getReport(),
      cache: this.cacheMetrics.getStats(),
      network: this.networkMetrics.getStats(),
      memory: this.memoryMetrics.getStats()
    };
  }

  /**
   * Print comprehensive report
   */
  printComprehensiveReport() {
    console.clear();
    console.log('\n🚀 COMPREHENSIVE PERFORMANCE AUDIT\n');
    
    this.monitor.printReport();
    console.log('\n');
    this.cacheMetrics.printReport();
    console.log('\n');
    this.networkMetrics.printReport();
    console.log('\n');
    this.memoryMetrics.printReport();
  }

  /**
   * Export audit as JSON
   */
  exportAudit() {
    return JSON.stringify(this.audit(), null, 2);
  }
}

// Export singleton instance
export const perfMonitor = new PerformanceMonitor();
export const cacheMetrics = new CacheMetrics();
export const networkMetrics = new NetworkMetrics();
export const memoryMetrics = new MemoryMetrics();
export const validator = new PerformanceValidator();

export default {
  PerformanceMonitor,
  CacheMetrics,
  NetworkMetrics,
  MemoryMetrics,
  PerformanceValidator,
  perfMonitor,
  cacheMetrics,
  networkMetrics,
  memoryMetrics,
  validator
};
