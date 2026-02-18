import { create } from 'zustand';

const useAuthStore = create((set) => ({
    admin: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')) : null,

    login: (data) => {
        localStorage.setItem('adminInfo', JSON.stringify(data));
        set({ admin: data });
    },

    logout: () => {
        localStorage.removeItem('adminInfo');
        set({ admin: null });
    }
}));

export default useAuthStore;
