import React, { useContext, useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import StatisticsCards from '../components/StatisticsCards';
import { getWasteReports } from '../services/api';
import { Leaf, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getWasteReports();
        if (data.success) {
          const reports = data.data || [];
          setStats({
            total: reports.length,
            pending: reports.filter((report) => report.status === 'pending').length,
            approved: reports.filter((report) => report.status === 'approved').length,
            resolved: reports.filter((report) => report.status === 'resolved').length
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      title: 'Geospatial Waste Mapping',
      desc: 'Pinpoint precise trash heaps on our interactive city mapping module.',
      icon: ShieldAlert,
      glowColor: 'text-neon-blue'
    },
    {
      title: 'Gamified Contributions',
      desc: 'Earn impact points, rank on regional scoreboards, and lock badges.',
      icon: Award,
      glowColor: 'text-neon-teal'
    },
    {
      title: 'Smart City Optimizations',
      desc: 'Directing collection fleets to clean hotspot coordinates efficiently.',
      icon: Leaf,
      glowColor: 'text-neon-purple'
    }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
      <HeroSection isAdmin={user?.role === 'admin'} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="mt-12 sm:mt-16"><StatisticsCards stats={stats} /></div>
      </motion.div>

      <div className="mt-20 mb-8 sm:mt-24">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-2xl font-extrabold tracking-tight text-[#173d32] md:text-3xl">
          <Sparkles className="h-5 w-5 text-[#4d9b68]" />
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx} 
                className="glass flex flex-col items-center rounded-2xl border border-dark-border bg-dark-card p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:neon-border"
              >
                <div className="mb-5 rounded-xl border border-[#cfe1d1] bg-[#eef6ed] p-3.5">
                  <Icon className={`h-8 w-8 ${feat.glowColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#24483b]">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-[#647b6e]">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
