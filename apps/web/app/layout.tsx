import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';
import AppRoot from './app-root';

export const metadata: Metadata = {
  title: 'Hen N Slice — Crispy Chicken',
  description: 'Order crispy chicken for delivery or pickup from Hen N Slice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-surface-background text-text-primary antialiased">
          <AppRoot>{children}</AppRoot>
        </body>
      </html>
    </ClerkProvider>
  );
}
