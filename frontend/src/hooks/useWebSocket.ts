import { useState, useEffect, useCallback } from 'react';
import {
  websocketService,
  type EventType,
  type ConnectionStatus,
} from '../services/websocketService';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  onEvent: (
    eventType: EventType,
    callback: (data: any) => void,
  ) => () => void;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    websocketService.getStatus(),
  );

  useEffect(() => {
    const unsub = websocketService.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    // Connect if not already connected
    if (!websocketService.isConnected()) {
      websocketService.connect();
    }

    // On unmount: disconnect to prevent memory leaks and stale connections
    return () => {
      unsub();
      websocketService.disconnect();
    };
  }, []);

  const onEvent = useCallback(
    (eventType: EventType, callback: (data: any) => void) => {
      return websocketService.onEvent(eventType, callback);
    },
    [],
  );

  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    onEvent,
    connect,
    disconnect,
  };
}
