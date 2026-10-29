/**
 * Spring Boot REST API & Caffeine Caching Engine Simulator
 * Synthesizing Experiment 5.1 (REST CRUD + ApiResponse<T> + Bean Validation)
 * and Experiment 5.2 (Global @ControllerAdvice + MDC Correlation ID + Request Logging Filter)
 * and Experiment 6.1 (Pageable, Sorting, PageResponse<T>)
 * and Experiment 6.2 (Caffeine In-Memory Caching + N+1 vs JOIN FETCH Query Optimization)
 */

import { ApiResponse, PageResponse, ProductItem, RequestLogEntry, SupplierItem } from '../types';

export const INITIAL_SUPPLIERS: SupplierItem[] = [
  { id: 1, name: 'ABC Suppliers Ltd', country: 'Germany', rating: 4.8 },
  { id: 2, name: 'Global Traders Corp', country: 'Singapore', rating: 4.6 },
  { id: 3, name: 'Premium Distributors Inc', country: 'United States', rating: 4.9 },
  { id: 4, name: 'TechMatrix Components', country: 'Taiwan', rating: 4.7 },
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  { id: 1, name: 'Gaming Laptop RTX 4080', category: 'Electronics', price: 150000, supplierId: 1 },
  { id: 2, name: 'Bluetooth Portable Speaker', category: 'Electronics', price: 5000, supplierId: 2 },
  { id: 3, name: 'Wireless Mechanical Keyboard', category: 'Electronics', price: 3000, supplierId: 1 },
  { id: 4, name: '4K UltraSharp Monitor 32"', category: 'Electronics', price: 60000, supplierId: 1 },
  { id: 5, name: 'Smartwatch Pro GPS', category: 'Electronics', price: 15000, supplierId: 2 },
  { id: 6, name: 'OLED Android Tablet 11"', category: 'Electronics', price: 25000, supplierId: 3 },
  { id: 7, name: 'Ergonomic Mouse Pad Gel', category: 'Accessories', price: 700, supplierId: 3 },
  { id: 8, name: 'Portable Powerbank 20000mAh', category: 'Accessories', price: 3500, supplierId: 2 },
  { id: 9, name: 'Webcam 4K UHD Pro', category: 'Electronics', price: 5500, supplierId: 1 },
  { id: 10, name: 'Wireless Laser Printer Duplex', category: 'Electronics', price: 25000, supplierId: 1 },
  { id: 11, name: 'Ergonomic Motorized Office Desk', category: 'Furniture', price: 25000, supplierId: 3 },
  { id: 12, name: 'Ergonomic Mesh Office Chair', category: 'Furniture', price: 20000, supplierId: 3 },
  { id: 13, name: 'Lockable Steel File Cabinet', category: 'Furniture', price: 15000, supplierId: 3 },
  { id: 14, name: 'Sticky Notes Neon Pack (600 sheets)', category: 'Stationery', price: 50, supplierId: 2 },
  { id: 15, name: 'Professional Art Marker Set 48-color', category: 'Stationery', price: 400, supplierId: 2 },
  { id: 16, name: 'Waterproof Travel Laptop Backpack', category: 'Accessories', price: 3500, supplierId: 2 },
  { id: 17, name: 'LED Smart Desk Lamp with Dimmable Qi', category: 'Furniture', price: 2500, supplierId: 3 },
  { id: 18, name: 'External NVMe SSD 2TB', category: 'Storage', price: 12000, supplierId: 4 },
  { id: 19, name: 'Network Attached Storage NAS 4-Bay', category: 'Storage', price: 45000, supplierId: 4 },
  { id: 20, name: '10-in-1 USB-C Hub HDMI 4K', category: 'Accessories', price: 1500, supplierId: 2 },
  { id: 21, name: 'Smart TV 65" 4K QLED', category: 'Electronics', price: 80000, supplierId: 2 },
  { id: 22, name: 'ANC Active Noise Cancelling Earbuds', category: 'Electronics', price: 7000, supplierId: 1 },
  { id: 23, name: 'Hot-Swappable Custom Keyboard', category: 'Electronics', price: 5000, supplierId: 1 },
  { id: 24, name: 'Executive Reclining Gaming Chair', category: 'Furniture', price: 25000, supplierId: 3 },
  { id: 25, name: 'Solid Oak Executive Desk 160cm', category: 'Furniture', price: 30000, supplierId: 3 },
  { id: 26, name: 'Heavy Duty Paper Clips Box', category: 'Stationery', price: 100, supplierId: 2 },
  { id: 27, name: 'Pastel Highlighter Set (6 pcs)', category: 'Stationery', price: 600, supplierId: 2 },
  { id: 28, name: 'Hard Shell Rolling Suitcase', category: 'Accessories', price: 5000, supplierId: 2 },
  { id: 29, name: 'Bamboo Wood Desk Organizer', category: 'Furniture', price: 1500, supplierId: 3 },
  { id: 30, name: 'External Rugged HDD 4TB', category: 'Storage', price: 7000, supplierId: 4 },
  { id: 31, name: 'Wi-Fi 7 Tri-Band Gaming Router', category: 'Electronics', price: 6000, supplierId: 1 },
  { id: 32, name: 'Smart Fingerprint Door Lock', category: 'Electronics', price: 25000, supplierId: 1 },
  { id: 33, name: 'Anti-Slip Vegan Leather Desk Pad', category: 'Furniture', price: 1800, supplierId: 3 },
  { id: 34, name: 'Hardcover Dotted Notebook Journal', category: 'Stationery', price: 500, supplierId: 2 },
  { id: 35, name: 'Machined Aluminum Pen Holder', category: 'Furniture', price: 800, supplierId: 3 },
  { id: 36, name: 'RGB Ultra-Lightweight Wireless Mouse', category: 'Electronics', price: 4000, supplierId: 1 },
  { id: 37, name: 'Fast Magnetic Wireless Stand Charger', category: 'Electronics', price: 3500, supplierId: 2 },
  { id: 38, name: 'OEM High-Yield Printer Ink Cartridge', category: 'Electronics', price: 2000, supplierId: 1 },
  { id: 39, name: 'Motorized ALR Projection Screen 120"', category: 'Electronics', price: 40000, supplierId: 1 },
  { id: 40, name: 'Quiet Bladeless Oscillating Office Fan', category: 'Furniture', price: 3000, supplierId: 3 },
  { id: 41, name: 'Rugged USB 3.2 Flash Drive 64GB', category: 'Storage', price: 1500, supplierId: 4 },
  { id: 42, name: 'Studio Monitoring Wireless Headphones', category: 'Electronics', price: 12000, supplierId: 1 },
  { id: 43, name: 'Ergonomic Adjustable Aluminum Laptop Stand', category: 'Furniture', price: 2500, supplierId: 3 },
  { id: 44, name: 'Brushless Cordless Impact Drill 20V', category: 'Tools', price: 10000, supplierId: 4 },
  { id: 45, name: 'Precision Electric Screwdriver Set', category: 'Tools', price: 8000, supplierId: 4 },
  { id: 46, name: 'Professional Acrylic Paint Set 36-Tubes', category: 'Tools', price: 3500, supplierId: 2 },
  { id: 47, name: 'Ergonomic Steel Garden Shovel', category: 'Tools', price: 2000, supplierId: 4 },
  { id: 48, name: 'Robotic Autonomous Electric Lawn Mower', category: 'Tools', price: 45000, supplierId: 4 },
  { id: 49, name: 'Heavy Duty Expandable Hose Pipe 50ft', category: 'Tools', price: 2500, supplierId: 4 },
  { id: 50, name: 'Compact 12V Car Vacuum Cleaner', category: 'Automotive', price: 3500, supplierId: 4 },
  { id: 51, name: 'Automotive Jump Starter Power Station', category: 'Automotive', price: 15000, supplierId: 4 },
  { id: 52, name: 'All-Weather Waterproof Car Cover', category: 'Automotive', price: 5000, supplierId: 4 },
  { id: 53, name: 'Synthetic 5W-40 Motor Oil 5L', category: 'Automotive', price: 2000, supplierId: 4 },
  { id: 54, name: 'Portable Digital Air Compressor Tire Inflator', category: 'Tools', price: 25000, supplierId: 4 },
  { id: 55, name: 'DOT Certified Aerodynamic Bike Helmet', category: 'Automotive', price: 3000, supplierId: 4 },
  { id: 56, name: 'Complete Roadside Emergency Kit 100-pc', category: 'Automotive', price: 4000, supplierId: 4 },
];

/**
 * Caffeine In-Memory Cache Simulator (Exp 6.2)
 * Max size: 10 items, TTL: 10 minutes
 */
interface CacheEntry {
  key: string;
  data: any;
  cachedAt: number;
  hits: number;
}

export class CaffeineCacheSimulator {
  private static cache: Map<string, CacheEntry> = new Map();
  static maxEntries = 10;
  static ttlMs = 10 * 60 * 1000; // 10 minutes (Exp 6.2 application.properties)
  static totalHits = 0;
  static totalMisses = 0;
  static totalEvictions = 0;

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.totalMisses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.cachedAt > this.ttlMs) {
      this.cache.delete(key);
      this.totalEvictions++;
      this.totalMisses++;
      return null;
    }

    entry.hits++;
    this.totalHits++;
    return entry.data;
  }

  static put(key: string, data: any) {
    if (this.cache.size >= this.maxEntries) {
      // LRU Eviction: remove oldest
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.totalEvictions++;
      }
    }
    this.cache.set(key, {
      key,
      data,
      cachedAt: Date.now(),
      hits: 0,
    });
  }

  static clear() {
    this.cache.clear();
    this.totalHits = 0;
    this.totalMisses = 0;
    this.totalEvictions = 0;
  }

  static getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }
}

/**
 * Request Logging Store (Exp 5.2 RequestLoggingFilter with MDC Correlation ID)
 */
export class RequestLoggerStore {
  private static logs: RequestLogEntry[] = [];
  private static listeners: ((logs: RequestLogEntry[]) => void)[] = [];

  static addLog(log: RequestLogEntry) {
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop();
    this.listeners.forEach((fn) => fn([...this.logs]));
  }

  static getLogs(): RequestLogEntry[] {
    return this.logs;
  }

  static subscribe(fn: (logs: RequestLogEntry[]) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  static clear() {
    this.logs = [];
    this.listeners.forEach((fn) => fn([]));
  }
}

/**
 * Service to execute paginated & sorted product queries with Caffeine caching
 * and relational JOIN FETCH vs N+1 demonstration
 */
export async function executeProductsQuery({
  page = 0,
  size = 5,
  sortBy = 'id',
  direction = 'ASC',
  category = 'all',
  useCache = true,
  queryMode = 'JOIN_FETCH', // 'JOIN_FETCH' (Exp 6.2) or 'N_PLUS_ONE'
}: {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
  category?: string;
  useCache?: boolean;
  queryMode?: 'JOIN_FETCH' | 'N_PLUS_ONE';
}): Promise<{
  response: ApiResponse<PageResponse<ProductItem>>;
  executedQueries: string[];
  dbQueryCount: number;
}> {
  const correlationId = 'cid-' + Math.random().toString(36).substring(2, 10);
  const startTime = performance.now();
  const executedQueries: string[] = [];

  // Standard Spring Cache Key (Exp 6.2): #pageable.pageNumber + "-" + #pageable.pageSize + "-" + #pageable.sort
  const cacheKey = `products::${page}-${size}-${sortBy}-${direction}-${category}-${queryMode}`;

  if (useCache) {
    const cachedData = CaffeineCacheSimulator.get(cacheKey);
    if (cachedData) {
      const durationMs = Math.round(performance.now() - startTime);
      const apiResp: ApiResponse<PageResponse<ProductItem>> = {
        success: true,
        message: 'Retrieved products from Caffeine L1 in-memory cache',
        correlationId,
        timestamp: new Date().toISOString(),
        data: cachedData,
        latencyMs: durationMs,
        fromCache: true,
      };

      RequestLoggerStore.addLog({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: 'GET',
        endpoint: `/api/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
        status: 200,
        durationMs,
        correlationId,
        cached: true,
        clientIp: '127.0.0.1',
      });

      return {
        response: apiResp,
        executedQueries: [`/* CAFFEINE CACHE HIT: key="${cacheKey}" - 0 SQL roundtrips */`],
        dbQueryCount: 0,
      };
    }
  }

  // Simulated DB processing delay (cold database fetch)
  const coldDelay = queryMode === 'N_PLUS_ONE' ? 280 : 160;
  await new Promise((r) => setTimeout(r, coldDelay));

  let items = [...INITIAL_PRODUCTS];

  if (category && category !== 'all') {
    items = items.filter((p) => p.category === category);
  }

  // Sorting
  items.sort((a: any, b: any) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') {
      return direction === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return direction === 'ASC' ? valA - valB : valB - valA;
  });

  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size);
  const startIndex = page * size;
  const pageItems = items.slice(startIndex, startIndex + size);

  let dbQueryCount = 0;

  // Hydrate with Supplier (Relational JOIN vs N+1 demonstration)
  if (queryMode === 'JOIN_FETCH') {
    // Single optimized query (Exp 6.2 update to ProductRepository)
    executedQueries.push(
      `SELECT p FROM Product p JOIN FETCH p.supplier WHERE p.category = '${category}' ORDER BY p.${sortBy} ${direction} LIMIT ${size} OFFSET ${startIndex};`,
      `SELECT COUNT(p) FROM Product p;`
    );
    dbQueryCount = 1;
    pageItems.forEach((p) => {
      const supplier = INITIAL_SUPPLIERS.find((s) => s.id === p.supplierId);
      p.supplierName = supplier?.name || 'Default Supplier';
      p.supplierCountry = supplier?.country || 'Global';
    });
  } else {
    // Inefficient N+1 query problem (Exp 6.2)
    executedQueries.push(
      `/* ROOT QUERY 1 */ SELECT p FROM Product p ORDER BY p.${sortBy} ${direction} LIMIT ${size} OFFSET ${startIndex};`
    );
    dbQueryCount = 1;

    pageItems.forEach((p, idx) => {
      executedQueries.push(
        `/* N+1 CHILD QUERY ${idx + 1} */ SELECT * FROM suppliers WHERE id = ${p.supplierId};`
      );
      dbQueryCount++;
      const supplier = INITIAL_SUPPLIERS.find((s) => s.id === p.supplierId);
      p.supplierName = supplier?.name || 'Default Supplier';
      p.supplierCountry = supplier?.country || 'Global';
    });
  }

  const pageResponse: PageResponse<ProductItem> = {
    content: pageItems,
    currentPage: page,
    pageSize: size,
    totalElements,
    totalPages,
    isFirst: page === 0,
    isLast: page >= totalPages - 1,
    sortBy,
    direction,
  };

  if (useCache) {
    CaffeineCacheSimulator.put(cacheKey, pageResponse);
  }

  const durationMs = Math.round(performance.now() - startTime);
  const apiResp: ApiResponse<PageResponse<ProductItem>> = {
    success: true,
    message: `Retrieved page ${page + 1} of ${totalPages} products successfully`,
    correlationId,
    timestamp: new Date().toISOString(),
    data: pageResponse,
    latencyMs: durationMs,
    fromCache: false,
  };

  RequestLoggerStore.addLog({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    method: 'GET',
    endpoint: `/api/products?page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`,
    status: 200,
    durationMs,
    correlationId,
    cached: false,
    clientIp: '127.0.0.1',
  });

  return {
    response: apiResp,
    executedQueries,
    dbQueryCount,
  };
}
