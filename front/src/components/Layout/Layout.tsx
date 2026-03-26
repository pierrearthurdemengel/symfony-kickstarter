import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Wrapper principal avec Header, contenu et Footer
 * Utilise flex column min-h-screen pour coller le footer en bas
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-secondary-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
