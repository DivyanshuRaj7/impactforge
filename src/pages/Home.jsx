import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeolocation } from '../../impactforge/src/hooks/useGeolocation';
import { getNearbyItems } from '../../impactforge/src/utils/getNearbyItems';

export default function Home() {
  const [filterMode, setFilterMode] = useState('all');
  const [category, setCategory] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [listings, setListings] = useState([]);
  const [fetching, setFetching] = useState(true);
  const { coords, loading: geoLoading, requestLocation } = useGeolocation();

  useEffect(() => {
    const fetchListings = async () => {
      setFetching(true);
      let query = supabase
        .from('listings')
        .select('*, donor:users!listings_donor_id_fkey(name, rating)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category !== 'all') query = query.eq('category', category);
      if (urgencyFilter !== 'all') query = query.eq('urgency', urgencyFilter);

      const { data, error } = await query;
      if (!error && data) {
        setListings(data.map(l => ({
          ...l,
          lat: l.location_lat,
          lng: l.location_lng,
          image_url: l.photo_url,
          pickup_time: l.pickup_time_slot,
        })));
      }
      setFetching(false);
    };
    fetchListings();
  }, [category, urgencyFilter]);

  useEffect(() => {
    if (filterMode === 'nearby' && !coords && !geoLoading) {
      requestLocation();
    }
  }, [filterMode, coords, geoLoading, requestLocation]);

  const filteredListings = useMemo(() => {
    if (filterMode === 'nearby' && coords) {
      return getNearbyItems(listings, coords, 2);
    }
    return listings;
  }, [filterMode, coords, listings]);

  return (
    <div className="p-6 md:px-12 w-full max-w-[1600px] mx-auto space-y-12">
      
      {/* Hero Header matching donation_categories.html */}
      <section className="text-center md:text-left max-w-4xl pt-8">
        <span className="font-sans text-xs tracking-widest uppercase text-secondary font-bold mb-4 block">IMPACTFORGE</span>
        <h1 className="font-serif text-5xl md:text-7xl text-on-surface tracking-tight mb-8">
          The Hub <br/><span className="italic text-on-surface-variant/70">of Community Impact</span>
        </h1>
        <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-2xl">
          Where intentionality meets tangible action. Join a community of stewards dedicated to transforming one person's extra into another's essential.
        </p>
      </section>

      {/* Filters (Luxury style) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-outline-variant/30">
        <div className="flex bg-surface-container-high p-1.5 rounded-sm w-full md:w-auto">
          <button
            className={`flex-1 md:px-8 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all ${filterMode === 'all' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant/70 hover:text-primary'}`}
            onClick={() => setFilterMode('all')}
          >
            All Pieces
          </button>
          <button
            className={`flex-1 md:px-8 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all flex items-center justify-center gap-2 ${filterMode === 'nearby' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant/70 hover:text-primary'}`}
            onClick={() => setFilterMode('nearby')}
          >
            <MapPin size={14} /> Nearby (&lt;2km)
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {['all', 'food', 'clothes', 'study', 'medicine', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${category === cat ? "bg-primary text-white border-primary shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)]" : "bg-transparent text-on-surface-variant/70 border-outline-variant/30 hover:border-on-surface-variant"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
        {fetching ? (
          <div className="col-span-full flex justify-center py-24"><Loader2 size={32} className="animate-spin text-secondary" /></div>
        ) : filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-surface-container-low rounded-lg">
            <h3 className="font-serif text-3xl mb-2 text-on-surface/40">No pieces available</h3>
            <p className="font-body text-sm text-on-surface-variant/60">Check back later or expand your filters.</p>
          </div>
        ) : (
          filteredListings.map(item => (
            <Link key={item.id} to={`/listing/${item.id}`} className="group cursor-pointer block">
              <div className="relative overflow-hidden aspect-[4/3] bg-surface-container-low rounded-lg shadow-sm transition-all duration-500 hover:shadow-2xl">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${item.image_url ? 'hidden' : 'flex'} w-full h-full bg-surface-container items-center justify-center`}>
                  <span className="material-symbols-outlined text-4xl text-outline-variant group-hover:scale-110 transition-transform">inventory_2</span>
                </div>
                
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest text-white">
                  {item.urgency === 'urgent' ? 'High Priority' : item.urgency === '24hrs' ? 'Needed Soon' : 'Standard'}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="font-serif text-2xl text-white mb-1.5 leading-tight">{item.title}</h3>
                  <div className="flex justify-between items-end">
                    <p className="font-body text-white/70 text-xs uppercase tracking-widest">{item.category}</p>
                    {item.distance != null && (
                      <p className="font-body text-tertiary-fixed text-xs font-bold tracking-widest">{item.distance} km</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

    </div>
  );
}
