import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HG Hari Parshad Das — Katha Sangraha | Curated Vaishnava Discourses',
  description:
    'Chronological, distraction-free lecture repository of HG Hari Parshad Das, featuring Sri Upadeshamrita, Caitanya Siksastakam, Srimad Bhagavatam, and Sadhana tracking.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🪷</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cinzel:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
