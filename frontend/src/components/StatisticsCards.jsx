import React from 'react';
import { ShieldCheck, Clock, FileText, BarChart } from 'lucide-react';

const StatisticsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Incidents',
      value: stats?.total || 0,
      icon: FileText,
      color: 'text-[#227c70]', borderColor: 'border-[#dbe4d8]', bgGlow: 'bg-white'
    },
    {
      title: 'Active / Pending',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'text-[#a8752d]', borderColor: 'border-[#dbe4d8]', bgGlow: 'bg-white'
    },
    {
      title: 'Resolved Piles',
      value: stats?.resolved || 0,
      icon: ShieldCheck,
      color: 'text-[#4d9b68]', borderColor: 'border-[#dbe4d8]', bgGlow: 'bg-white'
    },
    {
      title: 'Total Active Teams',
      value: stats?.approved || 0,
      icon: BarChart,
      color: 'text-[#6e7d4f]', borderColor: 'border-[#dbe4d8]', bgGlow: 'bg-white'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className={`glass flex min-h-[132px] flex-col justify-between rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 md:p-5 ${card.borderColor} ${card.bgGlow}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[.1em] text-[#7a9183]">{card.title}</span>
              <Icon className={`h-[18px] w-[18px] ${card.color}`} />
            </div>
            <div className="text-3xl font-extrabold tracking-tight text-[#173d32]">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;
