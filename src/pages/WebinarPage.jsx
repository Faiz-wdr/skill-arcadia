import React, { useState, useEffect } from 'react';
import BackgroundAtmosphere from '../components/BackgroundAtmosphere';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { getWebinarBySlug, getInitialWebinar } from '../services/webinarService';
import { supabase } from '../lib/supabase';

export default function WebinarPage() {
  // Start with cached webinar date if available to prevent digit flicker
  const [webinar, setWebinar] = useState(getInitialWebinar);

  useEffect(() => {
    // Page load animation trigger
    const animTimer = setTimeout(() => {
      document.body.classList.add('is-loaded');
    }, 100);

    // Fetch dynamic webinar data from Supabase
    async function loadWebinar() {
      const { data } = await getWebinarBySlug('grow-through-industry-2026');
      if (data) {
        setWebinar(data);
      }
    }

    loadWebinar();

    // Cross-tab synchronization: If admin updates date in another tab, update immediately
    const handleStorage = (e) => {
      if (e.key === 'webinar_target_date' && e.newValue) {
        setWebinar((prev) => ({ ...prev, date: e.newValue }));
      }
    };
    window.addEventListener('storage', handleStorage);

    // Realtime Supabase subscription for instant live updates
    const channel = supabase
      .channel('public-webinars-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'webinars' },
        (payload) => {
          if (payload.new && payload.new.date) {
            setWebinar((prev) => ({ ...prev, ...payload.new }));
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(animTimer);
      document.body.classList.remove('is-loaded');
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <BackgroundAtmosphere />
      <Header />
      <Hero webinar={webinar} />
      <Footer />
    </>
  );
}
