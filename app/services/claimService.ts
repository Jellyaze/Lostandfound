import { supabase } from '../config/supabase';

export interface Claim {
  id: string;
  post_id: string;
  claimer_id: string;
  poster_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  verification_notes: string;
  created_at: string;
  updated_at: string;
}

export const createClaim = async (
  postId: string,
  claimerId: string,
  posterId: string
): Promise<{ data: Claim | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_claims')
      .insert([
        {
          post_id: postId,
          claimer_id: claimerId,
          poster_id: posterId,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateClaimStatus = async (
  claimId: string,
  status: 'approved' | 'rejected' | 'verified',
  verificationNotes?: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('app_3f92f_claims')
      .update({
        status,
        verification_notes: verificationNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claimId);

    return { error };
  } catch (error) {
    return { error };
  }
};

export const getClaimsByPost = async (postId: string): Promise<{ data: Claim[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_claims')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
};

export const getUserClaims = async (userId: string): Promise<{ data: Claim[]; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('app_3f92f_claims')
      .select('*')
      .eq('claimer_id', userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  } catch (error) {
    return { data: [], error };
  }
};