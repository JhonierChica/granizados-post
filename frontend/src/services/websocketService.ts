import { Client, IFrame, IMessage } from '@stomp/stompjs';

export type EventType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_UPDATED'
  | 'ORDER_DELETED'
  | 'DELIVERY_CREATED'
  | 'DELIVERY_STATUS_CHANGED';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

type EventCallback = (data: any) => void;
type ConnectionCallback = (connected: boolean) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscribers: Map<EventType, EventCallback[]> = new Map();
  private connectionListeners: ConnectionCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private reconnectDelay = 3000;
  private readonly maxReconnectDelay = 30000;
  private readonly wsUrl: string;

  constructor() {
    // Conecta directo al backend (puerto 8081) — evita problemas de proxy con nginx en Docker
    const wsHost = window.location.hostname;
    this.wsUrl = `ws://${wsHost}:8081/ws`;
  }

  connect(): void {
    if (this.client?.active) return;

    this.client = new Client({
      brokerURL: this.wsUrl,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        this.reconnectDelay = 3000; // reset on successful connection
        this.subscribeToOrders();
        this.subscribeToDeliveries();
        this.notifyConnection(true);
        this.notifyStatus('connected');
      },

      onDisconnect: () => {
        this.notifyConnection(false);
        // Distinguish between intentional disconnect and reconnect cycle
        if (this.client?.active) {
          this.notifyStatus('reconnecting');
          // Exponential backoff: double delay each attempt, capped
          this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.maxReconnectDelay,
          );
          this.client.reconnectDelay = this.reconnectDelay;
        } else {
          this.notifyStatus('disconnected');
        }
      },

      onStompError: (frame: IFrame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.notifyStatus('disconnected');
      this.notifyConnection(false);
    }
  }

  onEvent(eventType: EventType, callback: EventCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);

    return () => {
      const cbs = this.subscribers.get(eventType);
      if (cbs) {
        const idx = cbs.indexOf(callback);
        if (idx >= 0) cbs.splice(idx, 1);
      }
    };
  }

  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.push(callback);
    return () => {
      const idx = this.connectionListeners.indexOf(callback);
      if (idx >= 0) this.connectionListeners.splice(idx, 1);
    };
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.push(callback);
    // Immediately notify with current status
    callback(this.getStatus());
    return () => {
      const idx = this.statusListeners.indexOf(callback);
      if (idx >= 0) this.statusListeners.splice(idx, 1);
    };
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  getStatus(): ConnectionStatus {
    if (this.client?.connected) return 'connected';
    if (this.client?.active) return 'reconnecting';
    return 'disconnected';
  }

  // ─── Private helpers ──────────────────────────────────────

  private subscribeToOrders(): void {
    this.client?.subscribe('/topic/orders', (message: IMessage) => {
      try {
        const event = JSON.parse(message.body);
        const eventType = event.eventType as EventType;
        if (eventType && this.subscribers.has(eventType)) {
          this.notifyEvent(eventType, event.data);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    });
  }

  private subscribeToDeliveries(): void {
    this.client?.subscribe('/topic/deliveries', (message: IMessage) => {
      try {
        const event = JSON.parse(message.body);
        const eventType = event.eventType as EventType;
        if (eventType && this.subscribers.has(eventType)) {
          this.notifyEvent(eventType, event.data);
        }
      } catch (err) {
        console.error('Failed to parse delivery WebSocket message:', err);
      }
    });
  }

  private notifyEvent(eventType: EventType, data: any): void {
    const cbs = this.subscribers.get(eventType);
    if (!cbs) return;

    for (const cb of cbs) {
      try {
        cb(data);
      } catch (err) {
        console.error(`Error in ${eventType} subscriber:`, err);
      }
    }
  }

  private notifyConnection(connected: boolean): void {
    for (const cb of this.connectionListeners) {
      try {
        cb(connected);
      } catch (err) {
        console.error('Connection listener error:', err);
      }
    }
  }

  private notifyStatus(status: ConnectionStatus): void {
    for (const cb of this.statusListeners) {
      try {
        cb(status);
      } catch (err) {
        console.error('Status listener error:', err);
      }
    }
  }
}

export const websocketService = new WebSocketService();
