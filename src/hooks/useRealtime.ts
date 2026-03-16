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

            const eventSource = new EventSource('/api/realtime');

            eventSource.onmessage = (event) => {
                try {
                    const payload = JSON.parse(event.data);
                    onEvent(payload);
                } catch (err) {
                    console.error('Realtime message parse error:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('Realtime connection error, retrying...', err);
                eventSource.close();
                // Retry after 5 seconds
                setTimeout(connect, 5000);
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
