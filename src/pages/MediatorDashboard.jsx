import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import QuestMap from '../components/QuestMap';
import { useGeolocation } from '../../impactforge/src/hooks/useGeolocation';

export default function MediatorDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [fetching, setFetching] = useState(true);
  const { coords: mediatorLocation, requestLocation } = useGeolocation();

  useEffect(() => {
    fetchBridgeRequests();
    requestLocation();
  }, [requestLocation]);

  const fetchBridgeRequests = async () => {
    setFetching(true);
    // Fetch pending requests that need a mediator, OR requests already assigned to this mediator
    const { data, error } = await supabase
      .from('requests')
      .select('*, listing:listings(*, donor:users!listings_donor_id_fkey(name)), seeker:users!requests_seeker_id_fkey(name)')
      .eq('delivery_type', 'via_mediator')
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Filter out accepted requests that belong to OTHER mediators
      const visible = data.filter(r => r.status === 'pending' || r.mediator_id === user.id);
      setRequests(visible);
    }
    setFetching(false);
  };

  const handleAcceptBridge = async (requestId) => {
    const pickupCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const deliveryCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase
      .from('requests')
      .update({
        status: 'accepted',
        mediator_id: user.id,
        pickup_code: pickupCode,
        delivery_code: deliveryCode
      })
      .eq('id', requestId);

    if (!error) {
      fetchBridgeRequests();
    } else {
      alert('Failed to accept bridge. It may have been taken by another mediator.');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    const { error } = await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (!error) {
      fetchBridgeRequests();
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-secondary" /></div>;
  }

  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[1200px] mx-auto space-y-12">
      <div className="text-center md:text-left">
        <span className="font-sans text-xs tracking-widest uppercase text-secondary font-bold mb-4 block">Mediator Hub</span>
        <h1 className="font-serif text-4xl md:text-5xl text-on-surface tracking-tight mb-4">
          Bridge <span className="italic text-on-surface-variant/70">Dashboard</span>
        </h1>
        <p className="font-body text-on-surface-variant max-w-xl">
          Coordinate escrow transfers between curators and recipients. Your role ensures safety and privacy in the exchange.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {requests.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-surface-container-low rounded-lg border border-outline-variant/20">
            <h3 className="font-serif text-2xl mb-2 text-on-surface/40">No bridges available</h3>
            <p className="font-body text-sm text-on-surface-variant/60">Take a break, or check back later.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-surface-container-lowest p-6 rounded-sm shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-1">
                      {req.status === 'pending' ? 'Open Bridge' : 'Active Escrow'}
                    </p>
                    <h3 className="font-serif text-2xl text-on-surface">{req.listing?.title}</h3>
                  </div>
                  <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm ${req.listing?.urgency === 'urgent' ? 'bg-error/10 text-error' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {req.listing?.urgency}
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-outline-variant">person</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">From Curator</p>
                      <p className="font-body text-sm">{req.listing?.donor?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-outline-variant">hail</span>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40">To Recipient</p>
                      <p className="font-body text-sm">{req.seeker?.name || 'Anonymous'}</p>
                    </div>
                  </div>
                </div>

                {req.status === 'accepted' && (
                  <div className="w-full h-48 mb-6 rounded-md overflow-hidden border border-outline-variant/20 z-0 relative">
                     <QuestMap 
                        donorLocation={{ lat: req.listing?.location_lat, lng: req.listing?.location_lng }} 
                        mediatorLocation={mediatorLocation} 
                     />
                  </div>
                )}
              </div>

              {req.status === 'pending' ? (
                <button 
                  onClick={() => handleAcceptBridge(req.id)}
                  className="w-full bg-primary text-on-primary py-4 text-xs font-bold tracking-widest uppercase rounded-sm hover:scale-[1.02] transition-transform shadow-md"
                >
                  Accept Bridge Escrow
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-secondary-container/20 p-4 border border-secondary/20 rounded-sm mb-2">
                    <p className="text-xs font-bold text-secondary text-center uppercase tracking-widest">Bridge Assigned to You</p>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleStatusUpdate(req.id, 'completed')} className="w-full bg-surface-container-highest text-on-surface py-3 text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-outline-variant/30 transition-colors">
                      Confirm Pickup
                    </button>
                    <button onClick={() => handleStatusUpdate(req.id, 'completed')} className="w-full bg-surface-container-highest text-on-surface py-3 text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-outline-variant/30 transition-colors">
                      Confirm Delivery
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
