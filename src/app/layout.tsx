// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SessionWrapper from '@/components/SessionWrapper';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // ✅ Add Footer

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FanBetz',
  description: 'Bet Smarter, Win Bigger',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <SessionWrapper session={session}>
          <Header />
          <main className="px-4 py-8">{children}</main>
          <Footer /> {/* ✅ Insert footer at the bottom */}
        </SessionWrapper>
      </body>
    </html>
  );
}
