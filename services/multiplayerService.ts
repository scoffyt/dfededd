
import { NetworkMessage } from '../types';
import { Peer } from 'peerjs';

class MultiplayerService {
  private peer: any = null;
  private connections: Map<string, any> = new Map();
  private myId: string = '';
  private onMessageCallbacks: ((msg: NetworkMessage) => void)[] = [];

  constructor() {
    // Inicialização adiada para garantir que o ambiente do navegador esteja pronto
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.myId = 'fs-' + Math.random().toString(36).substring(2, 9);
    
    try {
      this.peer = new Peer(this.myId);

      this.peer.on('open', (id: string) => {
        console.log('Seu ID de Combate:', id);
      });

      this.peer.on('connection', (conn: any) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err: any) => {
        console.warn('Multiplayer temporariamente offline ou erro de Peer:', err.type);
      });
    } catch (e) {
      console.error('Falha ao iniciar PeerJS:', e);
    }
  }

  private setupConnection(conn: any) {
    conn.on('data', (data: NetworkMessage) => {
      this.onMessageCallbacks.forEach(cb => cb(data));
    });

    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log('Jogador entrou na sala:', conn.peer);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  getMyId() { return this.myId; }

  connectToPeer(remoteId: string) {
    if (!this.peer || this.connections.has(remoteId)) return;
    const conn = this.peer.connect(remoteId);
    this.setupConnection(conn);
  }

  broadcast(type: NetworkMessage['type'], payload: any) {
    if (!this.peer) return;
    
    const msg: NetworkMessage = {
      type,
      payload,
      senderId: this.myId
    };

    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  onMessage(callback: (msg: NetworkMessage) => void) {
    this.onMessageCallbacks.push(callback);
  }

  disconnect() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export const multiplayerService = new MultiplayerService();
