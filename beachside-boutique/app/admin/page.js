import Admin from '../../components/Admin';

// Page cachée : aucun lien sur le site, non indexée par les moteurs de recherche.
export const metadata = { title: 'Gestion du site', robots: { index: false, follow: false } };

export default function AdminPage() {
  return <Admin />;
}
