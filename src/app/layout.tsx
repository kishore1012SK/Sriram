import type { Metadata } from 'next';
import { Geist, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const playfair = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sriram Salon — South 2nd Street, Pudukkottai',
  description:
    'Sriram Salon is Pudukkottai’s trusted grooming destination for men’s haircuts, beard trims, razor shaves, and children’s haircuts. South 2nd Street, Pudukkottai, Tamil Nadu.',
  keywords: [
    'Sriram Salon',
    'Salon in Pudukkottai',
    'Haircut Pudukkottai',
    'Men grooming Pudukkottai',
    'Beard trim Pudukkottai',
    'South 2nd street salon',
  ],
  authors: [{ name: 'Sriram Salon' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fbf9f5] text-[#122920] selection:bg-[#c87d55] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
