/**
 * Bundle Size Optimization Utilities
 * Tools and techniques for reducing bundle size
 */

/**
 * Get CSS critical path
 * Extracts only CSS needed for above-the-fold content
 * @returns {string} - Critical CSS
 */
export const getCriticalCSS = () => {
  // Critical styles for initial render (theme, layout, text)
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #root { width: 100%; height: 100%; }
    body { font-family: 'Poppins', sans-serif; }
    .route-loader { display: flex; align-items: center; justify-content: center; 
                   min-height: 100vh; background: linear-gradient(135deg, #667eea, #764ba2); }
  `;
};

/**
 * Image optimization hints
 * WebP + fallback for modern image delivery
 */
export const imageOptimization = {
  formats: {
    // Modern browsers: WebP (25-35% smaller)
    webp: {
      extension: '.webp',
      mimeType: 'image/webp',
      quality: 80,
      reduction: '30%'
    },
    // Fallback: JPEG optimized
    jpeg: {
      extension: '.jpg',
      mimeType: 'image/jpeg',
      quality: 80,
      reduction: '15%'
    },
    // PNG for transparency (use with caution)
    png: {
      extension: '.png',
      mimeType: 'image/png',
      quality: 80,
      reduction: '5%'
    }
  },

  /**
   * Generate picture element with WebP + fallback
   * @param {string} basePath - Image path without extension
   * @param {string} alt - Alt text
   * @returns {string} - HTML picture element
   */
  generatePictureElement: (basePath, alt) => `
    <picture>
      <source srcset="${basePath}.webp" type="image/webp" />
      <source srcset="${basePath}.jpg" type="image/jpeg" />
      <img src="${basePath}.jpg" alt="${alt}" loading="lazy" />
    </picture>
  `,

  /**
   * Recommended image sizes for responsive loading
   */
  responsiveSizes: {
    thumbnail: '150px',    // 5-10KB
    small: '300px',        // 15-30KB
    medium: '600px',       // 30-60KB
    large: '1200px',       // 60-150KB
    xlarge: '1920px'       // 150-300KB
  }
};

/**
 * CSS optimization strategies
 */
export const cssOptimization = {
  /**
   * Purge unused CSS selectors
   * Tools: PurgeCSS, Tailwind's built-in purging
   */
  purgeConfig: {
    content: [
      './index.html',
      './src/**/*.{js,jsx}',
    ],
    safelist: [
      'bg-gradient-to-br',
      'from-blue-50',
      'to-indigo-100',
      // Keep dynamic classes
      /^(animate-|translate-|scale-)/
    ],
    blocklist: [
      /^debug-/,
      /^test-/
    ]
  },

  /**
   * CSS splitting strategy
   */
  splitting: {
    // Load critical CSS inline
    critical: 'inline',
    // Load route-specific CSS on-demand
    routes: 'lazy',
    // Defer non-critical CSS
    components: 'async'
  }
};

/**
 * JavaScript optimization strategies
 */
export const jsOptimization = {
  /**
   * Tree-shaking recommendations
   * Ensure modules use ES6 exports
   */
  treeShaking: {
    // ✅ Good - supports tree-shaking
    good: `export const useCalendarLazyLoad = () => {}`,
    
    // ❌ Bad - no tree-shaking
    bad: `module.exports = { useCalendarLazyLoad: () => {} }`
  },

  /**
   * Dependency size audit
   * Check before installing
   */
  dependencyAudit: {
    // Use: npm ls --depth=0
    command: 'npm ls --depth=0',
    
    // Check individual package:
    // npm info package-name | grep -A1 '"size"'
    
    // Browser: https://bundlephobia.com
    tools: ['bundlephobia', 'webpack-bundle-analyzer', 'source-map-explorer']
  },

  /**
   * Library alternatives for smaller bundles
   */
  alternatives: [
    {
      current: 'axios (40KB)',
      smaller: 'fetch API (0KB)',
      tradeoff: 'Less features, manual interceptors'
    },
    {
      current: 'lodash (50KB)',
      smaller: 'lodash-es (45KB)',
      tradeoff: 'Tree-shaking compatible'
    },
    {
      current: 'date-fns (30KB)',
      smaller: 'lightweight alternatives',
      tradeoff: 'Fewer utilities'
    }
  ]
};

/**
 * Compression strategies
 */
export const compressionStrategies = {
  /**
   * Gzip compression (server-side)
   * Recommended for text-based assets
   */
  gzip: {
    // .js: 70% compression
    // .css: 80% compression
    // .json: 90% compression
    enabled: true,
    level: 6, // 1-9, higher = slower compress but smaller
    types: ['application/javascript', 'text/css', 'application/json']
  },

  /**
   * Brotli compression (better than gzip)
   * Newer, better compression, wider support
   */
  brotli: {
    enabled: true,
    quality: 11, // 0-11, higher = slower
    types: ['application/javascript', 'text/css', 'application/json']
  }
};

/**
 * Minification settings
 */
export const minification = {
  /**
   * JavaScript minification (TerserPlugin in webpack/Vite)
   */
  js: {
    compress: {
      drop_console: true,  // Remove console.log in prod
      pure_funcs: ['console.log', 'console.info'], // Remove these functions
    },
    format: {
      comments: false,  // Remove comments
      beautify: false   // Minify formatting
    }
  },

  /**
   * CSS minification (cssnano, lightningcss)
   */
  css: {
    removeComments: true,
    mergeRules: true,
    normalizeUnicode: true,
    discardUnused: true
  }
};

/**
 * Performance budget configuration
 * Fail build if exceeds thresholds
 */
export const performanceBudget = {
  // JavaScript
  'main.js': '120KB',
  'chunk-*.js': '100KB',
  
  // CSS
  'index.css': '50KB',
  
  // Total
  'total': '250KB',
  
  // Time-based budgets
  'time': {
    'FCP': '1500ms',      // First Contentful Paint
    'LCP': '2500ms',      // Largest Contentful Paint
    'TTI': '3800ms',      // Time to Interactive
  }
};

/**
 * Build size analysis
 */
export const bundleAnalysis = {
  // Command to analyze bundle
  command: 'npm run build && npm run analyze',
  
  // Output files
  output: 'dist/bundle-report.html',
  
  // Check for:
  checks: [
    'Unused dependencies',
    'Duplicate packages',
    'Large node_modules imports',
    'Missing tree-shaking opportunities',
    'Common chunk combinations'
  ]
};

/**
 * Vite configuration for bundle optimization
 */
export const viteOptimization = {
  // Automatically pre-bundle dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'date-fns'
    ]
  },

  // Rollup build options
  build: {
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'date': ['date-fns'],
          'api': ['axios']
        }
      }
    },
    
    // Report gzip size
    reportCompressedSize: true,
    
    // CSS minification
    cssMinify: 'lightningcss',
    
    // Terser options for JS minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Source maps (disable in production)
    sourcemap: false
  }
};

export default {
  getCriticalCSS,
  imageOptimization,
  cssOptimization,
  jsOptimization,
  compressionStrategies,
  minification,
  performanceBudget,
  bundleAnalysis,
  viteOptimization
};
