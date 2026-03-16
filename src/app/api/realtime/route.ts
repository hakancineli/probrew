import { NextRequest } from 'next/server';
import { realtimeBus } from '@/lib/events';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    const user = verifyToken(token);
    if (!user?.businessId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const businessId = user.businessId;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            // Heartbeat to keep connection alive (Vercel optimization)
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 15000);

            const unsubscribe = realtimeBus.subscribe(businessId, (payload) => {
                const message = `data: ${JSON.stringify(payload)}\n\n`;
                controller.enqueue(encoder.encode(message));
            });

            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                unsubscribe();
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
