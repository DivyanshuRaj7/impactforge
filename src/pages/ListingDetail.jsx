import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useGeolocation } from '../../impactforge/src/hooks/useGeolocation';
import { getNearbyItems } from '../../impactforge/src/utils/getNearbyItems';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coords, requestLocation } = useGeolocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, donor:users!listings_donor_id_fkey(name, rating)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setItem({
          ...data,
          lat: data.location_lat,
          lng: data.location_lng,
          image_url: data.photo_url,
          pickup_time: data.pickup_time_slot,
        });
      }
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  const distance = useMemo(() => {
    if (coords && item) {
      const augmented = getNearbyItems([item], coords, 99999);
      if (augmented.length > 0) return augmented[0].distance;
    }
    return null;
  }, [coords, item]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-secondary" /></div>;
  }

  if (!item) {
    return <div className="text-center text-on-surface-variant py-20 font-serif text-2xl">Piece not found in collection.</div>;
  }

  const handleRequest = (type) => {
    navigate(`/request/${item.id}?type=${type}`);
  };

  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left: Imagery */}
        <div className="lg:col-span-7">
          <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">
             <span className="material-symbols-outlined text-[18px]">arrow_back</span> Return to Collection
          </button>
          
          <div className="w-full aspect-[4/5] bg-surface-container-low rounded-sm overflow-hidden relative shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
            {item.image_url ? (
               <img 
                 src={item.image_url} 
                 alt={item.title} 
                 className="w-full h-full object-cover" 
                 onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                 }}
               />
            ) : null}
            <div className={`${item.image_url ? 'hidden' : 'flex'} w-full h-full bg-surface-container-highest items-center justify-center`}>
               <span className="material-symbols-outlined text-outline-variant text-6xl opacity-30">inventory_2</span>
            </div>
            <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-white/50">
              {item.urgency === 'urgent' ? 'High Priority' : item.urgency === '24hrs' ? 'Within 24 Hrs' : 'Standard Priority'}
            </div>
          </div>
        </div>

        {/* Right: Details & Provenance */}
        <div className="lg:col-span-5 lg:pt-16">
          <div className="space-y-12">
            
            {/* Header */}
            <div>
              <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">{item.category}</p>
              <h1 className="text-4xl md:text-5xl font-serif text-on-surface leading-tight mb-6">{item.title}</h1>
              <p className="text-lg font-body text-on-surface-variant leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Provenance details (Donor info) */}
            <div className="bg-surface-container-lowest p-8 rounded-sm shadow-sm border border-outline-variant/20">
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/40 mb-6">Provenance & Curator</h3>
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 rounded-full bg-secondary-container/30 flex justify-center items-center">
                    <span className="material-symbols-outlined text-secondary">person</span>
                 </div>
                 <div>
                    <h4 className="font-serif text-xl">{item.donor?.name || 'Anonymous Curator'}</h4>
                    <p className="text-[10px] tracking-widest uppercase font-bold text-on-surface-variant/70 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">star</span> {item.donor?.rating || 0} Curator Rating
                    </p>
                 </div>
              </div>
            </div>

            {/* Logistics details */}
            <div className="space-y-6 pt-6 border-t border-outline-variant/20">
              <div className="flex items-center gap-4">
                 <span className="material-symbols-outlined text-outline-variant">schedule</span>
                 <div>
                    <p className="text-[10px] tracking-widest uppercase font-bold text-on-surface/40">Collection Schedule</p>
                    <p className="font-body text-sm font-medium mt-0.5">{item.pickup_time}</p>
                 </div>
              </div>

              {distance !== null && (
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-outline-variant">near_me</span>
                  <div>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-on-surface/40">Distance Required</p>
                      <p className="font-body text-sm font-medium mt-0.5">{distance} kilometers from origin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Acquisition Actions */}
            <div className="pt-8">
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/40 mb-6">Acquire Piece</h3>
              <div className="space-y-4">
                <button onClick={() => handleRequest('direct')} className="w-full bg-primary text-on-primary py-5 text-sm font-bold tracking-widest uppercase rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-all">
                  Direct Acquisition
                </button>
                <button onClick={() => handleRequest('mediator')} className="w-full bg-surface-container-low text-on-surface py-5 text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-surface-container-highest transition-all flex justify-center items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span> Managed Escrow Transfer
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-6 leading-relaxed text-center opacity-60">
                Escrow transfers protect curator privacy by managing the physical exchange at a verified location.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
