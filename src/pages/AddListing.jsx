import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../../impactforge/src/hooks/useGeolocation';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AddListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const { coords, error: geoError, requestLocation } = useGeolocation();

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('flexible');
  const [description, setDescription] = useState('');
  const [pickupTime, setPickupTime] = useState('');

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return alert("Please select a category.");
    if (!coords) return alert("Location is required to post a listing. Please enable location permissions.");
    setLoading(true);

    try {
      let photo_url = null;

      // 1. Upload photo to Supabase Storage
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('listings-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          console.error('Upload Error:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('listings-photos')
          .getPublicUrl(fileName);
        
        if (!urlData || !urlData.publicUrl) {
          throw new Error('Failed to retrieve public URL for the uploaded image.');
        }
        
        photo_url = urlData.publicUrl;
      }

      // 2. Insert listing into Supabase
      const donorLocation = coords || { lat: 0, lng: 0 };

      const { error: insertError } = await supabase.from('listings').insert({
        donor_id: user.id,
        title,
        category,
        urgency,
        description,
        photo_url,
        pickup_time_slot: pickupTime,
        location_lat: donorLocation.lat,
        location_lng: donorLocation.lng,
        status: 'active',
      });

      if (insertError) throw insertError;

      navigate('/');
    } catch (err) {
      console.error('Failed to create listing:', err);
      alert('Failed to create listing. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-8 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Main Form Area */}
        <div className="lg:col-span-8">
          
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-secondary">Contribution</span>
              <div className="h-[1px] w-12 bg-outline-variant/30"></div>
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/30">Registry</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-light text-on-surface leading-tight">Curate Your <br/><span className="italic">Contribution</span></h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* Section 1: Selection */}
            <section>
              <h2 className="text-xl font-serif mb-8 text-on-surface/80 tracking-tight">Select pieces for the collection</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {[
                  { id: 'clothes', title: 'Textiles & Apparel', desc: 'Garments, fabrics, and accessories.', icon: 'apparel' },
                  { id: 'food', title: 'Culinary Provisions', desc: 'Fresh or packaged nutrition items.', icon: 'restaurant' },
                  { id: 'study', title: 'Literary & Study', desc: 'Books, academic materials, and supplies.', icon: 'menu_book' },
                  { id: 'medicine', title: 'Health & Wellness', desc: 'Over the counter essentials and aides.', icon: 'medical_services' },
                  { id: 'other', title: 'Art & Media', desc: 'Other high-end donations.', icon: 'devices_other' }
                ].map(cat => (
                  <div 
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`group relative overflow-hidden p-8 rounded-lg transition-all duration-500 cursor-pointer ${category === cat.id ? 'bg-surface-container-lowest ring-2 ring-secondary/40 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)]' : 'bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.06)]'}`}
                  >
                    <div className="flex justify-between items-start mb-12">
                      <div className={`${category === cat.id ? 'bg-secondary-container/30' : 'bg-surface-container-highest'} p-4 rounded-full transition-colors`}>
                        <span className="material-symbols-outlined text-secondary text-3xl" data-icon={cat.icon}>{cat.icon}</span>
                      </div>
                      <span className={`material-symbols-outlined ${category === cat.id ? 'text-secondary' : 'text-outline-variant group-hover:text-secondary group-hover:rotate-90 transition-all'}`} style={category === cat.id ? {fontVariationSettings: "'FILL' 1"} : {}}>{category === cat.id ? 'check_circle' : 'add_circle'}</span>
                    </div>
                    <h3 className="text-2xl font-serif mb-2">{cat.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{cat.desc}</p>
                  </div>
                ))}

              </div>
            </section>

            {/* Section 2: Details */}
            <section className="pt-8 border-t border-outline-variant/30">
              <h2 className="text-xl font-serif mb-8 text-on-surface/80 tracking-tight">Provenance & Quality</h2>
              
              <div className="space-y-12">
                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-2 block">Name of the piece</label>
                  <input type="text" className="input-field" placeholder="E.g. Antique Oak Desk..." required value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-2 block">Describe your pieces</label>
                  <textarea className="input-field min-h-[100px] resize-none" placeholder="Enter a brief inventory description..." required value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-4 block">Priority / Need Status</label>
                    <div className="flex flex-col gap-4">
                      {['flexible', '24hrs', 'urgent'].map(urg => (
                        <button 
                          key={urg}
                          type="button"
                          onClick={() => setUrgency(urg)}
                          className={`py-3 px-4 rounded-sm border ${urgency === urg ? 'border-2 border-secondary text-secondary bg-secondary/5' : 'border-outline-variant/20 hover:border-secondary hover:text-secondary'} text-xs font-bold uppercase tracking-widest transition-all text-left`}
                        >
                          {urg === 'flexible' ? 'Standard Timeline' : urg === '24hrs' ? 'Needed within 24 Hours' : 'High Priority (Urgent)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface/40 mb-4 block">Collection Arrangements</label>
                    <input type="text" className="input-field" placeholder="E.g. Tomorrow 10 AM, Front Desk" required value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                    
                    <div className="mt-8 flex items-center gap-4 h-full pt-2">
                       <label className="cursor-pointer flex items-center gap-4 group">
                          <div className="w-16 h-16 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col items-center justify-center group-hover:bg-surface-container-highest transition-all relative overflow-hidden">
                            {preview ? (
                               <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                            ) : (
                               <span className="material-symbols-outlined text-on-surface/40 group-hover:scale-110 transition-transform" data-icon="photo_camera">photo_camera</span>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                          </div>
                          <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Attach Imagery<br/><span className="text-secondary font-bold">(Exhibition Standard)</span></p>
                       </label>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* Geolocation Notice & Submit */}
            <div className="pt-12 mt-12 border-t border-outline-variant/20">
              <div className="flex items-start gap-4 mb-12">
                <span className="material-symbols-outlined text-secondary text-xl" data-icon="verified">{geoError ? 'error' : 'verified'}</span>
                <p className="text-[11px] leading-relaxed text-on-surface-variant uppercase tracking-widest">
                  {coords ? `Curator location secured: [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]` : geoError ? <span className="text-error font-bold">{geoError}</span> : 'Acquiring curator coordinates for optimal routing...'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <button type="button" onClick={() => navigate(-1)} className="text-xs font-bold uppercase tracking-widest text-on-surface/40 hover:text-on-surface transition-colors">Abort Entry</button>
                <button type="submit" disabled={loading} className="bg-primary text-on-primary px-12 py-5 text-sm font-bold tracking-widest uppercase rounded-sm shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-all flex items-center gap-3">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> Finalizing...</> : 'Proceed to Registry'}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Sidebar Info - Static layout matching template */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-primary-container text-on-primary p-10 rounded-lg relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-serif mb-6 leading-tight">Your impact is <span className="italic text-secondary-fixed">immeasurable</span>.</h2>
                <p className="text-on-primary-container text-sm leading-relaxed mb-8">Scheduling this collection directly supports our winter exhibition series and educational outreach programs.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="bg-surface-container-low p-10 rounded-lg">
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-on-surface/40 mb-8">Registry Draft</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0">
                    {preview ? (
                       <img src={preview} className="w-full h-full object-cover" alt="Preview"/>
                    ) : (
                       <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant">image</span></div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight line-clamp-1">{title || 'Awaiting Nomenclature...'}</h4>
                    <p className="text-[11px] text-on-surface-variant uppercase tracking-widest mt-1">{category || 'TBD'} • {urgency}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
