import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: 'Kurikara Assets',
  description: 'Office inventory for the Kurikaralanka campus.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('kurikara-ui');
                  var theme = 'dark';
                  if (raw) {
                    var state = JSON.parse(raw).state;
                    if (state && state.theme) theme = state.theme;
                  }
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
