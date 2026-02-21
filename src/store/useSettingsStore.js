import { create } from 'zustand';
import { supabase } from '../supabaseClient';

// Default values if Supabase has no data yet
const DEFAULTS = {
    contact: { whatsapp: '543434559599', email: 'olmoshowroom@gmail.com', address: 'Cervantes 35 local A', instagram: 'olmo.ind' },
    hero: { title: 'OLMO', subtitle: 'INDUMENTARIA', cta: 'Ver Colección', bgColor: '' },
    banners: [],
    categories: ['Remeras', 'Pantalones', 'Sudaderas', 'Accesorios'],
};

export const useSettingsStore = create((set, get) => ({
    settings: { ...DEFAULTS },
    loading: false,

    // ── Fetch all settings from Supabase ──────────────────────────────────────
    fetchSettings: async () => {
        set({ loading: true });
        try {
            const { data, error } = await supabase.from('settings').select('*');
            if (error) throw error;

            const merged = { ...DEFAULTS };
            if (data) {
                data.forEach(row => {
                    merged[row.key] = row.value;
                });
            }
            set({ settings: merged, loading: false });
        } catch (err) {
            console.warn('Settings table not found, using defaults:', err.message);
            set({ loading: false });
        }
    },

    // ── Update a single setting key ───────────────────────────────────────────
    updateSetting: async (key, value) => {
        // Optimistic local update
        set(state => ({
            settings: { ...state.settings, [key]: value }
        }));

        try {
            const { error } = await supabase
                .from('settings')
                .upsert({ key, value }, { onConflict: 'key' });

            if (error) throw error;
        } catch (err) {
            console.error('Error saving setting:', err.message);
        }
    },

    // ── Subscribe to realtime changes ─────────────────────────────────────────
    subscribeToSettings: () => {
        const channel = supabase
            .channel('settings-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
                const { new: row } = payload;
                if (row && row.key) {
                    set(state => ({
                        settings: { ...state.settings, [row.key]: row.value }
                    }));
                }
            })
            .subscribe();

        // Return unsubscribe function
        return () => supabase.removeChannel(channel);
    },

    // ── Upload image to Supabase Storage ──────────────────────────────────────
    uploadImage: async (file) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });

        if (error) throw error;

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },
}));
