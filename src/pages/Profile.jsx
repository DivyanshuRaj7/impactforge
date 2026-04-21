import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      // Fetch my listings
      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .eq('donor_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Fetch my requests
      const { data: requests } = await supabase
        .from('requests')
        .select('*, listing:listings(title, photo_url)')
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false });

      setMyListings(listings || []);
      setMyRequests(requests || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-secondary" /></div>;
  }

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Curator';

  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-secondary">Dashboard</span>
            <div className="h-[1px] w-12 bg-outline-variant/30"></div>
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/30">Overview</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-on-surface leading-tight">Welcome <br/><span className="italic">{displayName}</span></h1>
        </div>
        <button
          onClick={signOut}
          className="text-xs font-bold uppercase tracking-widest text-[#ba1a1a] hover:bg-[#ffdad6]/20 py-2 px-4 rounded-sm transition-colors border border-[#ffdad6]/30 self-start md:self-auto"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Main Content Areas */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Active Listings / Registry */}
          <section>
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/20 pb-4">
              <h2 className="text-xl font-serif text-on-surface/80 tracking-tight">Your Active Exhibitions</h2>
              <Link to="/add" className="text-xs font-bold uppercase tracking-widest text-secondary hover:text-on-secondary-container transition-colors">Add Piece</Link>
            </div>
            
            <div className="space-y-6">
              {myListings.length === 0 ? (
                <div className="bg-surface-container-low p-8 rounded-lg text-center border-l-2 border-outline-variant/20">
                  <p className="text-sm text-on-surface-variant leading-relaxed">No pieces currently listed in the collection.</p>
                </div>
              ) : (
                myListings.map(item => (
                  <Link key={item.id} to={`/listing/${item.id}`} className="group block">
                    <div className="flex gap-6 bg-surface-container-lowest p-6 rounded-lg transition-all duration-300 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-transparent hover:border-outline-variant/20">
                      <div className="w-24 h-24 bg-surface-container-highest rounded-sm overflow-hidden flex-shrink-0 relative">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center"><span className="material-symbols-outlined text-outline-variant">inventory_2</span></div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-lg font-serif mb-1 group-hover:text-secondary transition-colors">{item.title}</h4>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{item.category} • {item.urgency === 'urgent' ? 'High Priority' : item.urgency === '24hrs' ? 'Within 24 Hrs' : 'Standard'}</p>
                      </div>
                      <div className="ml-auto flex items-center">
                         <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">arrow_forward</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Pending Requests */}
          <section>
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/20 pb-4">
              <h2 className="text-xl font-serif text-on-surface/80 tracking-tight">Your Requests</h2>
            </div>
            
            <div className="space-y-6">
              {myRequests.length === 0 ? (
                <div className="bg-surface-container-low p-8 rounded-lg text-center border-l-2 border-outline-variant/20">
                  <p className="text-sm text-on-surface-variant leading-relaxed">You have not requested any pieces yet.</p>
                </div>
              ) : (
                myRequests.map(req => (
                  <div key={req.id} className="flex gap-6 bg-surface-container-lowest p-6 rounded-lg opacity-80 hover:opacity-100 border border-transparent hover:border-outline-variant/20 transition-all">
                    <div className="w-16 h-16 bg-surface-container-highest rounded-sm overflow-hidden flex-shrink-0">
                      {req.listing?.photo_url ? (
                        <img src={req.listing.photo_url} alt={req.listing?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center"><span className="material-symbols-outlined text-outline-variant scale-75">inventory_2</span></div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-md font-serif mb-1">{req.listing?.title || 'Unknown Piece'}</h4>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                        Status: <span className={req.status === 'pending' ? 'text-tertiary-container' : 'text-secondary'}>{req.status}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Sidebar Info - Impact metrics */}
        <aside className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-primary-container text-on-primary p-10 rounded-lg relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] text-on-primary-fixed-variant uppercase tracking-widest font-bold mb-6">Metrics</p>
                <h2 className="text-3xl font-serif mb-8 leading-tight">Quantifying <span className="italic text-secondary-fixed">Philanthropy</span>.</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] tracking-widest border-b border-white/10 pb-4">
                    <span className="opacity-60 uppercase font-bold">PIECES LISTED</span>
                    <span className="font-serif text-2xl text-secondary-fixed">{myListings.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] tracking-widest border-b border-white/10 pb-4">
                    <span className="opacity-60 uppercase font-bold">REQUESTS MADE</span>
                    <span className="font-serif text-2xl text-secondary-fixed">{myRequests.length}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-tertiary-fixed/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
