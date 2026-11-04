import React, { useEffect, useState } from 'react';
import { getOperationalReports, getWasteReports } from '../services/api';
import SmartWasteMap from '../components/SmartWasteMap';
import { ListFilter, Map, RefreshCw } from 'lucide-react';

const MapView = ({ adminMode = false }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India default
  const [zoom, setZoom] = useState(5); // India overview

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await (adminMode ? getOperationalReports() : getWasteReports());
      if (data.success) {
        setReports(data.data);
        setFilteredReports(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [adminMode]);

  useEffect(() => {
    let result = reports;
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter(r => r.wasteType === typeFilter);
    }
    setFilteredReports(result);
  }, [statusFilter, typeFilter, reports]);

  const handleFocus = (coords) => {
    if (coords && coords.length === 2) {
      setCenter([coords[1], coords[0]]);
      setZoom(14); // Zoom in when focusing on a specific report
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#4d8a73]"><Map className="h-4 w-4" />{adminMode ? 'Municipal operations' : 'Community activity'}</div>
          <h2 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-[#173d32] sm:text-4xl">
            {adminMode ? 'Municipal operations map' : 'Community waste map'}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#5d7568] sm:text-base">{adminMode ? 'Review verified incidents, AI hotspots and cleanup routes across the municipality.' : 'See reported waste near your community, its status and nearby recovery hubs.'}</p>
        </div>

        <button 
          onClick={fetchReports}
          className="flex items-center gap-2 rounded-lg border border-[#c9dbca] bg-white px-4 py-2.5 text-sm font-bold text-[#2f6755] shadow-sm hover:border-[#227c70] hover:bg-[#f2f8f1]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <SmartWasteMap reports={filteredReports} center={center} zoom={zoom} adminMode={adminMode} />
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl border border-[#dbe4d8] bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-[#173d32]">
              <ListFilter className="h-[18px] w-[18px] text-[#227c70]" /> Filter map data
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.12em] text-[#71887a]">Status</label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-[#d4e1d4] bg-[#f8faf7] px-3 py-2.5 text-sm text-[#35594c] focus:border-[#227c70] focus:outline-none"
                >
                  <option value="all">All Incidents</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.12em] text-[#71887a]">Waste type</label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-[#d4e1d4] bg-[#f8faf7] px-3 py-2.5 text-sm text-[#35594c] focus:border-[#227c70] focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Organic">Organic</option>
                  <option value="E-waste">E-waste</option>
                  <option value="Metal">Metal</option>
                  <option value="Glass">Glass</option>
                  <option value="Hazardous">Hazardous</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass flex h-[360px] flex-col rounded-2xl border border-[#dbe4d8] bg-white p-5">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-extrabold text-[#173d32]">Location logs</h3><span className="rounded-full bg-[#edf6ed] px-2 py-1 text-xs font-bold text-[#35745d]">{filteredReports.length}</span></div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="py-10 text-center text-sm text-[#71887a]">Loading locations...</div>
              ) : filteredReports.length === 0 ? (
                <div className="py-10 text-center text-sm text-[#71887a]">No matching reports.</div>
              ) : (
                filteredReports.map((report) => (
                  <div 
                    key={report._id}
                    onClick={() => handleFocus(report.location?.coordinates)}
                    className="cursor-pointer rounded-xl border border-[#e1e9df] bg-[#fafcf9] p-3 text-left transition-colors hover:border-[#9fc3a7] hover:bg-[#f2f8f1]"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-[#31594b]">{report.wasteType}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${report.status === 'resolved' ? 'border-[#b9dcc0] bg-[#edf7ed] text-[#35745d]' : report.status === 'pending' ? 'border-[#ecd39b] bg-[#fff8e8] text-[#9a6a1d]' : 'border-[#bdd8ed] bg-[#eff7fd] text-[#3973a2]'}`}>{report.status}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-[#71887a]">{report.location.address}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
