import './globals.css';
import { Bricolage_Grotesque, Newsreader } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--fd', display: 'swap' });
const serif = Newsreader({ subsets: ['latin'], style: ['normal', 'italic'], variable: '--fs', display: 'swap' });

export const metadata = {
  title: 'BEACHSIDE BOUTIQUE',
  description: 'Mode unisexe. De nouvelles pièces chaque jour.',
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${display.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
