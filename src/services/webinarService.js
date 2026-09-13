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
 * Get initial webinar content with cached date and time if available to avoid initial flash.
 */
export function getInitialWebinar() {
  try {
    const cachedDate = localStorage.getItem('webinar_target_date');
    const cachedTime = localStorage.getItem('webinar_target_time');
    if (cachedDate || cachedTime) {
      return {
        ...DEFAULT_WEBINAR,
        ...(cachedDate ? { date: cachedDate } : {}),
        ...(cachedTime ? { time: cachedTime } : {})
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

    // Save date and time in local cache for instant initial rendering on future reloads
    try {
      if (data.date) {
        localStorage.setItem('webinar_target_date', data.date);
      }
      if (data.time) {
        localStorage.setItem('webinar_target_time', data.time);
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
 * Update webinar date & time in Supabase (Admin operation).
 */
export async function updateWebinarSchedule(webinarId, newDate, newTime) {
  try {
    const cleanDate = typeof newDate === 'string' ? newDate.trim() : '';
    const cleanTime = typeof newTime === 'string' ? newTime.trim() : '';
    
    const updatePayload = {};
    if (cleanDate) updatePayload.date = cleanDate;
    if (cleanTime) updatePayload.time = cleanTime;

    if (Object.keys(updatePayload).length === 0) {
      return { success: false, error: 'No schedule fields specified to update.' };
    }

    const { data, error } = await supabase
      .from('webinars')
      .update(updatePayload)
      .eq('id', webinarId)
      .select()
      .single();

    if (error) {
      console.error('[webinarService] Failed to update webinar schedule:', error);
      return { success: false, error: error.message };
    }

    try {
      if (cleanDate) localStorage.setItem('webinar_target_date', cleanDate);
      if (cleanTime) localStorage.setItem('webinar_target_time', cleanTime);
    } catch {
      // ignore
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update schedule.' };
  }
}

/**
 * Backwards compatible alias for updateWebinarSchedule
 */
export async function updateWebinarDate(webinarId, newDate, newTime) {
  return updateWebinarSchedule(webinarId, newDate, newTime);
}

