interface CachedDisease {
  id: string;
  label: string;
}

interface DiseaseCache {
  diseases: CachedDisease[];
  timestamp: number;
  expiryTime: number; // in milliseconds
}

const CACHE_KEY = 'standard-diseases-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class DiseaseCacheManager {
  private static instance: DiseaseCacheManager;
  private cache: Map<string, CachedDisease> = new Map();
  private isLoaded = false;

  private constructor() {}

  static getInstance(): DiseaseCacheManager {
    if (!DiseaseCacheManager.instance) {
      DiseaseCacheManager.instance = new DiseaseCacheManager();
    }
    return DiseaseCacheManager.instance;
  }

  // Check if cache is valid and not expired
  private isCacheValid(): boolean {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const cacheData: DiseaseCache = JSON.parse(cached);
      const now = Date.now();
      
      return now - cacheData.timestamp < cacheData.expiryTime;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  // Load cache from localStorage
  private loadCacheFromStorage(): boolean {
    try {
      if (!this.isCacheValid()) {
        this.clearCache();
        return false;
      }

      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const cacheData: DiseaseCache = JSON.parse(cached);
      
      // Load into memory cache
      this.cache.clear();
      cacheData.diseases.forEach(disease => {
        this.cache.set(disease.id, disease);
        this.cache.set(disease.label, disease);
      });

      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('Error loading cache from storage:', error);
      this.clearCache();
      return false;
    }
  }

  // Save cache to localStorage
  private saveCacheToStorage(diseases: CachedDisease[]): void {
    try {
      const cacheData: DiseaseCache = {
        diseases,
        timestamp: Date.now(),
        expiryTime: CACHE_DURATION
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
      // If localStorage fails (quota exceeded), continue without caching
    }
  }

  // Get disease info from cache
  getDiseaseInfo(diseaseIdentifier: string): { id: string; label: string } | null {
    // Load cache if not already loaded
    if (!this.isLoaded) {
      this.loadCacheFromStorage();
    }

    const disease = this.cache.get(diseaseIdentifier);
    return disease ? { id: disease.id, label: disease.label } : null;
  }

  // Update cache with new disease data
  updateCache(diseases: Array<{ id: string; label: string }>): void {
    try {
      // Clear existing cache
      this.cache.clear();
      
      // Create minimal disease objects
      const cachedDiseases: CachedDisease[] = diseases.map(disease => ({
        id: disease.id,
        label: disease.label
      }));

      // Update memory cache
      cachedDiseases.forEach(disease => {
        this.cache.set(disease.id, disease);
        this.cache.set(disease.label, disease);
      });

      // Save to localStorage
      this.saveCacheToStorage(cachedDiseases);
      this.isLoaded = true;

      console.log(`Disease cache updated with ${cachedDiseases.length} diseases`);
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  }

  // Check if cache has data
  hasData(): boolean {
    if (!this.isLoaded) {
      this.loadCacheFromStorage();
    }
    return this.cache.size > 0;
  }

  // Clear cache
  clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
      this.cache.clear();
      this.isLoaded = false;
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache info for debugging
  getCacheInfo(): { size: number; isValid: boolean; hasData: boolean } {
    return {
      size: this.cache.size,
      isValid: this.isCacheValid(),
      hasData: this.hasData()
    };
  }
} 