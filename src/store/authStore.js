import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isLoading: false,

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
      set({ accessToken: token });
    } else {
      localStorage.removeItem('accessToken');
      set({ accessToken: null, user: null });
    }
  },

  setUser: (user) => set({ user }),

  login: async (token) => {
    get().setAccessToken(token);
    await get().fetchUserProfile();
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ accessToken: null, user: null });
  },

  fetchUserProfile: async () => {
    if (!get().accessToken) return;
    set({ isLoading: true });
    try {
      // Dynamic import to break circular dependency
      const { axiosInstance } = await import('../api/axiosInstance');
      const response = await axiosInstance.get('/users/profile');
      
      // Parse JWT token to extract roles claim
      let role = 'GUEST';
      try {
        const token = get().accessToken;
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.roles) {
            const cleanRoles = payload.roles.replace('[', '').replace(']', '').trim();
            if (cleanRoles.includes('HOTEL_MANAGER')) {
              role = 'HOTEL_MANAGER';
            } else {
              role = 'GUEST';
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse roles claim from access token:', err);
      }

      set({ user: { ...response.data, role }, isLoading: false });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      get().logout();
      set({ isLoading: false });
    }
  }
}));
