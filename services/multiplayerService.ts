
import { NetworkMessage } from '../types';
import Peer from 'peerjs';

class MultiplayerService {
  private peer: any;
  private connections: Map<string, any> = new Map();
  private myId: string = '';
  private onMessageCallbacks: ((msg: NetworkMessage) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // O ID será gerado aleatoriamente
    this.myId = 'fs-' + Math.random().toString(36).substring(2, 9);
    
    // Inicializa o PeerJS de forma estável
    this.peer = new Peer(this.myId);

    this.peer.on('open', (id: string) => {
      console.log('Meu ID de Combate:', id);
    });

    // Quando outro jogador tenta se conectar a mim
    this.peer.on('connection', (conn: any) => {
      this.setupConnection(conn);
    });

    this.peer.on('error', (err: any) => {
      console.error('Erro de Conexão Multiplayer:', err);
    });
  }

  private setupConnection(conn: any) {
    conn.on('data', (data: NetworkMessage) => {
      this.onMessageCallbacks.forEach(cb => cb(data));
    });

    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      console.log('Jogador conectado:', conn.peer);
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
    if (this.peer) this.peer.destroy();
  }
}

export const multiplayerService = new MultiplayerService();
