import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, AlertTriangle, ArrowRight, ClipboardList, Leaf } from 'lucide-react';

const HeroSection = ({ isAdmin = false }) => {
  const primaryAction = isAdmin
    ? { to: '/admin/reports', label: 'Check reports', Icon: ClipboardList }
    : { to: '/report-waste', label: 'Report a waste issue', Icon: AlertTriangle };
  const secondaryAction = isAdmin
    ? { to: '/admin/map', label: 'Open operational map' }
    : { to: '/map', label: 'View Interactive Map' };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#dbe4d8] bg-[#e9f1e8] px-5 py-12 sm:px-10 md:py-14">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c7ddc5]/55 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-40 w-72 rounded-tr-[8rem] bg-[#d8e9dc]/70" />

      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b7d0bc] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-[#1f6e5f] mb-6">
            <Leaf className="h-3.5 w-3.5" />
            Citywide environmental intelligence
          </span>
        </motion.div>

        <motion.h1 
          className="mb-5 text-4xl font-extrabold tracking-tight text-[#173d32] sm:text-5xl md:text-[3.4rem] md:leading-[1.08]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Cleaner streets, <br className="hidden md:inline" />
          <span className="text-[#227c70]">smarter operations.</span>
        </motion.h1>

        <motion.p 
          className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-[#526b5d] md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          TRASH CONTROL connects residents and municipal teams around one clear view of waste: where it is, what needs attention, and how quickly it is being resolved.
        </motion.p>

        <motion.div 
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link 
            to={primaryAction.to}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1f6e5f] px-6 text-sm font-bold text-dark-bg hover:-translate-y-0.5 hover:bg-[#175648] hover:shadow-neon-glow sm:w-auto"
          ><primaryAction.Icon className="h-5 w-5" /> {primaryAction.label} <ArrowRight className="h-4 w-4" />
          </Link>
          
          <Link 
            to={secondaryAction.to}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#aac7b0] bg-white/75 px-6 text-sm font-bold text-[#31594b] hover:border-[#227c70] hover:bg-white sm:w-auto"
          >
            <Map className="h-5 w-5 text-neon-blue" /> {secondaryAction.label}
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
