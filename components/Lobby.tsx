
import React from 'react';

interface Props {
  onBack: () => void;
  onJoin: () => void;
}

const Lobby: React.FC<Props> = ({ onBack, onJoin }) => {
  const mockServers = [
    { name: "BRASIL | RIO DE JANEIRO #1", players: "4/16", ping: "15ms" },
    { name: "EUROPE | LONDON OFFICE", players: "12/16", ping: "120ms" },
    { name: "LOCAL SESSION (BROADCAST)", players: "ONLINE", ping: "0ms" }
  ];

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white z-50 p-10 font-mono">
      <div className="w-full max-w-4xl border-2 border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="bg-zinc-800 p-4 border-b-2 border-zinc-700 flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-tighter text-yellow-500 uppercase">Procurar Servidores</h2>
          <span className="text-xs text-zinc-500">LISTA DE BROADCAST ATIVA</span>
        </div>

        <div className="p-4 overflow-y-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-[10px] uppercase border-b border-zinc-800">
                <th className="pb-2">Nome do Servidor</th>
                <th className="pb-2">Jogadores</th>
                <th className="pb-2">Ping</th>
                <th className="pb-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {mockServers.map((s, i) => (
                <tr key={i} className="hover:bg-zinc-800 transition-colors">
                  <td className="py-4 text-sm font-bold">{s.name}</td>
                  <td className="py-4 text-xs text-green-500">{s.players}</td>
                  <td className="py-4 text-xs text-zinc-400">{s.ping}</td>
                  <td className="py-4">
                    <button 
                      onClick={onJoin}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black px-4 py-1 text-[10px] font-black uppercase italic"
                    >
                      Conectar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-800 p-4 border-t-2 border-zinc-700 flex justify-end space-x-4">
          <button onClick={onBack} className="text-xs uppercase hover:underline text-zinc-400">Voltar ao Menu</button>
          <button className="text-xs uppercase hover:underline text-yellow-500">Atualizar Lista</button>
        </div>
      </div>
      
      <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest text-center max-w-md">
        Dica: Para testar o multiplayer, abra este site em duas janelas do navegador lado a lado.
      </p>
    </div>
  );
};

export default Lobby;
