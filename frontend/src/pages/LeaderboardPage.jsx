import React, { useEffect, useState } from 'react';
import LeaderboardTable from '../components/LeaderboardTable';
import { Trophy, RefreshCw } from 'lucide-react';

const LeaderboardPage = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStandings = () => {
    setLoading(true);
    // Simulate fetching standings from cached database.
    // In production this maps to a GET /api/leaderboard or parses /api/analytics
    setTimeout(() => {
      setStandings([
        { _id: '1', username: 'ananya_mehta', impactScore: 520, rank: 1 },
        { _id: '2', username: 'arjun_nair', impactScore: 410, rank: 2 },
        { _id: '3', username: 'kavya_iyer', impactScore: 365, rank: 3 },
        { _id: '4', username: 'rohan_sharma', impactScore: 330, rank: 4 },
        { _id: '5', username: 'meera_patel', impactScore: 295, rank: 5 },
        { _id: '6', username: 'aditya_rao', impactScore: 260, rank: 6 },
        { _id: '7', username: 'ishita_sen', impactScore: 225, rank: 7 },
        { _id: '8', username: 'vivek_kumar', impactScore: 190, rank: 8 },
        { _id: '9', username: 'neha_reddy', impactScore: 165, rank: 9 },
        { _id: '10', username: 'sanjay_verma', impactScore: 140, rank: 10 },
        { _id: '11', username: 'tara_joshi', impactScore: 115, rank: 11 },
        { _id: '12', username: 'manav_gupta', impactScore: 85, rank: 12 },
        { _id: '13', username: 'diya_banerjee', impactScore: 60, rank: 13 }
      ]);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  return (
    <div className="w-full px-5 py-7 sm:px-8 lg:px-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
            Regional Leaderboard
          </h2>
          <p className="text-gray-400 text-sm mt-1">Top environmental contributors based on impact scores and resolved reports.</p>
        </div>

        <button 
          onClick={fetchStandings}
          className="flex items-center gap-1.5 bg-dark-bg border border-dark-border text-xs px-3.5 py-2 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center text-xs text-gray-500 py-20">Loading rankings...</div>
      ) : (
        <LeaderboardTable standings={standings} />
      )}
    </div>
  );
};

export default LeaderboardPage;
