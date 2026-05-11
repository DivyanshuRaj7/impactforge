import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PRESET_MESSAGES = [
  "I am interested in acquiring this piece for our collection.",
  "Is this piece available for immediate viewing or acquisition?",
  "I am acting on behalf of a third party to secure this donation.",
  "I can coordinate logistics at the proposed time."
];

export default function RequestFlow() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const type = searchParams.get('type'); // 'direct' or 'mediator'

  const [item, setItem] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(PRESET_MESSAGES[0]);
  const [status, setStatus] = useState('confirm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*, donor:users!listings_donor_id_fkey(name, email, rating)')
        .eq('id', id)
        .single();
      if (data) setItem({ ...data, image_url: data.photo_url });
      setFetching(false);
    };
    fetchListing();
  }, [id]);

  const handleSendRequest = async () => {
    setLoading(true);
    setError('');

    try {
      // Check for existing requests to prevent race condition
      const { data: existingRequests, error: checkError } = await supabase
        .from('requests')
        .select('id')
        .eq('listing_id', id)
        .in('status', ['pending', 'accepted']);

      if (checkError) throw checkError;
      if (existingRequests && existingRequests.length > 0) {
        throw new Error('This piece has already been requested by another curator.');
      }

      // Insert request into Supabase
      const { error: reqError } = await supabase.from('requests').insert({
        seeker_id: user.id,
        listing_id: id,
        status: 'pending',
        delivery_type: type === 'mediator' ? 'via_mediator' : 'direct',
        message: selectedMessage,
      });
      if (reqError) throw reqError;

      // Also insert a message into the messages table
      if (item) {
        await supabase.from('messages').insert({
          sender_id: user.id,
          receiver_id: item.donor_id,
          listing_id: id,
          message_type: 'preset',
          content: selectedMessage,
        });
      }

      setStatus('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-secondary" /></div>;
  }

  if (status === 'success') {
    return (
      <div className="pt-24 pb-32 px-6 max-w-[800px] mx-auto text-center min-h-[80vh] flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-secondary text-7xl mb-8" data-icon="task_alt">task_alt</span>
        <h2 className="text-4xl md:text-5xl font-serif text-on-surface mb-2 leading-tight">Acquisition <span className="italic">Initiated</span></h2>
        
        <div className="my-12 w-full max-w-md mx-auto relative">
          <div className="absolute inset-0 bg-surface-container-low rounded-lg transform -skew-y-2"></div>
          <div className="relative bg-surface-container-lowest p-8 border border-outline-variant/20 rounded-sm shadow-xl">
             {type === 'direct' ? (
                <>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">Curator Credentials Revealed</p>
                  <p className="text-2xl font-serif text-on-surface mb-2">{item?.donor?.name || 'Anonymous Curator'}</p>
                  <p className="text-sm font-body text-on-surface-variant">{item?.donor?.email || 'Awaiting contact'}</p>
                </>
             ) : (
                <>
                  <p className="text-[10px] text-secondary uppercase tracking-widest font-bold mb-4">Escrow Confirmed</p>
                  <p className="text-2xl font-serif text-on-surface mb-2">Mediator Assigned</p>
                  <p className="text-sm font-body text-on-surface-variant">Our concierge will guide the physical exchange securely.</p>
                </>
             )}
          </div>
        </div>

        <button onClick={() => navigate('/')} className="bg-primary text-on-primary px-12 py-5 text-sm font-bold tracking-widest uppercase rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-all">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-32 px-6 max-w-[800px] mx-auto">
      
      <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">
         <span className="material-symbols-outlined text-[18px]">arrow_back</span> Cancel Acquisition
      </button>

      <div className="mb-12">
         <h1 className="text-4xl md:text-5xl font-serif text-on-surface leading-tight mb-4">Formalize <span className="italic text-on-surface-variant text-3xl md:text-4xl">Request</span></h1>
         
         {item && (
           <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-6 flex gap-6 items-center shadow-sm">
             <div className="w-20 h-20 bg-surface-container-highest flex-shrink-0">
               {item.image_url ? (
                 <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center"><span className="material-symbols-outlined text-outline-variant">inventory_2</span></div>
               )}
             </div>
             <div>
               <h3 className="font-serif text-xl text-on-surface mb-1">{item.title}</h3>
               <p className="text-[10px] text-secondary uppercase tracking-widest font-bold">{type === 'direct' ? 'Direct Transfer' : 'Managed Escrow'}</p>
             </div>
           </div>
         )}
      </div>

      <div className="space-y-8">
        <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/40 mb-6">Select correspondence standard</h3>
        <div className="space-y-4">
          {PRESET_MESSAGES.map((msg, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedMessage(msg)}
              className={`p-6 border rounded-sm transition-all cursor-pointer ${selectedMessage === msg ? 'border-secondary bg-secondary/5 shadow-md' : 'border-outline-variant/20 bg-transparent hover:border-on-surface-variant hover:bg-surface-container-lowest'}`}
            >
              <div className="flex gap-4 items-center">
                 <span className={`material-symbols-outlined transition-colors ${selectedMessage === msg ? 'text-secondary' : 'text-outline-variant/30'}`} style={selectedMessage === msg ? {fontVariationSettings: "'FILL' 1"} : {}}>radio_button_checked</span>
                 <p className="text-sm font-body text-on-surface-variant leading-relaxed">{msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-[#ffdad6] bg-[#93000a]/50 p-4 rounded-sm border border-[#ffdad6]/20 mt-8 font-body">{error}</p>}

      <div className="pt-12 mt-12 border-t border-outline-variant/20 flex justify-end">
        <button
          onClick={handleSendRequest}
          disabled={loading}
          className="bg-primary text-on-primary px-12 py-5 text-sm font-bold tracking-widest uppercase rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-all flex items-center gap-3 w-full md:w-auto justify-center"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Dispatching...</> : 'Dispatch Request'}
        </button>
      </div>

    </div>
  );
}
