import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { products } from '../data/products';
import { calculatePremiumSchedule, calculateFundingProjection } from '../utils/projections';
import { Calendar, User, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

// A simple, pure functional component for the report content
export const ClientReport: React.FC = () => {
  const { portfolio, userProfile } = useStore();
  const currentAge = userProfile.age ? (typeof userProfile.age === 'string' ? parseInt(userProfile.age) : userProfile.age) : 35;
  const currentDate = new Date().toLocaleDateString();

  // 1. Calculate Premium Timeline Data
  const timelineData = useMemo(() => {
    return calculatePremiumSchedule(portfolio, products, currentAge, userProfile.gender || 'male');
  }, [portfolio, currentAge, userProfile.gender]);

  // 2. Calculate Totals
  const totals = useMemo(() => {
    let totalAnnualPremium = 0;
    let taxDeductiblePremium = 0;
    let lifeProtectionPremium = 0;
    let ciProtectionPremium = 0;
    let savingsAnnualPremium = 0;

    portfolio.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      totalAnnualPremium += item.premium;
      if (product.isTaxDeductible) taxDeductiblePremium += item.premium;
      
      if (product.category === 'Life' || product.protectionType === 'Life Protection') {
        lifeProtectionPremium += item.premium;
      } else if (product.category === 'Critical Illness') {
        ciProtectionPremium += item.premium;
      }

      if (product.savingsPotential === 'High') {
        savingsAnnualPremium += item.premium;
      }
    });

    return {
      totalAnnualPremium,
      taxDeductiblePremium,
      estimatedTaxSaved: Math.min(taxDeductiblePremium, 60000) * 0.17,
      estimatedLifeCover: lifeProtectionPremium * 50,
      estimatedCICover: ciProtectionPremium * 15,
      savingsAnnualPremium
    };
  }, [portfolio]);

  // 3. Funding Analysis
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
          savingsPaymentTerm: gen.paymentTerm || 10, 
          savingsGrowthRate: gen.customReturnRate, 
          initialMedicalPremium: totalLinkedCost,
          startingAge: currentAge,
          fundingStrategy: product?.fundingStrategy,
          fundingStartYear: gen.fundingStartYear,
        });
  
        return {
          generatorName: product?.name,
          linkedCount: linkedItems.length,
          projection
        };
      }).filter(Boolean);
    }, [portfolio, currentAge]);

  // 4. Protection Details
  const protectionItems = useMemo(() => {
    return portfolio
      .map(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.medicalCoverage) {
          return {
            instanceId: item.instanceId,
            premium: item.premium,
            product,
            coverage: product.medicalCoverage
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [portfolio]);

  // 5. Wealth Projection Data
  const wealthProjectionData = useMemo(() => {
    if (totals.savingsAnnualPremium === 0) return [];
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
      });
    }
    return data;
  }, [totals.savingsAnnualPremium]);


  return (
    <div className="p-10 bg-white max-w-[210mm] mx-auto min-h-screen text-gray-900 font-sans print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Financial Planning Report</h1>
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Prepared for</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <User size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">{userProfile.name || 'Valued Client'}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 text-gray-500 mb-1 font-medium">
            <Calendar size={18} />
            <span>{currentDate}</span>
          </div>
          <div className="text-sm text-gray-400">Generated via Client CRM</div>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          Executive Summary
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
            <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Total Annual Premium</div>
            <div className="text-3xl font-bold text-blue-900">HKD {totals.totalAnnualPremium.toLocaleString()}</div>
          </div>
          <div className="p-6 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
            <div className="text-sm text-green-600 font-bold uppercase tracking-wider mb-2">Estimated Tax Saved</div>
            <div className="text-3xl font-bold text-green-700">HKD {totals.estimatedTaxSaved.toLocaleString()}</div>
          </div>
          <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="text-sm text-indigo-600 font-bold uppercase tracking-wider mb-2">Est. Life Protection</div>
            <div className="text-3xl font-bold text-indigo-700">HKD {totals.estimatedLifeCover.toLocaleString()}</div>
          </div>
        </div>
      </section>

      {/* Portfolio Breakdown */}
      <section className="mb-12 break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gray-600 rounded-full"></span>
          Your Portfolio
        </h2>
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Product</th>
                <th className="px-6 py-4 border-b border-gray-200">Category</th>
                <th className="px-6 py-4 border-b border-gray-200">Term</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Annual Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {portfolio.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <tr key={item.instanceId} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                        {product?.name}
                        {item.selectedVariant && product?.pricingTier && (
                            <div className="text-xs text-blue-600 font-normal mt-0.5">
                                {product.pricingTier.type}: {item.selectedVariant}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product?.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.paymentTerm ? `${item.paymentTerm} Yrs` : 'Whole Life'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">HKD {item.premium.toLocaleString()}</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50/80">
                <td colSpan={3} className="px-6 py-4 font-bold text-right text-gray-900 uppercase text-xs tracking-wider">Total Premium</td>
                <td className="px-6 py-4 font-bold text-right text-blue-600 text-lg">HKD {totals.totalAnnualPremium.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Funding / Premium Offset Analysis */}
      {fundingAnalysis.length > 0 && (
        <section className="mb-12 break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Funding Analysis
          </h2>
          <div className="grid grid-cols-1 gap-6">
             {fundingAnalysis.map((analysis, idx) => (
               <div key={idx} className="p-6 border border-amber-200 bg-amber-50/30 rounded-2xl break-inside-avoid">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="font-bold text-lg text-gray-900">{analysis?.generatorName}</h3>
                     <div className="text-sm text-gray-500 mt-1">Funding source for {analysis?.linkedCount} linked plan(s)</div>
                   </div>
                   <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                     analysis?.projection.isSustainable 
                       ? 'bg-green-100 text-green-700 border-green-200' 
                       : 'bg-red-100 text-red-700 border-red-200'
                   }`}>
                     {analysis?.projection.isSustainable ? 'Self-Sustaining' : 'Top-up Needed'}
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 p-4 bg-white/60 rounded-xl border border-amber-100">
                        <div className="text-xs text-gray-500 uppercase font-bold">Projected Status</div>
                        <div className={`text-xl font-bold ${analysis?.projection.isSustainable ? 'text-green-600' : 'text-amber-600'}`}>
                            {analysis?.projection.isSustainable ? 'Perpetual Funding' : `Depletes at Age ${analysis?.projection.depletionAge}`}
                        </div>
                    </div>
                 </div>

                 <p className="text-sm text-gray-600 leading-relaxed bg-white/40 p-4 rounded-xl">
                   {analysis?.projection.isSustainable 
                     ? `Based on projected returns, this plan is expected to fully cover the premiums for your linked protection plans indefinitely without depleting the principal.`
                     : `This plan can fund the linked premiums until Age ${analysis?.projection.depletionAge}. After this age, additional premium payments or top-ups will be required to maintain coverage.`
                   }
                 </p>
               </div>
             ))}
          </div>
        </section>
      )}

      {/* Protection Coverage Details */}
      {protectionItems.length > 0 && (
        <section className="mb-12 break-before-page">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-teal-500 rounded-full"></span>
            Coverage Details
          </h2>
          <div className="space-y-6">
            {protectionItems.map(({ instanceId, product, coverage }) => (
              <div key={instanceId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden break-inside-avoid shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                    product.category === 'Medical' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.category}
                  </span>
                </div>
                
                <div className="p-6 grid grid-cols-3 gap-8">
                  <div className="space-y-4 col-span-1">
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Annual Limit</div>
                        <div className="text-lg font-bold text-gray-900">{coverage.annualLimit}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                           <Activity size={12} /> Ward Class
                        </div>
                        <div className="font-medium text-gray-700">{coverage.wardClass}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                           <FileText size={12} /> Lifetime Limit
                        </div>
                        <div className="font-medium text-gray-700">{coverage.lifetimeLimit}</div>
                      </div>
                  </div>

                  <div className="col-span-2 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Key Benefits</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {coverage.majorBenefits?.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-teal-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-sm text-gray-800">{benefit.category}</div>
                            <div className="text-sm text-teal-700 font-medium">{benefit.limit}</div>
                            {benefit.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{benefit.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Future Wealth Potential */}
      {totals.savingsAnnualPremium > 0 && (
        <section className="mb-12 break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
            Future Wealth Potential
          </h2>
          <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
             <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Projected Total Value (20 Years)</p>
                  <h3 className="text-3xl font-bold text-amber-600">
                    HKD {wealthProjectionData[wealthProjectionData.length - 1]?.value.toLocaleString()}
                  </h3>
                </div>
                <div className="text-right">
                   <p className="text-gray-400 text-xs uppercase font-bold">Total Invested</p>
                   <p className="font-bold text-gray-700">HKD {(totals.savingsAnnualPremium * 20).toLocaleString()}</p>
                </div>
             </div>
             
             {/* Chart for Print - Fixed dimensions for reliable printing */}
             <div style={{ width: '100%', height: '300px' }}>
                <AreaChart width={700} height={300} data={wealthProjectionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValuePrint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} />
                  <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValuePrint)" strokeWidth={3} />
                </AreaChart>
             </div>
             <p className="text-xs text-gray-400 mt-4 text-center">
               * Projection based on hypothetical 4.5% annual return. Not guaranteed.
             </p>
          </div>
        </section>
      )}

      {/* Premium Timeline Table (Condensed) */}
      <section className="mb-12 break-before-page">
         <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
           <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
           Premium Timeline Projection
         </h2>
         <p className="text-sm text-gray-500 mb-4">
           Projected annual premiums based on current inflation assumptions (3% for Medical/CI) and selected payment terms.
         </p>
         <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
           <table className="w-full text-xs text-left">
             <thead className="bg-gray-50 font-bold text-gray-600 uppercase tracking-wider">
               <tr>
                 <th className="px-4 py-3">Age</th>
                 <th className="px-4 py-3">Year</th>
                 {/* Show top 3 products max to fit PDF width, or group others? Let's just show Total for PDF simplicity or all if few */}
                 {portfolio.length <= 5 && portfolio.map(item => (
                    <th key={item.instanceId} className="px-4 py-3 truncate max-w-[120px]">
                      {products.find(p => p.id === item.productId)?.name.split(' ').slice(0, 2).join(' ')}...
                    </th>
                 ))}
                 <th className="px-4 py-3 text-right bg-gray-100 text-gray-800">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {timelineData.filter((_, i) => i % 5 === 0 || i < 5).map(row => ( // Show first 5 years then every 5th year to save space
                 <tr key={row.age} className="even:bg-gray-50/50">
                   <td className="px-4 py-3 font-medium text-gray-900">{row.age}</td>
                   <td className="px-4 py-3 text-gray-500">{row.year}</td>
                   {portfolio.length <= 5 && portfolio.map(item => {
                      const prodName = products.find(p => p.id === item.productId)?.name;
                      return (
                        <td key={item.instanceId} className="px-4 py-3 text-gray-600">
                           {row.breakdown[prodName!] ? row.breakdown[prodName!].toLocaleString() : '-'}
                        </td>
                      );
                   })}
                   <td className="px-4 py-3 font-bold text-right bg-blue-50/30 text-blue-800">
                     {row.totalPremium.toLocaleString()}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           <div className="p-3 text-center text-xs text-gray-400 bg-gray-50 italic border-t border-gray-100">
             * Showing 5-year intervals after Year 5 for brevity.
           </div>
         </div>
      </section>

      {/* Disclaimer */}
      <div className="mt-auto pt-8 border-t border-gray-200 text-[10px] text-gray-400 leading-relaxed text-justify">
        <p>
          <strong>Disclaimer:</strong> This report is for illustrative purposes only and does not constitute a formal insurance offer or contract. 
          All figures, including premium projections, returns, and tax savings, are estimates based on current assumptions and the information provided. 
          Actual premiums and values may vary based on underwriting, policy terms, and future economic conditions. 
          Dividends and non-guaranteed benefits are not guaranteed. Please refer to the official policy documents and brochures for full details of coverage, exclusions, and terms.
        </p>
      </div>
    </div>
  );
};
