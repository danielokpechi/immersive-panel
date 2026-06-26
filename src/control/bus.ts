// ═══════════════════════════════════════════════════════════
// ControlBus — the seam between the admin control room and the fan
// panels. Keyed by panel id, it carries Commands (console → panels) and
// Telemetry (panel → console).
//
// Two transports, chosen at runtime:
//
//  • Ably (cross-DEVICE) — when VITE_ABLY_KEY is configured. The admin's
//    live tweaks reach every fan phone that scanned the QR, anywhere.
//    echoMessages:false keeps the publisher from hearing itself; local
//    same-page subscribers are still served directly so the console and
//    an in-page panel sharing one bus talk without a round-trip.
//
//  • BroadcastChannel + localStorage (same-BROWSER) — the fallback for
//    local dev with no key. Cross-tab on one machine only.
//
// The channel is created lazily and re-opened on demand so it survives
// React StrictMode's mount→cleanup→mount cycle.
// ═══════════════════════════════════════════════════════════

import type * as AblyTypes from 'ably';
import type { BusMessage } from '../types/control';
import { ABLY_KEY, REALTIME_ENABLED } from '../config';

export type BusListener = (msg: BusMessage) => void;
export type ConnState = 'local' | 'connecting' | 'live' | 'error';
export type ConnListener = (state: ConnState) => void;

const ABLY_EVENT = 'm';

export class ControlBus {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<BusListener>();
  private name: string;
  private storageKey: string;
  private onStorage?: (e: StorageEvent) => void;

  // ── Ably (cross-device) ──
  private ably: AblyTypes.Realtime | null = null;
  private ablyChannel: AblyTypes.RealtimeChannel | null = null;
  private connState: ConnState = REALTIME_ENABLED ? 'connecting' : 'local';
  private connListeners = new Set<ConnListener>();
  private disposed = false;

  constructor(panelId: string) {
    this.name = `boltos:panel:${panelId}`;
    this.storageKey = `${this.name}:msg`;
  }

  get connectionState(): ConnState {
    return this.connState;
  }

  /** Watch realtime connection status (for the operator's "Live sync" badge). */
  onConnection(fn: ConnListener): () => void {
    this.connListeners.add(fn);
    fn(this.connState);
    return () => this.connListeners.delete(fn);
  }

  private setConn(state: ConnState) {
    if (this.connState === state) return;
    this.connState = state;
    for (const fn of this.connListeners) fn(state);
  }

  // Lazily bring up whichever cross-context transport applies.
  private ensureChannel() {
    if (REALTIME_ENABLED) {
      this.ensureAbly();
      return;
    }
    if (this.channel) return;
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(this.name);
      this.channel.onmessage = (e) => this.emit(e.data as BusMessage);
    } else if (typeof window !== 'undefined' && !this.onStorage) {
      this.onStorage = (e) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            this.emit(JSON.parse(e.newValue).msg as BusMessage);
          } catch {
            /* ignore */
          }
        }
      };
      window.addEventListener('storage', this.onStorage);
    }
  }

  private ensureAbly() {
    if (this.ably || this.disposed || typeof window === 'undefined') return;
    // Dynamic import keeps Ably out of the critical path and lets the app
    // run even if the SDK is unavailable.
    void import('ably').then(({ Realtime }) => {
      if (this.disposed) return;
      try {
        const client = new Realtime({ key: ABLY_KEY!, echoMessages: false });
        this.ably = client;
        client.connection.on('connected', () => this.setConn('live'));
        client.connection.on('connecting', () => this.setConn('connecting'));
        client.connection.on('disconnected', () => this.setConn('connecting'));
        client.connection.on('failed', () => this.setConn('error'));
        client.connection.on('suspended', () => this.setConn('error'));
        const ch = client.channels.get(this.name);
        this.ablyChannel = ch;
        void ch.subscribe(ABLY_EVENT, (m) => this.emit(m.data as BusMessage));
      } catch {
        this.setConn('error');
      }
    });
  }

  send(msg: BusMessage) {
    this.ensureChannel();
    // Deliver to same-page subscribers directly (transports don't echo).
    this.emit(msg);
    if (REALTIME_ENABLED) {
      // Ably queues publishes made before the connection is ready.
      void this.ablyChannel?.publish(ABLY_EVENT, msg);
      return;
    }
    if (this.channel) {
      this.channel.postMessage(msg);
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.storageKey, JSON.stringify({ n: Math.random(), msg }));
    }
  }

  subscribe(fn: BusListener) {
    this.ensureChannel();
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  dispose() {
    this.disposed = true;
    this.listeners.clear();
    this.connListeners.clear();
    if (this.channel) {
      this.channel.onmessage = null;
      this.channel.close();
      this.channel = null;
    }
    if (this.onStorage && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.onStorage);
      this.onStorage = undefined;
    }
    if (this.ablyChannel) {
      try {
        this.ablyChannel.unsubscribe();
      } catch {
        /* ignore */
      }
      this.ablyChannel = null;
    }
    if (this.ably) {
      try {
        this.ably.close();
      } catch {
        /* ignore */
      }
      this.ably = null;
    }
  }

  private emit(msg: BusMessage) {
    for (const fn of this.listeners) fn(msg);
  }
}
