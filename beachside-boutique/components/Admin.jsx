'use client';
import { useCallback, useEffect, useState } from 'react';
import { browser } from '../lib/supabase';

const tag = (k) => (k === 'arrival' ? 'Arrivage' : 'Drop du jour');
const n5 = (n) => Math.max(1, Math.min(5, Math.round(+n) || 5));
// Réduit la photo avant l’envoi (1000 px max) pour garder le site rapide.
const shrink = (f) => new Promise((res) => {
  const i = new Image();
  i.onload = () => {
    const s = Math.min(1, 1000 / Math.max(i.width, i.height)), c = document.createElement('canvas');
    c.width = i.width * s; c.height = i.height * s;
    c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
    c.toBlob(res, 'image/jpeg', 0.82);
  };
  i.src = URL.createObjectURL(f);
});

export default function Admin() {
  const [ses, setSes] = useState(undefined); // undefined = chargement, null = déconnecté
  const [ok, setOk] = useState(null);        // null = vérification, true/false = droits
  const [tab, setTab] = useState('a');
  const [P, setP] = useState([]);
  const [V, setV] = useState([]);
  const [F, setF] = useState([]);
  const [edit, setEdit] = useState(null);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const s = browser();
    const [p, r, f] = await Promise.all([
      s.from('products').select('*').order('created_at', { ascending: false }),
      s.from('reviews').select('*').order('created_at', { ascending: false }),
      s.from('faq').select('*').order('position').order('created_at'),
    ]);
    setP(p.data ?? []); setV(r.data ?? []); setF(f.data ?? []);
  }, []);

  useEffect(() => {
    const s = browser();
    s.auth.getSession().then(({ data }) => setSes(data.session));
    const { data } = s.auth.onAuthStateChange((_e, x) => setSes(x));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ses) { setOk(null); return; }
    browser().from('admins').select('email').maybeSingle().then(({ data }) => { setOk(!!data); if (data) load(); });
  }, [ses, load]);

  // Exécute une requête Supabase, affiche le résultat, recharge les listes.
  const act = async (q, done) => {
    const { error } = await q;
    setMsg(error ? 'Erreur : ' + error.message : done);
    if (!error) await load();
    return !error;
  };
  const del = (table, id) => confirm('Supprimer définitivement ?') && act(browser().from(table).delete().eq('id', id), 'Supprimé.');

  const login = async (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const { error } = await browser().auth.signInWithPassword({ email: d.get('email'), password: d.get('password') });
    setMsg(error ? 'Connexion refusée : ' + error.message : '');
  };

  const addProduct = async (e) => {
    e.preventDefault();
    const f = e.currentTarget, d = new FormData(f), file = d.get('img'), s = browser();
    let url = null;
    if (file && file.size) {
      const path = `${Date.now()}.jpg`;
      const up = await s.storage.from('products').upload(path, await shrink(file), { contentType: 'image/jpeg' });
      if (up.error) return setMsg('Photo refusée : ' + up.error.message);
      url = s.storage.from('products').getPublicUrl(path).data.publicUrl;
    }
    const row = {
      name: d.get('name').trim(), price: d.get('price').trim() || 'Prix en boutique', kind: d.get('kind'),
      category: d.get('category'), sizes: d.get('sizes').trim(), description: d.get('description').trim(), image_url: url,
    };
    if (await act(s.from('products').insert(row), 'Article publié.')) f.reset();
  };

  const addReview = async (e) => {
    e.preventDefault();
    const f = e.currentTarget, d = new FormData(f);
    const row = { name: d.get('name').trim(), stars: n5(d.get('stars')), text: d.get('text').trim() };
    if (await act(browser().from('reviews').insert(row), 'Avis publié.')) f.reset();
  };

  const saveFaq = async (e) => {
    e.preventDefault();
    const f = e.currentTarget, d = new FormData(f), s = browser();
    const row = { question: d.get('question').trim(), answer: d.get('answer').trim() };
    const q = edit ? s.from('faq').update(row).eq('id', edit.id) : s.from('faq').insert({ ...row, position: (F.at(-1)?.position ?? 0) + 1 });
    if (await act(q, 'Question enregistrée.')) { setEdit(null); f.reset(); }
  };

  const Shell = ({ children }) => <div id="adm"><div className="ad">{children}</div></div>;

  if (ses === undefined) return <Shell><p className="mu">Chargement…</p></Shell>;

  if (!ses) return (
    <Shell>
      <h2>Gestion du site</h2>
      <section data-p="login">
        <form onSubmit={login}>
          <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
          <label>Mot de passe<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="pri">Se connecter</button>
          <p id="ts" role="status">{msg}</p>
        </form>
      </section>
    </Shell>
  );

  if (ok === null) return <Shell><p className="mu">Vérification de l’accès…</p></Shell>;

  if (!ok) return (
    <Shell>
      <h2>Accès réservé</h2>
      <p className="mu">Ce compte n’est pas administrateur du site.</p>
      <button className="tb" onClick={() => browser().auth.signOut()}>Se déconnecter</button>
    </Shell>
  );

  return (
    <Shell>
      <div className="adh">
        <h2>Gestion du site</h2>
        <span><a className="tb" href="/">Voir le site</a>{' '}<button className="tb" onClick={() => browser().auth.signOut()}>Se déconnecter</button></span>
      </div>
      <div className="tabs">
        {[['a', 'Articles'], ['r', 'Avis'], ['q', 'FAQ']].map(([k, l]) => (
          <button key={k} className="tb" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <p id="ts" role="status">{msg}</p>

      <section data-p="a" hidden={tab !== 'a'}>
        <form onSubmit={addProduct}>
          <label>Nom de l’article<input name="name" required maxLength={60} /></label>
          <label>Prix<input name="price" maxLength={24} placeholder="ex. 25 000" /></label>
          <div className="two">
            <label>Type<select name="kind"><option value="drop">Drop du jour</option><option value="arrival">Arrivage</option></select></label>
            <label>Public<select name="category"><option>Unisexe</option><option>Homme</option><option>Femme</option></select></label>
          </div>
          <label>Tailles<input name="sizes" maxLength={30} placeholder="S, M, L, XL" /></label>
          <label>Description<textarea name="description" rows={3} maxLength={300} /></label>
          <label>Photo<input type="file" name="img" accept="image/*" /></label>
          <button className="pri">Publier l’article</button>
        </form>
        <h3>Articles publiés</h3>
        <ul className="ml">
          {P.map((p) => (
            <li key={p.id}>
              <span className="who">{p.image_url && <img className="th" src={p.image_url} alt="" />}<span>{p.name} <small className="mu">{tag(p.kind)}{p.published ? '' : ', masqué'}</small></span></span>
              <span>
                <button onClick={() => act(browser().from('products').update({ published: !p.published }).eq('id', p.id), p.published ? 'Article masqué.' : 'Article affiché.')}>{p.published ? 'Masquer' : 'Afficher'}</button>{' '}
                <button onClick={() => del('products', p.id)}>Supprimer</button>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section data-p="r" hidden={tab !== 'r'}>
        <form onSubmit={addReview}>
          <label>Nom du client<input name="name" required maxLength={40} /></label>
          <label>Note sur 5<select name="stars" defaultValue="5">{[5, 4, 3, 2, 1].map((n) => <option key={n}>{n}</option>)}</select></label>
          <label>Avis du client<textarea name="text" required rows={3} maxLength={400} /></label>
          <button className="pri">Publier l’avis</button>
        </form>
        <h3>Avis publiés</h3>
        <ul className="ml">
          {V.map((r) => (
            <li key={r.id}><span>{r.name} <small className="mu">{n5(r.stars)}/5</small></span><button onClick={() => del('reviews', r.id)}>Supprimer</button></li>
          ))}
        </ul>
      </section>

      <section data-p="q" hidden={tab !== 'q'}>
        <form key={edit?.id || 'new'} onSubmit={saveFaq}>
          <label>Question<input name="question" required maxLength={120} defaultValue={edit?.question || ''} /></label>
          <label>Réponse<textarea name="answer" required rows={4} maxLength={600} defaultValue={edit?.answer || ''} /></label>
          <button className="pri">{edit ? 'Enregistrer les modifications' : 'Ajouter la question'}</button>{' '}
          {edit && <button type="button" className="tb" onClick={() => setEdit(null)}>Annuler</button>}
        </form>
        <h3>Questions de la FAQ</h3>
        <ul className="ml">
          {F.map((q) => (
            <li key={q.id}>
              <span>{q.question}</span>
              <span><button onClick={() => { setEdit(q); setMsg(''); }}>Modifier</button>{' '}<button onClick={() => del('faq', q.id)}>Supprimer</button></span>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
