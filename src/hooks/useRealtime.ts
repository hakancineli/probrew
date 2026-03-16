'use client';

import { useEffect, useRef } from 'react';

type RealtimeEvent = {
    event: string;
    data: any;
};

export function useRealtime(onEvent: (payload: RealtimeEvent) => void) {
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        let isStopped = false;

        const connect = () => {
            if (isStopped) return;

            // Close existing connection if any
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const eventSource = new EventSource(`/api/realtime?v=${Date.now()}`);
            
            eventSource.onopen = () => {
                console.log('Realtime stream connected');
                isStopped = false;
            };

            eventSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    onEvent(payload);
                } catch (err) {
                    console.error('Realtime message parse error:', err);
                }
            };

            eventSource.onerror = (err: any) => {
                // Ignore silent errors/reconnaissance
                if (eventSource.readyState === EventSource.CLOSED) {
                    console.warn('Realtime connection closed, retrying in 2s...');
                    setTimeout(connect, 2000);
                }
            };

            eventSourceRef.current = eventSource;
        };

        connect();

        return () => {
            isStopped = true;
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [onEvent]);
}
