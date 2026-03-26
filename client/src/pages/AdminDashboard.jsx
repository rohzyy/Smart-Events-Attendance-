import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, MapPin, Clock, CalendarDays, Activity } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 16.5062, 
  lng: 80.6480
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    radius: 100,
    requiredDuration: 120,
    startTime: '',
    endTime: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMapClick = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    }));
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: { lat: Number(formData.lat), lng: Number(formData.lng) },
        radius: Number(formData.radius),
        requiredDuration: Number(formData.requiredDuration),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      
      await axios.post('http://localhost:5000/api/events/create', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowForm(false);
      fetchEvents();
      setFormData({
        title: '', description: '', lat: defaultCenter.lat, lng: defaultCenter.lng, radius: 100, requiredDuration: 120,
        startTime: '', endTime: ''
      });
    } catch (err) {
      alert("Error creating event");
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/events/${eventId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchEvents();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Admin Panel</h1>
          <p className="text-sm text-gray-500 font-medium">Community Lead & Faculty</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm font-semibold rounded-full bg-blue-50 text-blue-700 px-3 py-1 border border-blue-100">{user?.name}</span>
            <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium hover:cursor-pointer transition duration-150 text-sm bg-red-50 px-3 py-1.5 rounded hover:bg-red-100">
            Logout
            </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-500 pl-3">Manage Events</h2>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:cursor-pointer transition hover:shadow-md"
          >
            <Plus size={18} /> <span className="font-medium">Create Event</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-gray-100 mb-8 transform transition-all duration-300">
            <h3 className="text-lg font-bold mb-6 text-gray-800 border-b pb-4">New Event Details</h3>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="E.g., Tech Symposium 2026" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" rows="2" placeholder="Describe the event..."></textarea>
              </div>

              {/* Map View directly in the form */}
              <div className="col-span-1 md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Location Picker (Click on map to set marker)</label>
                 {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                    <div className="bg-yellow-50 text-yellow-800 text-xs p-2 rounded mb-2 border border-yellow-200">
                      ℹ️ Using Google Maps Development Mode. Add `VITE_GOOGLE_MAPS_API_KEY` to `client/.env` to remove the watermark if you have one.
                    </div>
                 )}
                 {isLoaded ? (
                   <div className="border border-gray-300 rounded-lg overflow-hidden relative shadow-inner">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{ lat: Number(formData.lat) || defaultCenter.lat, lng: Number(formData.lng) || defaultCenter.lng }}
                      zoom={16}
                      onClick={handleMapClick}
                      options={{ mapTypeControl: false, streetViewControl: true }}
                    >
                      <Marker position={{ lat: Number(formData.lat), lng: Number(formData.lng) }} draggable onDragEnd={handleMapClick} />
                      <Circle 
                        center={{ lat: Number(formData.lat), lng: Number(formData.lng) }} 
                        radius={Number(formData.radius)}
                        options={{
                          fillColor: '#3b82f6',
                          fillOpacity: 0.25,
                          strokeColor: '#2563eb',
                          strokeOpacity: 0.9,
                          strokeWeight: 2,
                        }}
                      />
                    </GoogleMap>
                   </div>
                 ) : (
                   <div className="w-full h-[350px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
                     Loading map...
                   </div>
                 )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input required type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input required type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50" readOnly />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meters)</label>
                <input required min="10" type="number" name="radius" value={formData.radius} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-blue-600" />
                <p className="text-xs text-gray-500 mt-1">Change this to visualize the circle area instantly on the map.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Duration (mins)</label>
                <input required type="number" name="requiredDuration" value={formData.requiredDuration} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input required type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input required type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700" />
              </div>
              
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:cursor-pointer transition duration-150 font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:cursor-pointer transition hover:shadow-md font-medium">Save Event</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col items-start hover:shadow-md hover:-translate-y-1 transition duration-200">
              <div className="flex justify-between w-full items-start mb-3">
                <h3 className="text-lg font-bold text-gray-800 line-clamp-1 flex-1 pr-2">{evt.title}</h3>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  evt.status === 'live' ? 'bg-green-100 text-green-700 border border-green-200' : 
                  evt.status === 'ended' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {evt.status}
                </span>
              </div>
              
              <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-[2.5rem]">{evt.description}</p>
              
              <div className="space-y-2.5 w-full text-sm text-gray-600 mb-5 pb-5 border-b border-gray-100 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-500" />
                  <span className="font-medium text-gray-700">Radius: {evt.radius}m</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-500" />
                  <span className="font-medium text-gray-700">Req: {evt.requiredDuration} mins</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-700 text-xs">
                    {new Date(evt.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} <br/>to {new Date(evt.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              <div className="mt-auto w-full flex justify-between items-center bg-white">
                <select 
                  className="bg-gray-50 border border-gray-200 outline-none text-sm p-1.5 rounded-md text-gray-700 font-medium hover:cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={evt.status} 
                  onChange={(e) => handleStatusChange(evt._id, e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="ended">Ended</option>
                </select>
                
                <button onClick={() => navigate('/admin/event/' + evt._id)} className="text-blue-600 text-sm font-semibold hover:text-blue-800 flex items-center gap-1 hover:cursor-pointer bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                  <Activity size={16} /> Dashboard
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && !showForm && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <CalendarDays size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">No events deployed yet.</p>
              <p className="text-sm">Click the <strong>Create Event</strong> button to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
