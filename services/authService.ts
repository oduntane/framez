import { supabase } from '../lib/supabase';

export const authService = {
  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  },

  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      user: data.user,
      session: data.session
    };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      return null;
    }

    const { data: userData } = await supabase.auth.getUser();

    return userData.user;
  }
};
