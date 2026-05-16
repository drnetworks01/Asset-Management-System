import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kurikara Assets',
  description: 'Office inventory for the Kurikaralanka campus.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
