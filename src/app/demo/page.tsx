export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-900 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            TrendDojo Demo
          </h1>
          <p className="text-xl text-gray-300">
            See how professional traders manage risk and execute with discipline
          </p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Position Calculator</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Account Balance
                </label>
                <input
                  type="number"
                  defaultValue="50000"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  defaultValue="2"
                  step="0.1"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Entry Price
                </label>
                <input
                  type="number"
                  defaultValue="145.32"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Stop Loss
                </label>
                <input
                  type="number"
                  defaultValue="142.50"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Calculated Position</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Amount:</span>
                  <span className="text-white font-bold">$1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Per Share:</span>
                  <span className="text-white font-bold">$2.82</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Position Size:</span>
                  <span className="text-green-400 font-bold text-xl">354 shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Investment:</span>
                  <span className="text-white font-bold">$51,443</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Loss:</span>
                  <span className="text-red-400 font-bold">$1,000 (2%)</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                Execute Trade
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            This is just a preview. Sign up for full access to:
          </p>
          <ul className="text-left max-w-md mx-auto text-gray-300 space-y-2 mb-8">
            <li>• Live market data integration</li>
            <li>• Broker connectivity</li>
            <li>• Advanced risk management</li>
            <li>• Trade journaling & analytics</li>
            <li>• Portfolio monitoring</li>
          </ul>
          
          <a
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}