import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Users, Calendar, MapPin, Plus, CheckCircle, Trophy } from 'lucide-react';
import { deleteCleanupCampaign, updateCleanupCampaign } from '../services/api';

const EventsHub = () => {
  const { user, token } = useContext(AuthContext);
  const { addNotification } = useContext(SocketContext) || { addNotification: () => {} };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Event Creation state (for admin users)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [date, setDate] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const fetchEvents = async () => {
    setLoading(true);

    const demoEvents = [
      { _id: 'e1', title: 'Connaught Place Plastic Sweep', description: 'Join a morning cleanup around the central business district. Gloves and segregated bags provided.', address: 'Connaught Place, New Delhi', date: new Date(Date.now() + 86400000 * 2).toISOString(), organizer: { username: 'Delhi Civic Cell' }, volunteers: [] },
      { _id: 'e2', title: 'Juhu Beach Waste Watch', description: 'Help prevent plastic and fishing debris from entering the Arabian Sea. Bring a reusable water bottle.', address: 'Juhu Beach, Mumbai, Maharashtra', date: new Date(Date.now() + 86400000 * 5).toISOString(), organizer: { username: 'Mumbai Eco Volunteers' }, volunteers: ['u1', 'u2', 'u3'] },
      { _id: 'e3', title: 'Cubbon Park Community Sweep', description: 'A monthly park cleanup focused on organic waste and public-bin awareness.', address: 'Cubbon Park, Bengaluru, Karnataka', date: new Date(Date.now() + 86400000 * 7).toISOString(), organizer: { username: 'Namma Bengaluru Green Team' }, volunteers: ['u1'] },
      { _id: 'e4', title: 'Marina Beach Shoreline Rescue', description: 'Clear shoreline litter and sort recyclable material with local community groups.', address: 'Marina Beach, Chennai, Tamil Nadu', date: new Date(Date.now() + 86400000 * 12).toISOString(), organizer: { username: 'Chennai Coastal Collective' }, volunteers: ['u1', 'u2'] },
      { _id: 'e5', title: 'Sabarmati Riverbank Cleanup', description: 'Remove mixed waste near the riverfront and identify locations needing better segregation.', address: 'Sabarmati Riverfront, Ahmedabad, Gujarat', date: new Date(Date.now() + 86400000 * 15).toISOString(), organizer: { username: 'Ahmedabad Clean City' }, volunteers: [] }
    ];

    try {
      const res = await axios.get(`${API_URL}/events`);
      if (res.data.success && res.data.data.length > 0) {
        setEvents(res.data.data);
      } else {
        setEvents(demoEvents);
      }
    } catch (err) {
      setEvents(demoEvents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleVolunteer = async (eventId) => {
    setSuccessMessage('');
    setErrorMessage('');
    
    if (eventId.startsWith('e')) {
      setSuccessMessage('🎉 Thanks for volunteering!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
      // Update UI volunteer count for demo events
      setEvents(prevEvents => prevEvents.map(evt => {
        if (evt._id === eventId && !evt.volunteers.includes('demo_user')) {
          return { ...evt, volunteers: [...evt.volunteers, 'demo_user'] };
        }
        return evt;
      }));

      // Simulate notification sent to Admin
      if (addNotification) {
        addNotification(`New volunteer (${user?.username || 'User'}) signed up for an event!`);
      }
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const res = await axios.post(`${API_URL}/events/${eventId}/join`, {}, config);
      if (res.data.success) {
        setSuccessMessage(res.data.message);
        setTimeout(() => setSuccessMessage(''), 5000);
        fetchEvents(); // Refresh volunteer lists
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to volunteer.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const payload = {
        title,
        description,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        date
      };
      const res = editingEvent
        ? await updateCleanupCampaign(editingEvent._id, payload)
        : await axios.post(`${API_URL}/events`, payload, config);
      const responseData = editingEvent ? res : res.data;
      if (responseData.success) {
        setSuccessMessage('✨ Cleanup event successfully scheduled!');
        setTimeout(() => setSuccessMessage(''), 5000);
        setShowCreateForm(false);
        setEditingEvent(null);
        
        if (addNotification) {
          addNotification(`New Community Cleanup Scheduled: ${title}! Join now.`);
        }
        
        // Clear
        setTitle('');
        setDescription('');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setDate('');
        fetchEvents();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create event.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const openEditEvent = (event) => {
    setEditingEvent(event);
    setTitle(event.title || '');
    setDescription(event.description || '');
    setAddress(event.location?.address || event.address || '');
    setLatitude(event.location?.coordinates?.[1] || '');
    setLongitude(event.location?.coordinates?.[0] || '');
    setDate(event.date ? new Date(event.date).toISOString().slice(0, 16) : '');
    setShowCreateForm(true);
  };

  const handleDeleteEvent = async (event) => {
    if (event._id.startsWith('e') || !window.confirm(`Remove ${event.title}?`)) return;
    try {
      await deleteCleanupCampaign(event._id);
      setSuccessMessage('Cleanup campaign removed.');
      fetchEvents();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to remove campaign.');
    }
  };

  return (
    <div className="w-full space-y-8 px-5 py-7 sm:px-8 lg:px-10">
      <div className="glass p-8 rounded-2xl border border-dark-border bg-dark-card flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-neon-teal" /> {user?.role === 'admin' ? 'Campaigns' : 'Community Cleanups Hub'}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{user?.role === 'admin' ? 'Create, schedule, and monitor community cleanup campaigns.' : 'Volunteer for local street cleanups, register attendance, and earn +50 Eco Points.'}</p>
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-neon-blue to-neon-teal text-dark-bg font-bold px-6 py-3 rounded-xl hover:shadow-neon-glow transition-all cursor-pointer text-xs"
          >
            <Plus className="h-4 w-4" /> Schedule Cleanup
          </button>
        )}
      </div>

      {successMessage && (
        <div className="bg-neon-teal/10 border border-neon-teal/30 text-neon-teal p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in shadow-[0_0_10px_rgba(0,245,212,0.1)]">
          <CheckCircle className="h-5 w-5" /> {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {showCreateForm && (
        <div className="glass p-8 rounded-2xl border border-dark-border bg-dark-card max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">{editingEvent ? 'Edit Cleanup Campaign' : 'Schedule New Cleanup'}</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Event Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60" />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Description</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60" />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Meeting Address</label>
              <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Latitude</label>
                <input type="number" step="any" required value={latitude} onChange={(e) => setLatitude(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60" />
              </div>
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5">Longitude</label>
                <input type="number" step="any" required value={longitude} onChange={(e) => setLongitude(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Date & Time</label>
              <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-blue/60 cursor-pointer" />
            </div>
            <button type="submit" className="w-full bg-neon-blue text-dark-bg font-bold py-3 rounded-xl mt-4 cursor-pointer">Publish Event</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-xs text-gray-500 py-20">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div key={evt._id} className="glass rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col justify-between hover:neon-border transition-all duration-300">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase font-bold text-neon-blue px-2.5 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20">
                    {new Date(evt.date) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(evt.date).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{evt.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-6">{evt.description}</p>

                <div className="flex items-start gap-1.5 text-xs text-gray-400 mb-6">
                  <MapPin className="h-4 w-4 text-neon-pink shrink-0 mt-0.5" />
                  <span>{evt.address || evt.location?.address}</span>
                </div>
              </div>

              <div className="border-t border-dark-border/60 pt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-yellow-400" /> Volunteers: {evt.volunteers?.length || 0}
                </span>

                {new Date(evt.date) > new Date() && (
                  <button 
                    onClick={() => handleVolunteer(evt._id)}
                    className="bg-neon-teal hover:bg-neon-teal/80 text-dark-bg font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    Volunteer Now
                  </button>
                )}
                {user?.role === 'admin' && !evt._id.startsWith('e') && (
                  <div className="ml-3 flex gap-2">
                    <button onClick={() => openEditEvent(evt)} className="text-xs font-bold text-[#227c70] hover:underline">Edit</button>
                    <button onClick={() => handleDeleteEvent(evt)} className="text-xs font-bold text-[#a04d32] hover:underline">Remove</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsHub;
