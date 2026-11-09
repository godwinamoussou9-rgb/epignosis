import Site from '../components/Site';
import { server } from '../lib/supabase';

export const dynamic = 'force-dynamic'; // toujours à jour : un article publié apparaît tout de suite

export default async function Home() {
  const db = server();
  const [p, r, f] = await Promise.all([
    db.from('products').select('*').eq('published', true).order('created_at', { ascending: false }),
    db.from('reviews').select('*').order('created_at', { ascending: false }),
    db.from('faq').select('*').order('position').order('created_at'),
  ]);
  return <Site products={p.data ?? []} reviews={r.data ?? []} faq={f.data ?? []} />;
}
