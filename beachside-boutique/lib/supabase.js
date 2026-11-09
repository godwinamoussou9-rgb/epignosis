import { createClient } from '@supabase/supabase-js';

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lecture publique côté serveur (pages du site).
export const server = () => createClient(url(), key(), { auth: { persistSession: false } });

// Client navigateur unique (espace de gestion).
let client;
export const browser = () => (client ??= createClient(url(), key()));
