import { EventEmitter } from 'events';

class GlobalRealtimeBus extends EventEmitter {
    private static instance: GlobalRealtimeBus;

    private constructor() {
        super();
        this.setMaxListeners(1000);
    }

    public static getInstance(): GlobalRealtimeBus {
        if (!GlobalRealtimeBus.instance) {
            GlobalRealtimeBus.instance = new GlobalRealtimeBus();
        }
        return GlobalRealtimeBus.instance;
    }

    public publish(businessId: string, event: string, data: any) {
        this.emit(`event:${businessId}`, { event, data });
    }

    public subscribe(businessId: string, callback: (payload: { event: string, data: any }) => void) {
        const handler = (payload: any) => callback(payload);
        this.on(`event:${businessId}`, handler);
        return () => this.off(`event:${businessId}`, handler);
    }
}

export const realtimeBus = GlobalRealtimeBus.getInstance();
