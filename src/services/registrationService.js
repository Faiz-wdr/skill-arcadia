import { supabase } from '../lib/supabase';

/**
 * Register an attendee for a specific webinar in Supabase.
 * Enforces email normalization and handles duplicate registrations cleanly.
 */
export async function createRegistration({
  webinarId,
  fullName,
  whatsapp,
  email,
  course,
  status
}) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  const trimmedName = (fullName || '').trim();
  const trimmedWhatsapp = (whatsapp || '').trim();

  if (!webinarId || !trimmedName || !normalizedEmail || !trimmedWhatsapp || !course || !status) {
    return {
      success: false,
      errorType: 'validation',
      message: 'All fields are required.'
    };
  }

  try {
    const { data, error } = await supabase.from('registrations').insert([
      {
        webinar_id: webinarId,
        name: trimmedName,
        whatsapp: trimmedWhatsapp,
        email: normalizedEmail,
        course,
        status
      }
    ]);

    if (error) {
      // Check for PostgreSQL unique constraint violation (code 23505)
      const isDuplicate =
        error.code === '23505' ||
        (error.message &&
          (error.message.toLowerCase().includes('duplicate') ||
            error.message.toLowerCase().includes('unique') ||
            error.message.includes('registrations_webinar_email_idx')));

      if (isDuplicate) {
        return {
          success: false,
          errorType: 'duplicate',
          message: 'You are already registered for this webinar.'
        };
      }

      console.error('[registrationService] Supabase insert error:', error);
      return {
        success: false,
        errorType: 'general',
        message: 'Unable to complete registration. Please try again.'
      };
    }

    return {
      success: true,
      data
    };
  } catch (err) {
    console.error('[registrationService] Unexpected registration error:', err);
    return {
      success: false,
      errorType: 'network',
      message: 'Network error. Please check your internet connection and try again.'
    };
  }
}

/**
 * Fetch all registrations for a webinar (Admin operation).
 */
export async function getRegistrations(webinarId) {
  try {
    let query = supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (webinarId) {
      query = query.eq('webinar_id', webinarId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[registrationService] Failed to fetch registrations:', error);
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Fetch the latest N registrations for a webinar.
 */
export async function getRecentRegistrations(webinarId, limit = 5) {
  try {
    let query = supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (webinarId) {
      query = query.eq('webinar_id', webinarId);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Fetch total count of registrations.
 */
export async function getRegistrationCount(webinarId) {
  try {
    let query = supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    if (webinarId) {
      query = query.eq('webinar_id', webinarId);
    }

    const { count, error } = await query;
    if (error) {
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (err) {
    return { success: false, count: 0, error: err.message };
  }
}

