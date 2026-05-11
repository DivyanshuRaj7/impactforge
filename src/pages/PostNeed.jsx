import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useGeolocation } from '../../impactforge/src/hooks/useGeolocation';

export default function PostNeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { coords, error: locationError, requestLocation } = useGeolocation();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'other',
    urgency: 'flexible',
    description: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!coords) {
      alert("We need your location to post a local need.");
      setLoading(false);
      return;
    }

    // Prefix title with [NEED] so we know it's a request, since schema only has listings table
    const prefixedTitle = `[NEED] ${formData.title}`;

    const { error } = await supabase.from('listings').insert({
      donor_id: user.id, // Using donor_id as creator ID
      title: prefixedTitle,
      category: formData.category,
      urgency: formData.urgency,
      description: formData.description,
      location_lat: coords.lat,
      location_lng: coords.lng,
      status: 'active'
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[800px] mx-auto">
      <div className="mb-12">
        <span className="font-sans text-xs tracking-widest uppercase text-secondary font-bold mb-4 block">Post A Need</span>
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface tracking-tight mb-4">
          Request <span className="italic text-on-surface-variant/70">Support</span>
        </h1>
        <p className="font-body text-on-surface-variant max-w-xl">
          Let the community know what you need. A nearby curator may be able to fulfill your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Info */}
        <div className="space-y-6 bg-surface-container-low p-8 rounded-lg border border-outline-variant/20">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-2">What do you need?</label>
            <input 
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Winter coat, Mathematics textbook"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface p-4 rounded-sm focus:ring-secondary focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-2">Category</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface p-4 rounded-sm focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="food">Nourishment</option>
                <option value="clothes">Apparel</option>
                <option value="study">Education</option>
                <option value="medicine">Medical</option>
                <option value="other">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-2">Urgency</label>
              <select 
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface p-4 rounded-sm focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="urgent">Critical (Immediate)</option>
                <option value="24hrs">Within 24 Hours</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 bg-surface-container-low p-8 rounded-lg border border-outline-variant/20">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-2">Additional Context</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide any specific details (e.g. size M, specific dietary restrictions)..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface p-4 rounded-sm focus:ring-secondary focus:border-secondary transition-all resize-none"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface/60 mb-2">Your Location</label>
            <div className="bg-surface-container-lowest border border-outline-variant/30 text-on-surface p-4 rounded-sm flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              <div className="flex-1">
                {locationError ? (
                  <p className="text-sm text-error font-bold">{locationError}</p>
                ) : coords ? (
                  <p className="text-sm">Coordinates acquired for precise matching.</p>
                ) : (
                  <p className="text-sm opacity-60">Location needed to match with nearby curators.</p>
                )}
              </div>
              {!coords && !locationError && (
                <button type="button" onClick={requestLocation} className="text-xs font-bold uppercase tracking-widest text-secondary hover:underline">
                  Locate Me
                </button>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !coords}
          className="w-full bg-primary text-on-primary py-4 text-sm font-bold tracking-widest uppercase rounded-sm hover:scale-[1.01] transition-transform shadow-lg disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Post Need'}
        </button>
      </form>
    </div>
  );
}
