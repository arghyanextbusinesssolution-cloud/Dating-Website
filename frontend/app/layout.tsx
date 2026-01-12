import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import NavbarWrapper from '@/components/NavbarWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Spiritual Unity Match - Find Alignment Before Attraction',
  description: 'Spiritual Unity Match - A conscious dating platform for spiritual connections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavbarWrapper />
        <div className="pt-4">
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

