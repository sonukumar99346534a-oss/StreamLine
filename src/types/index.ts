export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface JwtTokenPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
  issuedAt: number;
  expiresAt: number;
}

export interface EncryptedSecretItem {
  id: string;
  provider: 'twitter_api' | 'linkedin_oauth' | 'kafka_secret' | 'mysql_pass';
  name: string;
  plaintextMasked: string;
  ciphertext: string; // v1:nonce:ciphertext format as in Exp 7.2
  nonce: string;
  algorithm: 'AES-GCM-256';
  updatedAt: string;
}

export type SocialPlatform = 'Twitter' | 'LinkedIn' | 'Instagram' | 'Threads';

export interface PlatformConfig {
  name: SocialPlatform;
  limit: number;
  iconName: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export interface PostItem {
  id: string;
  title: string;
  content: string;
  platform: SocialPlatform;
  category: 'Tech' | 'Design' | 'DevOps' | 'AI' | 'Cloud';
  createdAt: number;
  likes: number;
  views: number;
  authorId: string;
  authorName: string;
}

export interface PostDraft {
  id: string;
  platform: SocialPlatform;
  content: string;
  category: 'Tech' | 'Design' | 'DevOps' | 'AI' | 'Cloud';
  savedAt: number;
}

export interface ProductItem {
  id: number;
  name: string;
  category: 'Electronics' | 'Furniture' | 'Stationery' | 'Accessories' | 'Storage' | 'Tools' | 'Automotive';
  price: number;
  supplierId: number;
  supplierName?: string;
  supplierCountry?: string;
}

export interface SupplierItem {
  id: number;
  name: string;
  country: string;
  rating: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  correlationId: string;
  timestamp: string;
  data: T;
  latencyMs?: number;
  fromCache?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  sortBy: string;
  direction: 'ASC' | 'DESC';
}

export interface RequestLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  correlationId: string;
  cached: boolean;
  userRole?: UserRole;
  clientIp: string;
}

export type EventStatus =
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'PROCESSED'
  | 'DUPLICATE'
  | 'DEAD_LETTERED'
  | 'PUBLISH_FAILED'
  | 'RETRYING';

export interface OrderEvent {
  eventId: string;
  orderId: string;
  orderItem: string;
  amount: number;
  status: EventStatus;
  shouldFail: boolean;
  timestamp: number;
  attemptCount: number;
  lastError?: string;
}

export interface EventTrackingRecord {
  eventId: string;
  orderId: string;
  status: EventStatus;
  attemptCount: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  topic: string;
}

export interface CiTestResult {
  id: string;
  name: string;
  type: 'UNIT' | 'INTEGRATION' | 'PACT_CONTRACT';
  status: 'PASSED' | 'FAILED' | 'RUNNING' | 'PENDING';
  durationMs: number;
  details: string;
  assertions: number;
}

export interface CanaryDeploymentState {
  serviceName: string;
  currentStableRevision: string;
  canaryRevision: string;
  stableTrafficPercent: number;
  canaryTrafficPercent: number;
  stage: 'IDLE' | 'BUILDING' | 'DEPLOYING_CANARY' | 'SMOKE_TESTING' | 'TRAFFIC_SPLIT_10' | 'PROMOTED_100' | 'ROLLED_BACK';
  logs: string[];
  smokeTestResult: 'PENDING' | 'SUCCESS' | 'FAILURE' | null;
  lastDeployedSha: string;
}
