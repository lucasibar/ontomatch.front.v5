
import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket) return this.socket;

        this.socket = io(`http://localhost:3000/chat`, { // Hardcoded for now or use env
            auth: {
                token: `Bearer ${token}`
            },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Socket Connected:', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket Disconnected');
        });

        return this.socket;
    }

    getSocket() {
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new SocketService();
