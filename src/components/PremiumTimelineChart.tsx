import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { products } from '../data/products';
import { calculatePremiumSchedule } from '../utils/projections';
import { X, CalendarClock, Table, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PremiumTimelineChartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumTimelineChart: React.FC<PremiumTimelineChartProps> = ({ isOpen, onClose }) => {
  const { portfolio, userProfile } = useStore();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  const currentAge = userProfile.age ? (typeof userProfile.age === 'string' ? parseInt(userProfile.age) : userProfile.age) : 35;

  const data = useMemo(() => {
    return calculatePremiumSchedule(portfolio, products, currentAge);
  }, [portfolio, currentAge]);

  // Extract all unique product names for the stacked area chart keys
  const productKeys = useMemo(() => {
    const keys = new Set<string>();
    data.forEach(d => Object.keys(d.breakdown).forEach(k => keys.add(k)));
    return Array.from(keys);
  }, [data]);

  // Generate colors for products
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'
  ];

  if (!isOpen) return null;

  const totalLifetimePremium = data.reduce((sum, d) => sum + d.totalPremium, 0);
  const maxAnnualPremium = Math.max(...data.map(d => d.totalPremium));
  const peakYear = data.find(d => d.totalPremium === maxAnnualPremium)?.year || 1;
  const peakAge = currentAge + peakYear;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <CalendarClock size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Premium Timeline Analysis</h2>
                <p className="text-gray-500 text-sm">Projected annual premiums from Age {currentAge} to 100</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('chart')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <BarChart2 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Table size={18} />
                </button>
            </div>

            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">Total Lifetime Premium</div>
                <div className="text-2xl font-bold text-gray-900">
                  HKD {(totalLifetimePremium / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-gray-400 mt-1">Estimated total cost to age 100</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">Peak Annual Premium</div>
                <div className="text-2xl font-bold text-blue-600">
                  HKD {maxAnnualPremium.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 mt-1">Occurs at Age {peakAge}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm text-gray-500 font-medium mb-1">Active Plans</div>
                <div className="text-2xl font-bold text-green-600">
                  {portfolio.length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Including {productKeys.length} unique products</div>
              </div>
            </div>

            {/* Content Switcher */}
            {viewMode === 'chart' ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      {productKeys.map((key, index) => (
                        <linearGradient key={key} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Age', position: 'insideBottomRight', offset: -10 }} 
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      // @ts-ignore
                      formatter={(value: number) => [`HKD ${value.toLocaleString()}`, ""]}
                      labelFormatter={(label) => `Age ${label}`}
                    />
                    <Legend />
                    {productKeys.map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={`breakdown.${key}`}
                        name={key}
                        stackId="1"
                        stroke={colors[index % colors.length]}
                        fill={`url(#color-${index})`}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0">
                    <tr>
                      <th className="px-6 py-4 border-b border-gray-200">Age</th>
                      <th className="px-6 py-4 border-b border-gray-200">Year</th>
                      {productKeys.map((key) => (
                        <th key={key} className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{key}</th>
                      ))}
                      <th className="px-6 py-4 border-b border-gray-200 bg-gray-50 text-right">Total Annual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((row) => (
                      <tr key={row.age} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-gray-900">{row.age}</td>
                        <td className="px-6 py-3 text-gray-500">{row.year}</td>
                        {productKeys.map((key) => (
                          <td key={key} className="px-6 py-3 text-gray-600 whitespace-nowrap">
                            {row.breakdown[key] ? `HKD ${row.breakdown[key].toLocaleString()}` : '-'}
                          </td>
                        ))}
                        <td className="px-6 py-3 font-bold text-blue-600 text-right bg-gray-50/30">
                          HKD {row.totalPremium.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3 items-start">
              <InfoIcon className="shrink-0 mt-0.5" size={16} />
              <p>
                <strong>Note:</strong> Medical and Protection plan premiums are estimated to increase by 3% annually due to inflation. 
                Savings plans are calculated based on the payment term you selected (default 10 years).
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InfoIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);
