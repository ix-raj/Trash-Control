import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Gift, Sparkles, AlertCircle, ShoppingCart } from 'lucide-react';

const Marketplace = () => {
  const { user, token } = useContext(AuthContext);
  const { addNotification } = useContext(SocketContext) || { addNotification: () => {} };
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemedCode, setRedeemedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userScore, setUserScore] = useState(user?.impactScore || 0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const fetchRewards = async () => {
    setLoading(true);
    
    // Demo Fallback Data
    const demoRewards = [
      { _id: 'r1', title: 'Adopt a Native Tree', description: 'Support a native sapling plantation through a verified urban forest partner in India.', pointsCost: 50, stock: 999 },
      { _id: 'r2', title: '₹100 Eco-Store Voucher', description: 'Save on refill products, cloth bags, and low-waste essentials from local Indian stores.', pointsCost: 100, stock: 50 },
      { _id: 'r3', title: 'Metro Green Ride Pass', description: 'A one-day public transit benefit to encourage cleaner commutes in participating cities.', pointsCost: 150, stock: 20 },
      { _id: 'r4', title: 'Steel Tiffin Set', description: 'A durable stainless-steel lunch set made to replace single-use food packaging.', pointsCost: 200, stock: 15 },
      { _id: 'r5', title: 'Solar Lantern', description: 'A compact solar-powered lantern for resilient, low-energy lighting at home.', pointsCost: 300, stock: 5 },
      { _id: 'r6', title: 'Cycle Share Pass', description: 'A 30-minute public bicycle ride from a participating city mobility network.', pointsCost: 80, stock: 100 }
    ];

    try {
      const res = await axios.get(`${API_URL}/rewards`);
      if (res.data.success && res.data.data.length > 0) {
        setRewards(res.data.data);
      } else {
        setRewards(demoRewards); // Use demo data if DB is empty
      }
    } catch (err) {
      setRewards(demoRewards); // Use demo data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
    if (user) {
      setUserScore(user.impactScore);
    }
  }, [user]);

  const handleRedeem = async (rewardId, pointsCost) => {
    setErrorMessage('');
    setSuccessMessage('');
    setRedeemedCode('');

    // If these are demo rewards (which have IDs starting with 'r'), mock the redemption!
    if (rewardId.startsWith('r')) {
      const code = "DEMO-ECO-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setRedeemedCode(code);
      // Optional: simulate deducting points if they had any, or just leave it for demo
      setUserScore(prev => Math.max(0, prev - pointsCost));
      setSuccessMessage(`🎉 Redemption successful! Your coupon code is: ${code}`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      if (addNotification) {
        addNotification(`User ${user?.username || 'Guest'} redeemed reward for ${pointsCost} points!`);
      }
      return;
    }

    if (userScore < pointsCost) {
      setErrorMessage('Insufficient eco points! Report more waste to earn points.');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.post(`${API_URL}/rewards/redeem`, { rewardId }, config);
      if (res.data.success) {
        setRedeemedCode(res.data.code);
        setUserScore(res.data.newScore);
        setSuccessMessage(`Redemption successful! Your coupon code: ${res.data.code}`);
        setTimeout(() => setSuccessMessage(''), 5000);
        fetchRewards(); // Refresh stock
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Redemption failed.');
    }
  };

  return (
    <div className="w-full space-y-8 px-5 py-7 sm:px-8 lg:px-10">
      <div className="glass p-8 rounded-2xl border border-dark-border bg-dark-card flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-neon-teal" /> Eco Reward Marketplace
          </h2>
          <p className="text-gray-400 text-sm mt-1">Exchange your accumulated eco impact points for sustainability coupons and tree planting.</p>
        </div>
        <div className="text-right bg-neon-teal/5 border border-neon-teal/20 rounded-2xl px-6 py-4">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">My Balance</span>
          <span className="text-3xl font-extrabold text-neon-teal">{userScore} XP</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4" /> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-neon-teal/10 border border-neon-teal/30 text-neon-teal p-4 rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-[0_0_10px_rgba(0,245,212,0.1)]">
          <Sparkles className="h-4 w-4" /> {successMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs text-gray-500 py-20">Loading rewards catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div 
              key={reward._id} 
              className="glass hover:neon-border rounded-xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <Gift className="h-6 w-6 text-neon-teal" />
                  </div>
                  <span className="text-xs font-extrabold text-neon-teal bg-neon-teal/10 px-3 py-1 rounded-full border border-neon-teal/20">
                    {reward.pointsCost} XP
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{reward.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">{reward.description}</p>
              </div>

              <div className="border-t border-dark-border/60 pt-4 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Stock: {reward.stock} left</span>
                <button 
                  onClick={() => handleRedeem(reward._id, reward.pointsCost)}
                  className="bg-neon-teal hover:bg-neon-teal/80 text-dark-bg font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Redeem Reward
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
