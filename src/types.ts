import { z } from 'zod';

// ============ Configuration Schema ============
export const RedisConfigSchema = z.object({
  // Connection
  host: z.string().optional().default('localhost'),
  port: z.number().min(1).max(65535).optional().default(6379),
  password: z.string().optional(),
  username: z.string().optional(),
  database: z.number().min(0).max(15).optional().default(0),

  // Mode: standalone, sentinel, or cluster
  mode: z.enum(['standalone', 'sentinel', 'cluster']).optional().default('standalone'),

  // For sentinel mode
  sentinelNodes: z.array(z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
  })).optional(),
  sentinelMasterName: z.string().optional(),

  // For cluster mode
  clusterNodes: z.array(z.object({
    host: z.string(),
    port: z.number().min(1).max(65535),
  })).optional(),

  // TLS
  tls: z.boolean().optional().default(false),
  tlsOptions: z.object({
    ca: z.string().optional(),
    cert: z.string().optional(),
    key: z.string().optional(),
    rejectUnauthorized: z.boolean().default(true),
  }).optional(),

  // Performance
  maxRetries: z.number().min(1).max(10).optional().default(3),
  retryDelay: z.number().min(100).max(5000).optional().default(1000),
  connectionTimeout: z.number().min(1000).optional().default(5000),
  maxConnections: z.number().min(1).max(100).optional().default(10),

  // Cache defaults
  defaultTTL: z.number().min(0).optional().default(3600),
  compressionThreshold: z.number().min(1).optional().default(1024),

  // Observability
  slowCommandThreshold: z.number().min(0).optional().default(1000),
});

export type RedisConfig = z.infer<typeof RedisConfigSchema>;

// ============ Cache Types ============
export interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  namespace?: string;
}

export interface CacheStats {
  namespace: string;
  connectionStatus: any;
}

// ============ Lock Types ============
export interface LockOptions {
  ttl?: number;
  retryCount?: number;
  retryDelay?: number;
}

export interface LockInfo {
  locked: boolean;
  ttl?: number;
  lockId?: string;
}

export interface DistributedLockOptions {
  ttl?: number;
  retryCount?: number;
  retryDelay?: number;
}

// ============ Health Types ============
export interface HealthStatus {
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  timestamp: Date;
  details: {
    ping: boolean;
    connections?: number;
    memory?: string;
  };
}

// ============ Pub/Sub Types ============
export interface PubSubStats {
  subscriptions: number;
  patternSubscriptions: number;
  connected: boolean;
}

export interface PubSubMessage<T = any> {
  channel: string;
  message: T;
}

// ============ Cluster Types ============
export interface ClusterInfo {
  mode: 'cluster' | 'standalone';
  status: 'ready' | 'connecting' | 'error';
  nodeCount?: number;
  slotCount?: number;
  nodes?: Array<{
    host: string;
    port: number;
    role?: string;
  }>;
  host?: string;
  port?: number;
  error?: string;
}

// ============ Connection Types ============
export interface ConnectionStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'error' | 'closed';
  connected: boolean;
  ready: boolean;
  lastError?: Error;
  reconnectAttempts: number;
  uptime: number;
}

// ============ Event Types ============
export type RedisEventMap = {
  connect: void;
  ready: void;
  close: void;
  reconnecting: { attempt: number; delay: number };
  error: Error;
  end: void;
  status: ConnectionStatus;
  nodeAdded: { node: any };
  nodeRemoved: { node: any };
  nodeError: { node: any; error: Error };
  moved: { key: string; target: any };
  ask: { key: string; target: any };
};

export type PubSubEventMap = {
  message: { channel: string; message: string };
  pmessage: { pattern: string; channel: string; message: string };
  subscribe: { channel: string; count: number };
  unsubscribe: { channel: string; count: number };
  psubscribe: { pattern: string; count: number };
  punsubscribe: { pattern: string; count: number };
  error: Error;
};

export type CacheEventMap = {
  hit: { key: string; ttl: number };
  miss: { key: string };
  set: { key: string; ttl: number; size: number };
  delete: { key: string };
  expire: { key: string; ttl: number };
  refresh: { key: string };
  error: { key: string; error: Error };
};
