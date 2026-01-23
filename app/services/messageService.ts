import { supabase } from '../config/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  post_id: string;
  user1_id: string;
  user2_id: string;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

export const createConversation = async (
  postId: string,
  user1Id: string,
  user2Id: string
): Promise<{ data: Conversation | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_conversations')
      .upsert([
        {
          post_id: postId,
          user1_id: user1Id,
          user2_id: user2Id,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getConversations = async (userId: string): Promise<{ data: Conversation[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_conversations')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ data: Message | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          content,
        },
      ])
      .select()
      .single();

    if (!error) {
      await supabase
        .from('app_3f92f_conversations')
        .update({
          last_message: content,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
    }

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const getMessages = async (conversationId: string): Promise<{ data: Message[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
};

export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('app_3f92f_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'app_3f92f_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
};