import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly pendingRequests = new Map<string, Promise<unknown>>();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      if (result) {
        this.logger.debug(`Cache HIT: ${key}`);
      } else {
        this.logger.debug(`Cache MISS: ${key}`);
      }
      return result || null;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttl = 300): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl * 1000); // Convert to milliseconds
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}:`, error);
    }
  }

  /**
   * Delete specific key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  invalidatePattern(pattern: string): void {
    try {
      // Note: This is a simplified implementation
      // In production, you might want to use Redis SCAN for better performance
      this.logger.debug(`Cache INVALIDATE pattern: ${pattern}`);

      // For cache-manager-redis-store, we need to clear related keys
      // This is a basic implementation - in production you'd want more sophisticated pattern matching
      if (pattern.includes('*')) {
        // For now, we'll just log the pattern and clear manually in calling code
        this.logger.warn(
          `Pattern invalidation not fully implemented: ${pattern}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Cache invalidation error for pattern ${pattern}:`,
        error,
      );
    }
  }

  /**
   * Generate cache key for projects by account
   */
  projectsByAccountKey(accountId: string): string {
    return `projects:account:${accountId}`;
  }

  /**
   * Generate cache key for teams by account
   */
  teamsByAccountKey(accountId: string): string {
    return `teams:account:${accountId}`;
  }

  /**
   * Generate cache key for project members
   */
  projectMembersKey(projectId: string): string {
    return `project:${projectId}:members`;
  }

  /**
   * Generate cache key for user account data
   */
  userAccountKey(userId: string): string {
    return `user:${userId}:account`;
  }

  /**
   * Get or set with request deduplication
   * Prevents cache stampede by ensuring only one request per key executes
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl = 300,
  ): Promise<T> {
    try {
      // Check cache first
      const cached = await this.cacheManager.get<T>(key);
      if (cached) {
        this.logger.debug(`Cache HIT: ${key}`);
        return cached;
      }

      // Check if request is already pending
      const pendingRequest = this.pendingRequests.get(key) as
        | Promise<T>
        | undefined;
      if (pendingRequest !== undefined) {
        this.logger.debug(`Request DEDUP: ${key}`);
        return await pendingRequest;
      }

      // Create new request
      this.logger.debug(`Cache MISS: ${key}`);
      const request = factory()
        .then(async (result) => {
          // Cache the result
          await this.cacheManager.set(key, result, ttl * 1000);
          this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
          return result;
        })
        .finally(() => {
          // Remove from pending requests
          this.pendingRequests.delete(key);
        });

      // Store pending request
      this.pendingRequests.set(key, request);
      return request;
    } catch (error) {
      this.logger.error(`Cache getOrSet error for key ${key}:`, error);
      // Clean up pending request on error
      this.pendingRequests.delete(key);
      // Fall back to factory function
      return factory();
    }
  }

  /**
   * Generate cache key for project details
   */
  projectDetailsKey(projectId: string): string {
    return `project:${projectId}:details`;
  }

  /**
   * Invalidate all caches related to an account
   */
  async invalidateAccountCaches(accountId: string): Promise<void> {
    const keys = [
      this.projectsByAccountKey(accountId),
      this.teamsByAccountKey(accountId),
      // Invalidate paginated project caches (common page sizes)
      `projects:paginated:${accountId}:20`,
      `projects:paginated:${accountId}:10`,
      `projects:paginated:${accountId}:50`,
    ];

    for (const key of keys) {
      await this.del(key);
    }
  }

  /**
   * Invalidate all caches related to a project
   */
  async invalidateProjectCaches(projectId: string): Promise<void> {
    const keys = [
      this.projectDetailsKey(projectId),
      this.projectMembersKey(projectId),
    ];

    for (const key of keys) {
      await this.del(key);
    }
  }
}
