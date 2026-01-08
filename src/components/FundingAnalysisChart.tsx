import React from 'react';
import { X, TrendingUp, Zap } from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

interface FundingAnalysisChartProps {
  projection: ProjectionResult;
  savingsName: string;
  medicalName: string;
  onClose: () => void;
}

export const FundingAnalysisChart: React.FC<FundingAnalysisChartProps> = ({
  projection,
  savingsName,
  medicalName,
  onClose
}) => {
  // Determine "Free after Year X"
  const freeYear = projection.crossoverYear || projection.depletionYear || 10; 
  const freeAge = (projection.cashFlow[0]?.age || 30) + freeYear - 1;
  const isTaxStrategy = savingsName.includes('Deferred Annuity'); // Simple check, or pass strategy prop

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap size={12} className="fill-amber-700" />
                {isTaxStrategy ? 'Tax Arbitrage Strategy' : 'Self-Funding Strategy'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Funding Analysis</h2>
            <p className="text-gray-500 mt-1">
              Visualizing how <span className="font-bold text-gray-700">{savingsName}</span> pays for <span className="font-bold text-gray-700">{medicalName}</span>.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                Projected Wealth
              </div>
              <div className="text-2xl font-bold text-green-900">
                HKD {projection.finalWealth.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 mt-1">
                Remaining cash value at Age 100
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                Medical Costs Covered
              </div>
              <div className="text-2xl font-bold text-blue-900">
                HKD {projection.cashFlow[projection.cashFlow.length - 1].cumulativeMedicalCost.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Total bills paid by the plan
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                Self-Funding Point
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {projection.crossoverYear ? `Year ${projection.crossoverYear}` : 'N/A'}
              </div>
              <div className="text-xs text-amber-600 mt-1">
                {projection.crossoverYear 
                  ? `(Age ${freeAge}) ${isTaxStrategy ? 'Tax Savings > Cost' : 'Returns > Cost'}` 
                  : 'Investment return never fully covers cost'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projection.cashFlow}>
                <defs>
                  <linearGradient id="colorUntouched" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="age" 
                  label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`HKD ${Math.round(value).toLocaleString()}`, "Value"]}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend iconType="circle" />
                
                {/* Line A: Untouched Growth (Green) */}
                <Line 
                  type="monotone" 
                  dataKey="untouchedSavingsValue" 
                  name={isTaxStrategy ? "Annuity Cash Value" : "Potential Growth (Untouched)"}
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />

                {/* Line B: Actual Net Growth (Blue) */}
                {!isTaxStrategy && (
                  <Area 
                    type="monotone" 
                    dataKey="savingsValue" 
                    name="Actual Net Wealth" 
                    stroke="#3b82f6" 
                    fill="url(#colorNet)" 
                    strokeWidth={3}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="cumulativeMedicalCost"
                  name={isTaxStrategy ? "Cumulative Medical Cost (Paid by Tax Refund)" : "Total Medical Paid"}
                  stroke="#ef4444"
                  fill="#fee2e2"
                  strokeWidth={2}
                  stackId="1" 
                />

              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Strategy Summary Text */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Strategy Verdict
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg">
              "By using <span className="font-bold text-blue-700">{savingsName}</span>, 
              you effectively get <span className="font-bold text-blue-700">{medicalName}</span> 
              {projection.isSustainable 
                ? <span className="text-green-600 font-bold mx-1">
                    {isTaxStrategy ? 'subsidized by your Tax Savings' : `for FREE after Year ${freeYear}`}
                  </span> 
                : <span className="text-amber-600 font-bold mx-1">subsidized until Year {freeYear}</span> 
              }, 
              while still growing your wealth to <span className="font-bold text-green-700">HKD {projection.finalWealth.toLocaleString()}</span>."
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
