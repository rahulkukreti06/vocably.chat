import { supabase } from './supabaseClient';

export async function createNotification(notification: {
  user_id: string;
  actor_id?: string | null;
  type: string;
  post_id?: string | null;
  comment_id?: string | null;
  data?: Record<string, any>;
}) {
  try {
    const { error } = await supabase.from('community_notifications').insert([{
      user_id: notification.user_id,
      actor_id: notification.actor_id || null,
      type: notification.type,
      post_id: notification.post_id || null,
      comment_id: notification.comment_id || null,
      data: notification.data || {},
    }]);
    if (error) {
      console.warn('createNotification error', error.message);
    }
  } catch (e) {
    console.warn('createNotification exception', e);
  }
}

export async function markNotificationsRead(ids: string[]) {
  if (!ids || ids.length === 0) return;
  try {
    const { error } = await supabase.from('community_notifications').update({ read: true }).in('id', ids);
    if (error) console.warn('markNotificationsRead error', error.message);
  } catch (e) {
    console.warn('markNotificationsRead exception', e);
  }
}

export default { createNotification, markNotificationsRead };
