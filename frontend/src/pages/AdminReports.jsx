import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, ClipboardList, Clock, ShieldAlert, UserCheck } from 'lucide-react';
import { adminAssignTeam, adminUpdateReportStatus, getAdminReports } from '../services/api';

const statusStyles = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-sky-200 bg-sky-50 text-sky-800',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  rejected: 'border-red-200 bg-red-50 text-red-800'
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminReports();
      if (data.success) {
        setReports(data.data || []);
      } else {
        setError(data.message || 'Unable to load reports.');
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => (
    statusFilter === 'all'
      ? reports
      : reports.filter((report) => report.status === statusFilter)
  ), [reports, statusFilter]);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        const teamName = window.prompt('Enter name of cleaning crew to assign:');
        if (teamName) {
          await adminAssignTeam(id, teamName);
        } else {
          await adminUpdateReportStatus(id, 'approved');
        }
      } else if (action === 'reject') {
        await adminUpdateReportStatus(id, 'rejected');
      } else if (action === 'resolve') {
        await adminUpdateReportStatus(id, 'resolved');
      }
      await fetchReports();
    } catch (requestError) {
      window.alert(requestError.response?.data?.message || 'Report update failed.');
    }
  };

  const counts = {
    all: reports.length,
    pending: reports.filter((report) => report.status === 'pending').length,
    approved: reports.filter((report) => report.status === 'approved').length,
    resolved: reports.filter((report) => report.status === 'resolved').length
  };

  return (
    <div className="w-full space-y-6 px-5 py-7 sm:px-8 lg:px-10">
      <header className="flex flex-col justify-between gap-4 border-b border-[#dce8df] pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#4d8a73]">
            <ClipboardList className="h-4 w-4" /> Municipal report queue
          </div>
          <h1 className="text-2xl font-extrabold text-[#173d32] sm:text-3xl">Waste reports</h1>
          <p className="mt-1 text-sm text-[#5d7568]">Verify incidents, assign cleanup crews, and track resolution.</p>
        </div>
        <button onClick={fetchReports} className="rounded-lg border border-[#c9dbca] bg-white px-4 py-2 text-sm font-bold text-[#1f6e5f] hover:bg-[#eef5ed]">
          Refresh queue
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { key: 'all', label: 'All reports', icon: ClipboardList },
          { key: 'pending', label: 'Pending review', icon: Clock },
          { key: 'approved', label: 'Assigned / active', icon: UserCheck },
          { key: 'resolved', label: 'Resolved', icon: CheckCircle }
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setStatusFilter(key)} className={`rounded-xl border p-4 text-left transition-colors ${statusFilter === key ? 'border-[#1f6e5f] bg-[#eaf4eb]' : 'border-[#dce8df] bg-white hover:bg-[#f4f8f3]'}`}>
            <div className="flex items-center justify-between text-[#5d7568]"><span className="text-[11px] font-bold uppercase tracking-wider">{label}</span><Icon className="h-4 w-4 text-[#1f806f]" /></div>
            <strong className="mt-2 block text-2xl text-[#173d32]">{counts[key]}</strong>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#dce8df] bg-white shadow-[0_10px_30px_rgba(29,83,68,.06)]">
        <div className="flex items-center justify-between border-b border-[#e5eee5] px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[#173d32]"><ShieldAlert className="h-5 w-5 text-[#1f806f]" /> Incident queue</h2>
          <span className="text-xs font-semibold text-[#6b8475]">{filteredReports.length} shown</span>
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-[#6b8475]">Loading report queue...</div>
        ) : error ? (
          <div className="px-5 py-16 text-center text-sm text-red-700">{error}</div>
        ) : filteredReports.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-[#6b8475]">No reports match this status.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f6faf5] text-[11px] uppercase tracking-wider text-[#6b8475]">
                <tr>
                  <th className="px-5 py-3 font-bold">Waste report</th>
                  <th className="px-5 py-3 font-bold">Location</th>
                  <th className="px-5 py-3 font-bold">Reporter</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8efe8] text-[#31594b]">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-[#fbfdfb]">
                    <td className="px-5 py-4"><strong className="block text-[#173d32]">{report.wasteType || 'Other'}</strong><span className="text-xs text-[#6b8475]">{report.description || 'No description'}</span></td>
                    <td className="max-w-[230px] truncate px-5 py-4 text-xs">{report.location?.address || 'Location unavailable'}</td>
                    <td className="px-5 py-4 text-xs">{report.userId?.username || 'Citizen'}</td>
                    <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[report.status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>{report.status || 'pending'}</span></td>
                    <td className="space-x-2 px-5 py-4 text-right whitespace-nowrap">
                      {report.status === 'pending' && <><button onClick={() => handleAction(report._id, 'approve')} className="rounded-md bg-[#e7f3e8] px-2.5 py-1.5 text-xs font-bold text-[#1f6e5f] hover:bg-[#d6ead9]">Approve</button><button onClick={() => handleAction(report._id, 'reject')} className="rounded-md bg-[#fff0ed] px-2.5 py-1.5 text-xs font-bold text-[#a04d32] hover:bg-[#ffe2dc]">Reject</button></>}
                      {report.status === 'approved' && <button onClick={() => handleAction(report._id, 'resolve')} className="rounded-md bg-[#e7f3e8] px-2.5 py-1.5 text-xs font-bold text-[#1f6e5f] hover:bg-[#d6ead9]">Mark resolved</button>}
                      {report.status === 'resolved' && <span className="text-xs font-semibold text-[#6b8475]">Complete</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReports;
