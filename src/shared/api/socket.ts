
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return this.socket;

        // If there's a stale disconnected socket, clean it up
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        this.socket = io(`${baseUrl}/chat`, {
            auth: {
                token: `Bearer ${token}`
            },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        this.socket.on('connect', () => {
            console.log('Socket Connected:', this.socket?.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket Disconnected:', reason);
        });

        this.socket.on('reconnect', (attemptNumber: number) => {
            console.log('Socket Reconnected after', attemptNumber, 'attempts');
        });

        this.socket.on('reconnect_error', (error: Error) => {
            console.error('Socket reconnection error:', error.message);
        });

        return this.socket;
    }

    getSocket() {
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
