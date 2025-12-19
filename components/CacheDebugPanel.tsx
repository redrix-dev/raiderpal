"use client";

import { useEffect, useState, useRef } from "react";
import { 
  getCacheStats, 
  getCacheEvents, 
  clearCacheEvents 
} from "@/lib/clientCache";

type CacheEvent = {
  type: 'HIT' | 'MISS' | 'EXPIRED' | 'STORED' | 'CLEARED';
  url: string;
  timestamp: number;
  meta?: Record<string, any>;
};

type VersionStatus = {
  currentVersion: string | number | null;
  lastCheck: number | null;
  status: 'valid' | 'checking' | 'stale' | 'changed';
  nextCheckIn: number;
};

export function CacheDebugPanel() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [events, setEvents] = useState<CacheEvent[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const logRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Toggle with Ctrl+Shift+D
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setVisible(v => !v);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for cache events
  useEffect(() => {
    if (!visible) return;

    function handleCacheEvent(e: Event) {
      const event = (e as CustomEvent<CacheEvent>).detail;
      setEvents(prev => [...prev, event].slice(-100));
    }

    window.addEventListener('cache-debug', handleCacheEvent);
    setEvents(getCacheEvents().slice(-100));

    return () => {
      window.removeEventListener('cache-debug', handleCacheEvent);
    };
  }, [visible]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logRef.current && !collapsed) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events, autoScroll, collapsed]);

  // Dragging logic
  useEffect(() => {
    if (!dragging) return;

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }

    function handleMouseUp() {
      setDragging(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset]);

  function handleMouseDown(e: React.MouseEvent) {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragging(true);
  }

  if (!visible) return null;

  const stats = getCacheStats();

  // Separate version events from item events
  const versionEvents = events.filter(e => e.url.includes('/version'));
  const itemEvents = events.filter(e => !e.url.includes('/version'));

  // Calculate version status
  const getVersionStatus = (): VersionStatus => {
    if (versionEvents.length === 0) {
      return {
        currentVersion: null,
        lastCheck: null,
        status: 'stale',
        nextCheckIn: 0,
      };
    }

    const latestEvent = versionEvents[versionEvents.length - 1];
    const lastCheck = latestEvent.timestamp;
    const timeSinceCheck = Date.now() - lastCheck;
    const VERSION_TTL = 60000; // 60 seconds
    const nextCheckIn = Math.max(0, VERSION_TTL - timeSinceCheck);

    let status: VersionStatus['status'] = 'valid';
    if (latestEvent.type === 'MISS') {
      status = 'checking';
    } else if (timeSinceCheck > VERSION_TTL) {
      status = 'stale';
    }

    // Try to extract version from recent STORED events
    const storedEvent = versionEvents.filter(e => e.type === 'STORED').pop();
    const currentVersion = storedEvent?.meta?.version || 'unknown';

    return {
      currentVersion,
      lastCheck,
      status,
      nextCheckIn: Math.round(nextCheckIn / 1000),
    };
  };

  const versionStatus = getVersionStatus();

  const typeColors: Record<string, string> = {
    HIT: 'text-green-400',
    MISS: 'text-yellow-400',
    EXPIRED: 'text-orange-400',
    STORED: 'text-cyan-400',
    CLEARED: 'text-red-400',
  };

  const typeEmoji: Record<string, string> = {
    HIT: '✅',
    MISS: '🌐',
    EXPIRED: '⏰',
    STORED: '💾',
    CLEARED: '🗑️',
  };

  return (
    <div
      ref={panelRef}
      className="fixed bg-black border-2 border-green-500 rounded-lg shadow-2xl z-[9999] flex flex-col font-mono text-xs"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '750px',
        height: collapsed ? 'auto' : '500px',
        boxShadow: '0 0 20px rgba(0, 255, 0, 0.3), 0 0 40px rgba(0, 255, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-black border-b-2 border-green-500 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="font-bold text-sm text-green-400">
            ▣ CACHE_DEBUG.exe
          </div>
          <div className="text-green-600 text-[10px]">
            [Ctrl+Shift+D]
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-green-400 hover:text-green-300 px-2 py-1"
          >
            {collapsed ? '▼' : '▲'}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-red-500 hover:text-red-400 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Stats Bar */}
          {stats && (
            <div className="flex items-center gap-4 px-3 py-2 bg-black border-b border-green-800 text-[10px] text-green-400">
              <div>
                <span className="text-green-600">ENTRIES:</span>{" "}
                <span className="text-green-400 font-bold">{stats.totalEntries}</span>
              </div>
              <div>
                <span className="text-green-600">SIZE:</span>{" "}
                <span className="text-green-400 font-bold">{stats.totalSizeKB}KB</span>
              </div>
              <div>
                <span className="text-green-600">OLDEST:</span>{" "}
                <span className="text-green-400 font-bold">
                  {Math.round(stats.oldestEntryAgo / 1000)}s
                </span>
              </div>
              <div className="flex-1" />
              <label className="flex items-center gap-1 text-green-600">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="w-3 h-3 accent-green-500"
                />
                AUTO
              </label>
              <button
                onClick={() => {
                  setEvents([]);
                  clearCacheEvents();
                }}
                className="text-yellow-400 hover:text-yellow-300 px-2 py-1 border border-yellow-600 rounded hover:bg-yellow-900/20"
              >
                CLR_LOG
              </button>
              <button
                onClick={() => {
                  if (confirm('⚠️ NUKE ALL CACHE & RELOAD?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="text-red-400 hover:text-red-300 px-2 py-1 border border-red-600 rounded hover:bg-red-900/20"
              >
                💣 NUKE
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* System Status Section */}
            <div className="border-b border-green-800">
              <div className="px-3 py-1 bg-green-950/30 text-green-400 text-[10px] font-bold">
                ▸ SYSTEM STATUS
              </div>
              <div className="px-3 py-2 space-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 w-32">Dataset Version:</span>
                  <span className="text-green-400 font-bold">
                    {versionStatus.currentVersion || 'checking...'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 w-32">Last Sync:</span>
                  <span className="text-green-400">
                    {versionStatus.lastCheck 
                      ? `${Math.round((Date.now() - versionStatus.lastCheck) / 1000)}s ago`
                      : 'never'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 w-32">Status:</span>
                  <span className={
                    versionStatus.status === 'valid' ? 'text-green-400' :
                    versionStatus.status === 'checking' ? 'text-cyan-400' :
                    'text-yellow-400'
                  }>
                    {versionStatus.status === 'valid' && `✓ Valid (next check in ${versionStatus.nextCheckIn}s)`}
                    {versionStatus.status === 'checking' && '↻ Checking...'}
                    {versionStatus.status === 'stale' && '⚠ Stale (checking now)'}
                  </span>
                </div>

                {versionEvents.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-900">
                    <div className="text-green-600 mb-1">Recent checks:</div>
                    <div className="space-y-0.5 max-h-16 overflow-y-auto text-[9px]">
                      {versionEvents.slice(-5).map((event, i) => {
                        const time = new Date(event.timestamp).toLocaleTimeString('en-US', { 
                          hour12: false 
                        });
                        return (
                          <div key={i} className="text-green-700">
                            {time} {' '}
                            {event.type === 'EXPIRED' && '⏰ Cache expired'}
                            {event.type === 'MISS' && '↻ Checking version'}
                            {event.type === 'STORED' && '✓ Version confirmed'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cache Activity Section */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-3 py-1 bg-green-950/30 text-green-400 text-[10px] font-bold border-b border-green-800">
                ▸ CACHE ACTIVITY
              </div>
              <div
                ref={logRef}
                className="flex-1 overflow-auto px-3 py-2 space-y-0.5 bg-black"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#22c55e #000000',
                }}
              >
                {itemEvents.length === 0 ? (
                  <div className="text-green-600 text-center py-8 animate-pulse">
                    &gt; AWAITING CACHE EVENTS...
                  </div>
                ) : (
                  itemEvents.map((event, i) => {
                    const time = new Date(event.timestamp).toLocaleTimeString('en-US', { 
                      hour12: false 
                    });
                    const url = event.url.replace('/api/', '');
                    
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-2 py-0.5 hover:bg-green-950/30"
                      >
                        <span className="text-green-700 w-16 flex-shrink-0 font-mono">
                          {time}
                        </span>
                        <span className={`w-16 flex-shrink-0 font-bold ${typeColors[event.type]}`}>
                          {typeEmoji[event.type]} {event.type}
                        </span>
                        <span className="text-green-400 flex-1 truncate" title={event.url}>
                          {url}
                        </span>
                        {event.meta && (
                          <span className="text-green-700 text-[9px] flex-shrink-0">
                            {Object.entries(event.meta)
                              .map(([k, v]) => `${k}:${v}`)
                              .join(' • ')}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-1 bg-black border-t-2 border-green-500 text-[9px] text-green-600">
            &gt; DRAG_HEADER_TO_MOVE | SYSTEM_EVENTS_SEPARATED
          </div>
        </>
      )}
    </div>
  );
}