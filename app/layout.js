import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Namo Steel – The Steel Hub | Iron & Steel Merchants Since 1995',
  description: 'Trusted dealers in construction and industrial steel products for 30+ years. ISI-certified steel, wide product range, competitive pricing. Pune, Maharashtra.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ThemeProvider />
        {children}
      </body>
    </html>
  );
}
