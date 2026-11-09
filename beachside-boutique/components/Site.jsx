'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { wa, INSTAGRAM, MAPS } from '../lib/config';

const Hero3D = dynamic(() => import('./Hero3D'), { ssr: false });

const tag = (k) => (k === 'arrival' ? 'Arrivage' : 'Drop du jour');
const when = (d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const n5 = (n) => Math.max(1, Math.min(5, Math.round(+n) || 5));

export default function Site({ products, reviews, faq }) {
  const [flt, setFlt] = useState('all');
  const [sel, setSel] = useState(null);
  const [fab, setFab] = useState(false);
  const dlg = useRef(null);

  useEffect(() => {
    const d = dlg.current;
    if (sel && !d.open) d.showModal();
    if (!sel && d.open) d.close();
  }, [sel]);

  // Le bouton WhatsApp flottant apparaît dès qu’on quitte le haut de page
  useEffect(() => {
    const io = new IntersectionObserver((e) => setFab(!e[0].isIntersecting));
    io.observe(document.getElementById('top'));
    return () => io.disconnect();
  }, []);

  const tilt = (e) => {
    if (e.pointerType === 'touch') return;
    const c = e.currentTarget, r = c.getBoundingClientRect();
    c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 14 + 'deg');
    c.style.setProperty('--rx', (0.5 - (e.clientY - r.top) / r.height) * 14 + 'deg');
  };
  const flat = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

  const list = products.filter((p) => flt === 'all' || p.kind === flt);
  const avg = reviews.length ? (reviews.reduce((s, r) => s + n5(r.stars), 0) / reviews.length).toFixed(1).replace('.', ',') : null;
  const hello = wa('Bonjour BEACHSIDE BOUTIQUE, je souhaite des informations.');
  const ext = { target: '_blank', rel: 'noopener noreferrer' };

  return (
    <>
      <header>
        <a className="logo" href="#top" aria-label="BEACHSIDE BOUTIQUE, accueil">
          <img src="/logo.jpg" alt="" width="42" height="42" />
          <span>BEACHSIDE BOUTIQUE</span>
        </a>
        <nav>
          <a href="#catalogue">Catalogue</a>
          <a href="#avis">Avis</a>
          {faq.length > 0 && <a href="#faq">FAQ</a>}
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <Hero3D products={products} onPick={setSel} />
        <div className="ht">
          <h1>Chaque jour, de nouvelles pièces sur le portant.</h1>
          <p>Glissez le portant, touchez une pièce pour la découvrir.</p>
          <a className="btn" href="#catalogue">Voir le catalogue</a>{' '}
          <a className="btn wa" href={hello} {...ext}>Écrire sur WhatsApp</a>
        </div>
      </section>

      <main id="catalogue">
        <div className="bar">
          <h2>Le catalogue</h2>
          <div className="chips" role="group" aria-label="Filtrer le catalogue">
            {[['all', 'Tout'], ['drop', 'Drops du jour'], ['arrival', 'Arrivages']].map(([k, l]) => (
              <button key={k} className="chip" aria-pressed={flt === k} onClick={() => setFlt(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div id="grid" className="grid">
          {list.length ? list.map((p) => (
            <button key={p.id} className="card" onClick={() => setSel(p)} onPointerMove={tilt} onPointerLeave={flat}>
              <span className="ph">{p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" />}</span>
              <span className="tg">{tag(p.kind)}, {when(p.created_at)}</span>
              <b>{p.name}</b>
              <span className="pr">{p.price}</span>
            </button>
          )) : <p className="mu">Aucune pièce ici pour le moment.</p>}
        </div>
      </main>

      <section className="sec" id="avis">
        <h2>Avis clients</h2>
        <div id="rv">
          {reviews.length ? (
            <>
              <p className="mu">Note moyenne : {avg} sur 5, d’après {reviews.length} avis.</p>
              <div className="rvg">
                {reviews.map((r) => (
                  <figure className="rv" key={r.id}>
                    <div className="stars" role="img" aria-label={`${n5(r.stars)} sur 5`}>{'★'.repeat(n5(r.stars)) + '☆'.repeat(5 - n5(r.stars))}</div>
                    <blockquote>{r.text}</blockquote>
                    <figcaption>{r.name}</figcaption>
                  </figure>
                ))}
              </div>
            </>
          ) : (
            <p className="mu">Les premiers avis arrivent bientôt. Vous avez acheté chez nous ?{' '}
              <a href={wa('Bonjour, je souhaite laisser un avis sur ma commande.')} {...ext}>Racontez-nous votre expérience sur WhatsApp</a>.</p>
          )}
        </div>
      </section>

      {faq.length > 0 && (
        <section className="sec" id="faq">
          <h2>Questions fréquentes</h2>
          <div id="fq">
            {faq.map((f) => (<details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>))}
          </div>
        </section>
      )}

      <section className="sec" id="contact">
        <h2>Nous trouver</h2>
        <div className="ct">
          <p>Passez nous voir en boutique, ou écrivez-nous sur WhatsApp.</p>
          <div className="ctb">
            <a className="btn" href={MAPS} {...ext}>Voir l’adresse sur Google Maps</a>
            <a className="btn wa" href={hello} {...ext}>Écrire sur WhatsApp</a>
          </div>
          <ul className="soc"><li><a href={INSTAGRAM} {...ext}>Instagram : beach_sideluxury</a></li></ul>
        </div>
      </section>

      <footer>
        <div className="fl">
          <img src="/logo.jpg" alt="" width="44" height="44" />
          <div><b>BEACHSIDE BOUTIQUE</b><p>Mode unisexe. De nouvelles pièces chaque jour.</p></div>
        </div>
      </footer>

      {fab && <a className="btn wa fab" href={hello} {...ext}>Écrire sur WhatsApp</a>}

      <dialog ref={dlg} id="dt" onClose={() => setSel(null)} onClick={(e) => e.target === dlg.current && setSel(null)}>
        <form method="dialog" className="x"><button>Fermer</button></form>
        {sel && (
          <div className="dg">
            {sel.image_url && <img src={sel.image_url} alt={sel.name} />}
            <div>
              <span className="tg">{tag(sel.kind)}, {when(sel.created_at)}</span>
              <h2>{sel.name}</h2>
              {sel.description && <p>{sel.description}</p>}
              <p className="mu">{sel.category}{sel.sizes ? '. Tailles : ' + sel.sizes : ''}</p>
              <p className="pr">{sel.price}</p>
              <a className="btn wa" href={wa('Bonjour, je suis intéressé(e) par : ' + sel.name)} {...ext}>Demander cette pièce sur WhatsApp</a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
