import { supabase } from '../lib/supabase';

export const DEFAULT_WEBINAR = {
  id: 'a0000000-0000-0000-0000-000000000001',
  title: 'GROW THROUGH INDUSTRY',
  slug: 'grow-through-industry-2026',
  eyebrow: 'NEXT-GEN FINANCE',
  badgeTitle: 'ECAFA',
  badgeDesc: 'Executive Certificate in AI Finance\nModeling & Forensic Accounting',
  description:
    'Where commerce education meets global industry expertise — building practical skills, industry exposure, and future-ready finance professionals.',
  date: 'September 23, 2026',
  time: '7:30 PM IST',
  mode: 'Live Online',
  access: 'Free Registration',
  registration_enabled: true
};

/**
 * Get initial webinar content with cached date if available to avoid initial flash.
 */
export function getInitialWebinar() {
  try {
    const cachedDate = localStorage.getItem('webinar_target_date');
    if (cachedDate) {
      return {
        ...DEFAULT_WEBINAR,
        date: cachedDate
      };
    }
  } catch {
    // localStorage unavailable
  }
  return DEFAULT_WEBINAR;
}

/**
 * Fetch webinar details by slug from Supabase.
 * Returns default fallback content if Supabase is offline or tables are not yet seeded.
 */
export async function getWebinarBySlug(slug = 'grow-through-industry-2026') {
  try {
    const { data, error } = await supabase
      .from('webinars')
      .select('*')
      .eq('slug', slug)
      .eq('registration_enabled', true)
      .maybeSingle();

    if (error) {
      console.warn('[webinarService] Supabase fetch error, using fallback:', error.message);
      return { data: getInitialWebinar(), error, isFallback: true };
    }

    if (!data) {
      return { data: getInitialWebinar(), error: new Error('Webinar not found'), isFallback: true };
    }

    // Save date in local cache for instant initial rendering on future reloads
    try {
      if (data.date) {
        localStorage.setItem('webinar_target_date', data.date);
      }
    } catch {
      // ignore
    }

    // Merge database record with UI defaults to ensure all required fields exist
    return {
      data: {
        ...DEFAULT_WEBINAR,
        ...data
      },
      error: null,
      isFallback: false
    };
  } catch (err) {
    console.error('[webinarService] Unexpected error:', err);
    return { data: getInitialWebinar(), error: err, isFallback: true };
  }
}

/**
 * Update webinar date in Supabase (Admin operation).
 */
export async function updateWebinarDate(webinarId, newDate) {
  try {
    const cleanDate = newDate.trim();
    const { data, error } = await supabase
      .from('webinars')
      .update({ date: cleanDate })
      .eq('id', webinarId)
      .select()
      .single();

    if (error) {
      console.error('[webinarService] Failed to update webinar date:', error);
      return { success: false, error: error.message };
    }

    try {
      localStorage.setItem('webinar_target_date', cleanDate);
    } catch {
      // ignore
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update date.' };
  }
}

