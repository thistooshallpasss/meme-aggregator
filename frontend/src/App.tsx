import { ArrowUp, ArrowDown, CircleDot } from 'lucide-react';
import { useRealTimeData } from './hooks/useRealTimeData';
import { motion } from 'framer-motion';

const formatChange = (change: number) => {
  const isPositive = change > 0;
  const color = isPositive ? 'text-green-500' : 'text-red-500';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span className={`${color} flex items-center`}>
      {change.toFixed(2)}% <Icon size={14} className="ml-1" />
    </span>
  );
};

function App() {
  const { tokens, isConnected } = useRealTimeData();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-400 flex items-center">
          🔥 Meme Coin Aggregator
          <span className="text-xl ml-4 font-normal text-gray-400">(Live Updates)</span>
        </h1>
        <div className="mt-2 text-sm flex items-center">
          <CircleDot size={16} className={`mr-2 ${isConnected ? 'text-green-500' : 'text-yellow-500'}`} />
          Status: {isConnected ? 'Real-time Connected' : 'Connecting...'}
        </div>
      </header>

      <div className="overflow-x-auto shadow-xl rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price (SOL)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">1h Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">24h Volume</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Liquidity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sources</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {tokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Waiting for data from workers...
                </td>
              </tr>
            ) : (
              tokens.map((token) => (
                // ✅ FIX: Plain <tr> use kiya
                <tr key={token.token_address} className="bg-gray-900 hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{token.token_ticker}</div>
                    <div className="text-gray-400 text-xs truncate w-32">{token.token_name}</div>
                  </td>

                  <td className="px-6 py-4">
                    {/* ✅ FIX: key={price} hata kar layout use kiya, taaki smooth update ho */}
                    <motion.div
                      layout
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {token.price_sol.toPrecision(6)}
                    </motion.div>
                  </td>

                  <td className="px-6 py-4">{formatChange(token.price_1hr_change || 0)}</td>

                  <td className="px-6 py-4 text-gray-300">SOL {token.volume_sol.toFixed(2)}</td>

                  <td className="px-6 py-4 text-gray-300">SOL {token.liquidity_sol.toFixed(0)}</td>

                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {token.protocol.split(', ').slice(0, 2).join(', ')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-500">
        Data refreshed via BullMQ Worker every 30s. Updates pushed via Redis Pub/Sub & Socket.io.
      </footer>
    </div>
  );
}

export default App;