// Performance monitoring utilities

/**
 * Report Web Vitals metrics (optional - requires web-vitals package)
 */
export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Use native Performance API as fallback
    if ('performance' in window && 'getEntriesByType' in performance) {
      const perfEntries = performance.getEntriesByType('navigation');
      if (perfEntries.length > 0) {
        onPerfEntry(perfEntries[0]);
      }
    }
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Check if the device is low-end based on hardware concurrency
 */
export const isLowEndDevice = (): boolean => {
  // Check hardware concurrency (number of CPU cores)
  const cores = navigator.hardwareConcurrency || 1;

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;

  // Consider device low-end if it has 2 or fewer cores or 2GB or less RAM
  return cores <= 2 || memory <= 2;
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontUrls = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  ];

  fontUrls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string, callback: () => void) => {
  const startTime = performance.now();
  callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;

  if (import.meta.env.MODE === 'development') {
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  }

  return renderTime;
};

/**
 * Check if user prefers reduced data usage
 */
export const prefersReducedData = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.saveData === true || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g';
  }
  return false;
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback for browsers without Intersection Observer
    img.src = src;
  }
};

/**
 * Request idle callback wrapper with fallback
 */
export const requestIdleCallback = (callback: () => void, options?: { timeout?: number }) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback to setTimeout
    return setTimeout(callback, 1);
  }
};

/**
 * Cancel idle callback wrapper
 */
export const cancelIdleCallback = (id: number) => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Measure First Contentful Paint (FCP)
 */
export const measureFCP = (): Promise<number> => {
  return new Promise((resolve) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          resolve(fcpEntry.startTime);
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } else {
      resolve(0);
    }
  });
};

/**
 * Optimize API calls with request deduplication
 */
export class RequestCache {
  private cache = new Map<string, Promise<any>>();
  private ttl: number;

  constructor(ttl: number = 60000) {
    this.ttl = ttl;
  }

  async fetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const promise = fetcher();
    this.cache.set(key, promise);

    // Clear cache after TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, this.ttl);

    return promise;
  }

  clear() {
    this.cache.clear();
  }
}
