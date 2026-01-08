import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { products } from '../data/products';
import { ChevronUp, ChevronDown, Calculator, ShieldCheck, TrendingUp, DollarSign, Activity, BarChart2, CalendarClock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { calculateFundingProjection, ProjectionResult } from '../utils/projections';
import { FundingAnalysisChart } from './FundingAnalysisChart';
import { PremiumTimelineChart } from './PremiumTimelineChart';
import { ProtectionSummaryModal } from './ProtectionSummaryModal';
import { PDFExportButton } from './PDFExportButton';

export const PortfolioSummary: React.FC = () => {
  const { portfolio, userProfile } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPremiumTimeline, setShowPremiumTimeline] = useState(false);
  const [showProtectionSummary, setShowProtectionSummary] = useState(false);
  const [showAnalysisFor, setShowAnalysisFor] = useState<{
    projection: ProjectionResult, 
    savingsName: string, 
    medicalName: string
  } | null>(null);

  // 1. Calculate Totals
  const totals = useMemo(() => {
    let totalAnnualPremium = 0;
    let taxDeductiblePremium = 0;
    let lifeProtectionPremium = 0;
    let ciProtectionPremium = 0;
    let savingsAnnualPremium = 0;

    portfolio.forEach(item => {
      // Don't double count linked items if you want "Net Out of Pocket"
      // But usually "Total Premium" implies total contract value. 
      // Let's count everything for "Total Premium Volume" but maybe show "Net" later.
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      totalAnnualPremium += item.premium;

      if (product.isTaxDeductible) {
        taxDeductiblePremium += item.premium;
      }

      if (product.category === 'Life' || product.protectionType === 'Life Protection') {
        lifeProtectionPremium += item.premium;
      } else if (product.category === 'Critical Illness') {
        ciProtectionPremium += item.premium;
      }

      if (product.savingsPotential === 'High') {
        savingsAnnualPremium += item.premium;
      }
    });

    // Tax Logic
    const deductibleAmount = Math.min(taxDeductiblePremium, 60000);
    const estimatedTaxSaved = deductibleAmount * 0.17;

    const estimatedLifeCover = lifeProtectionPremium * 50; 
    const estimatedCICover = ciProtectionPremium * 15; 

    return {
      totalAnnualPremium,
      totalMonthlyPremium: totalAnnualPremium / 12,
      taxDeductiblePremium,
      estimatedTaxSaved,
      estimatedLifeCover,
      estimatedCICover,
      savingsAnnualPremium
    };
  }, [portfolio]);

  // 2. Funding Projections (Premium Offset)
  const fundingAnalysis = useMemo(() => {
    const generators = portfolio.filter(item => {
      const product = products.find(p => p.id === item.productId);
      return product?.cashFlowType === 'Generator';
    });

    return generators.map(gen => {
      const product = products.find(p => p.id === gen.productId);
      const linkedItems = portfolio.filter(p => p.linkedTo === gen.instanceId);
      
      if (linkedItems.length === 0) return null;

      const totalLinkedCost = linkedItems.reduce((sum, i) => sum + i.premium, 0);
      
      const projection = calculateFundingProjection({
        savingsPremium: gen.premium,
        savingsPaymentTerm: 10, // Assuming 10-pay for now
        savingsGrowthRate: gen.customReturnRate, // Use custom rate if set
        initialMedicalPremium: totalLinkedCost,
        startingAge: typeof userProfile.age === 'number' ? userProfile.age : 30,
        fundingStrategy: product?.fundingStrategy,
        fundingStartYear: gen.fundingStartYear, // Use custom start year
      });

      return {
        generatorName: product?.name,
        linkedProductName: products.find(p => p.id === linkedItems[0]?.productId)?.name || 'Linked Plan', // Just pick first one for name
        linkedCount: linkedItems.length,
        projection
      };
    }).filter(Boolean);
  }, [portfolio, userProfile.age]);

  // 3. Simple Wealth Projection (Aggregate)
  const wealthProjectionData = useMemo(() => {
    if (totals.savingsAnnualPremium === 0) return [];
    // ... (existing simplified wealth projection logic)
    const data = [];
    let accumulatedValue = 0;
    const assumedGrowthRate = 0.045; 

    for (let year = 0; year <= 20; year++) {
      if (year > 0) {
        accumulatedValue = (accumulatedValue + totals.savingsAnnualPremium) * (1 + assumedGrowthRate);
      }
      data.push({
        year: `Yr ${year}`,
        value: Math.round(accumulatedValue),
        totalInvested: totals.savingsAnnualPremium * year
      });
    }
    return data;
  }, [totals.savingsAnnualPremium]);

  if (portfolio.length === 0) return null;

  return (
    <>
      {/* Sticky Bottom Bar */}
      <motion.div 
        layout
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 transition-all duration-300 ${isExpanded ? 'h-[85vh] rounded-t-3xl' : 'h-24'}`}
      >
        <div className="container mx-auto h-full flex flex-col">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-8 py-6 cursor-pointer hover:bg-gray-50 transition-colors rounded-t-3xl"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <Calculator size={24} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Premium</div>
                  <div className="text-2xl font-bold text-gray-900">
                    <span className="text-sm text-gray-500 mr-1">HKD</span>
                    {totals.totalAnnualPremium.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400">/yr</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 border-l border-gray-200 pl-8">
                <div className="p-2 bg-green-100 rounded-lg text-green-700">
                  <DollarSign size={20} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Est. Tax Saved</div>
                  <div className="text-xl font-bold text-green-600">
                    HKD {totals.estimatedTaxSaved.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </button>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-8 pt-0 bg-gray-50/50"
              >
                 {/* Top Action Bar */}
                 <div className="flex justify-end mb-6 gap-3">
                   <PDFExportButton />
                   <button
                     onClick={() => setShowProtectionSummary(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-xl font-bold transition-colors text-sm"
                   >
                     <ShieldCheck size={16} />
                     View Coverage Details
                   </button>
                   <button
                     onClick={() => setShowPremiumTimeline(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl font-bold transition-colors text-sm"
                   >
                     <CalendarClock size={16} />
                     View Lifetime Premium Schedule
                   </button>
                 </div>

                {/* Funding Analysis Section (Premium Offset) */}
                {fundingAnalysis.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity className="text-amber-500" />
                      Premium Offset Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fundingAnalysis.map((analysis, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-bold text-gray-800">{analysis?.generatorName}</div>
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                              Funding {analysis?.linkedCount} Plan(s)
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`text-3xl font-bold ${analysis?.projection.isSustainable ? 'text-green-600' : 'text-amber-600'}`}>
                              {analysis?.projection.isSustainable 
                                ? 'Forever' 
                                : `Age ${analysis?.projection.depletionAge}`
                              }
                            </div>
                            <div className="text-sm text-gray-500 leading-tight">
                              {analysis?.projection.isSustainable 
                                ? 'Projected to cover your medical costs indefinitely.'
                                : 'Projected age when savings pot depletes.'
                              }
                            </div>
                          </div>
                          
                          <button
                            onClick={() => setShowAnalysisFor({
                              projection: analysis!.projection,
                              savingsName: analysis!.generatorName!,
                              medicalName: analysis!.linkedProductName
                            })}
                            className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-blue-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <BarChart2 size={16} />
                            View Funding Chart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Tax Savings Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <DollarSign size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">Tax Savings</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Tax Deductible Premium</span>
                        <span className="font-medium">HKD {totals.taxDeductiblePremium.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Deductible Cap</span>
                        <span className="font-medium">HKD 60,000</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">Estimated Tax Saved (17%)</div>
                        <div className="text-3xl font-bold text-green-600">HKD {totals.estimatedTaxSaved.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Protection Summary Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">Protection Summary</h3>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Est. Life Cover</span>
                          <span className="font-bold text-indigo-900">HKD {totals.estimatedLifeCover.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: '70%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-500">Est. Critical Illness</span>
                          <span className="font-bold text-pink-600">HKD {totals.estimatedCICover.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: '40%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Wealth Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <TrendingUp size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900">Future Wealth Potential</h3>
                    </div>
                    {totals.savingsAnnualPremium > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 mb-4">
                          Projected value of your savings plans over 20 years (assuming 4.5% p.a.)
                        </div>
                        <div className="h-40 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={wealthProjectionData}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                // @ts-ignore
                                formatter={(value: number) => [`HKD ${value.toLocaleString()}`, 'Value']}
                              />
                              <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
                          <div>
                            <div className="text-xs text-gray-400">Total Invested (20y)</div>
                            <div className="text-sm font-medium">HKD {(totals.savingsAnnualPremium * 20).toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Projected Value (20y)</div>
                            <div className="text-xl font-bold text-amber-600">
                              HKD {wealthProjectionData[wealthProjectionData.length - 1]?.value.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 pb-8">
                        <TrendingUp size={48} className="mb-3 opacity-20" />
                        <p className="text-sm">Add Savings plans (like Bonus Power) to see wealth projection.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAnalysisFor && (
          <FundingAnalysisChart 
            projection={showAnalysisFor.projection}
            savingsName={showAnalysisFor.savingsName}
            medicalName={showAnalysisFor.medicalName}
            onClose={() => setShowAnalysisFor(null)}
          />
        )}
      </AnimatePresence>

      <PremiumTimelineChart 
        isOpen={showPremiumTimeline}
        onClose={() => setShowPremiumTimeline(false)}
      />
      
      <ProtectionSummaryModal
        isOpen={showProtectionSummary}
        onClose={() => setShowProtectionSummary(false)}
      />

      <PDFExportButton />
    </>
  );
};
