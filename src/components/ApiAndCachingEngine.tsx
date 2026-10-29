import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Zap, 
  RefreshCw, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Layers, 
  Trash2,
  Cpu
} from 'lucide-react';
import { ApiResponse, PageResponse, ProductItem, RequestLogEntry } from '../types';
import { 
  CaffeineCacheSimulator, 
  executeProductsQuery, 
  RequestLoggerStore 
} from '../services/mockBackend';

export const ApiAndCachingEngine: React.FC = () => {
  // Query parameters (Exp 6.1)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [sortBy, setSortBy] = useState('price');
  const [direction, setDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [category, setCategory] = useState('all');
  const [useCache, setUseCache] = useState(true);
  const [queryMode, setQueryMode] = useState<'JOIN_FETCH' | 'N_PLUS_ONE'>('JOIN_FETCH');

  // Query Result & Execution logs
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse<PageResponse<ProductItem>> | null>(null);
  const [executedQueries, setExecutedQueries] = useState<string[]>([]);
  const [dbQueryCount, setDbQueryCount] = useState<number>(0);
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);

  // Simulated Exception Testing (Exp 5.2)
  const [simulatedException, setSimulatedException] = useState<string | null>(null);

  // Subscribe to real-time request logs
  useEffect(() => {
    setLogs(RequestLoggerStore.getLogs());
    const unsubscribe = RequestLoggerStore.subscribe((updated) => setLogs(updated));
    return unsubscribe;
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setSimulatedException(null);
    try {
      const result = await executeProductsQuery({
        page,
        size,
        sortBy,
        direction,
        category,
        useCache,
        queryMode,
      });
      setApiResponse(result.response);
      setExecutedQueries(result.executedQueries);
      setDbQueryCount(result.dbQueryCount);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, size, sortBy, direction, category, useCache, queryMode]);

  // Handle Simulated Exception Triggers (Exp 5.2)
  const triggerSimulatedException = (type: 'NOT_FOUND' | 'VALIDATION' | 'SERVER_ERROR') => {
    const correlationId = 'cid-' + Math.random().toString(36).substring(2, 9);
    const start = performance.now();

    if (type === 'NOT_FOUND') {
      const duration = Math.round(performance.now() - start);
      setSimulatedException(
        JSON.stringify(
          {
            success: false,
            status: 404,
            error: 'PostNotFoundException',
            message: 'Post with id: 99999 not found in database',
            correlationId,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      RequestLoggerStore.addLog({
        id: Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toLocaleTimeString(),
        method: 'GET',
        endpoint: '/api/posts/99999',
        status: 404,
        durationMs: duration,
        correlationId,
        cached: false,
        clientIp: '127.0.0.1',
      });
    } else if (type === 'VALIDATION') {
      const duration = Math.round(performance.now() - start);
      setSimulatedException(
        JSON.stringify(
          {
            success: false,
            status: 400,
            error: 'MethodArgumentNotValidException',
            message: 'Validation failed for object: Post (title: Title must not be blank, min length: 3)',
            correlationId,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      RequestLoggerStore.addLog({
        id: Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toLocaleTimeString(),
        method: 'POST',
        endpoint: '/api/posts',
        status: 400,
        durationMs: duration,
        correlationId,
        cached: false,
        clientIp: '127.0.0.1',
      });
    } else {
      const duration = Math.round(performance.now() - start);
      setSimulatedException(
        JSON.stringify(
          {
            success: false,
            status: 500,
            error: 'InternalServerError',
            message: 'Unexpected database lock acquisition timeout in thread pool',
            correlationId,
            timestamp: new Date().toISOString(),
          },
          null,
          2
        )
      );
      RequestLoggerStore.addLog({
        id: Math.random().toString(36).substring(2, 8),
        timestamp: new Date().toLocaleTimeString(),
        method: 'GET',
        endpoint: '/api/orders/crash',
        status: 500,
        durationMs: duration,
        correlationId,
        cached: false,
        clientIp: '127.0.0.1',
      });
    }
  };

  const pageData = apiResponse?.data;
  const cacheEntries = CaffeineCacheSimulator.getEntries();
  const totalQueries = CaffeineCacheSimulator.totalHits + CaffeineCacheSimulator.totalMisses;
  const hitRate = totalQueries > 0 ? Math.round((CaffeineCacheSimulator.totalHits / totalQueries) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
              EXPERIMENTS 5.1, 5.2, 6.1 & 6.2
            </span>
            <span className="text-xs text-slate-400">Synthesis Module 3</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Layered REST Gateway, Caffeine Cache & Query Optimizer
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Spring Data Pageable sorting, Caffeine L1 cache, MDC Correlation ID request tracing, and JOIN FETCH optimization.
          </p>
        </div>

        {/* Live Cache & Query Metrics */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-5">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Caffeine Hit Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{hitRate}%</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Hits / Misses</div>
            <div className="text-base font-bold font-mono text-slate-200">
              <span className="text-emerald-400">{CaffeineCacheSimulator.totalHits}</span> /{' '}
              <span className="text-amber-400">{CaffeineCacheSimulator.totalMisses}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Query Mode</div>
            <div className={`text-xs font-bold font-mono ${queryMode === 'JOIN_FETCH' ? 'text-cyan-400' : 'text-rose-400'}`}>
              {queryMode === 'JOIN_FETCH' ? '1 Query' : `${dbQueryCount} Queries (N+1)`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Paginated REST Table & Controls (Exp 6.1 & 6.2) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {/* Filter and Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                {/* Page Size (Exp 6.1) */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Size:</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>
                </div>

                {/* Sort By (Exp 6.1) */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="id">ID</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {/* Sort Direction (Exp 6.1) */}
                <button
                  onClick={() => setDirection((d) => (d === 'ASC' ? 'DESC' : 'ASC'))}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{direction}</span>
                </button>
              </div>

              {/* Cache & Relational Optimization Toggles (Exp 6.2) */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCache}
                    onChange={(e) => setUseCache(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Caffeine Cache</span>
                </label>

                {/* N+1 vs JOIN FETCH Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setQueryMode('JOIN_FETCH')}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition ${
                      queryMode === 'JOIN_FETCH'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JOIN FETCH
                  </button>
                  <button
                    onClick={() => setQueryMode('N_PLUS_ONE')}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition ${
                      queryMode === 'N_PLUS_ONE'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    N+1 Demo
                  </button>
                </div>

                <button
                  onClick={() => {
                    CaffeineCacheSimulator.clear();
                    fetchProducts();
                  }}
                  title="Evict All Cache Keys"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Response Banner (Exp 5.1 ApiResponse envelope) */}
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">200 OK</span>
                <span className="text-slate-400">
                  Latency: <strong className={apiResponse?.fromCache ? 'text-emerald-400' : 'text-amber-400'}>
                    {apiResponse?.latencyMs}ms
                  </strong>
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">
                  Source: {apiResponse?.fromCache ? (
                    <span className="text-emerald-400 font-bold">⚡ Caffeine L1 Cache</span>
                  ) : (
                    <span className="text-slate-300">🗄️ MySQL Database</span>
                  )}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                MDC Correlation: <span className="text-cyan-300">{apiResponse?.correlationId}</span>
              </div>
            </div>

            {/* Products Table (Exp 6.1) */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price (INR)</th>
                    <th className="py-3 px-4">Supplier (Relational)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {pageData?.content.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-slate-400">{item.id}</td>
                      <td className="py-3 px-4 font-medium text-slate-100">{item.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <div className="font-medium text-indigo-300">{item.supplierName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.supplierCountry}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls (Exp 6.1) */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400 font-mono">
                Total Products: <strong className="text-slate-200">{pageData?.totalElements}</strong> | Page{' '}
                <strong className="text-slate-200">{(pageData?.currentPage ?? 0) + 1}</strong> of{' '}
                <strong className="text-slate-200">{pageData?.totalPages}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={pageData?.isFirst || isLoading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300">
                  {(pageData?.currentPage ?? 0) + 1} / {pageData?.totalPages || 1}
                </span>
                <button
                  disabled={pageData?.isLast || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Database Query Inspector (Exp 6.2 Relational Optimization) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Executed Hibernate / SQL Queries Log
              </h4>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                queryMode === 'JOIN_FETCH' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                {queryMode === 'JOIN_FETCH' ? '1 Query (JOIN FETCH)' : `${dbQueryCount} Queries (N+1 Problem!)`}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {queryMode === 'JOIN_FETCH' 
                ? 'Optimized with `@Query("SELECT p FROM Product p JOIN FETCH p.supplier")`. Fetches both entities in a single roundtrip.'
                : 'Default lazy fetch executes 1 query for products and then N individual queries for each supplier, multiplying network latency.'}
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-44 overflow-y-auto">
              {executedQueries.map((q, idx) => (
                <div key={idx} className={q.includes('N+1') ? 'text-amber-400' : q.includes('CAFFEINE') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Global Exception Handling & MDC Request Logger (Exp 5.2) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Global Exception Handler Simulator (Exp 5.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                @ControllerAdvice Exception Gateway
              </h4>
            </div>
            <p className="text-xs text-slate-400">
              Test centralized exception handling and uniform RFC-7807 error envelopes.
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => triggerSimulatedException('NOT_FOUND')}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold text-left transition"
              >
                Trigger 404 PostNotFoundException
              </button>
              <button
                onClick={() => triggerSimulatedException('VALIDATION')}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-semibold text-left transition"
              >
                Trigger 400 BeanValidation Failed
              </button>
              <button
                onClick={() => triggerSimulatedException('SERVER_ERROR')}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold text-left transition"
              >
                Trigger 500 Uncaught Exception
              </button>
            </div>

            {simulatedException && (
              <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 text-[11px] font-mono text-rose-300 overflow-x-auto">
                <pre>{simulatedException}</pre>
              </div>
            )}
          </div>

          {/* MDC Request Logging Filter Stream (Exp 5.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                MDC RequestLoggingFilter
              </h4>
              <button
                onClick={() => RequestLoggerStore.clear()}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Real-time audit filter stamping each HTTP request with a unique correlation ID via SLF4J / MDC.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      log.status === 200 ? 'text-emerald-400' : log.status === 404 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {log.method} {log.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">{log.endpoint}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>MDC: <strong className="text-cyan-400">{log.correlationId}</strong></span>
                    <span>{log.durationMs}ms {log.cached ? '⚡ cache' : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
