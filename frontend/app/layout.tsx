import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Space Hub - Nairobi Commercial Property Marketplace',
  description:
    'Find your perfect retail space in Nairobi. Connect with verified property owners, secure payments via M-Pesa, and discover business opportunities.',
  keywords: [
    'Nairobi',
    'commercial property',
    'retail space',
    'property rental',
    'M-Pesa',
    'Kenya real estate',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1A1A1A',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#2A9D8F',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E76F51',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-neutral-surface border-t border-neutral-border py-xl">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xl mb-xl">
          <div>
            <h3 className="text-h3 font-bold text-brand-primary mb-md">
              Space Hub
            </h3>
            <p className="text-small text-neutral-text-secondary">
              Nairobi's premier commercial property marketplace connecting
              property owners with entrepreneurs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-md">Quick Links</h4>
            <ul className="space-y-2 text-small text-neutral-text-secondary">
              <li>
                <a href="/listings" className="hover:text-brand-primary">
                  Browse Properties
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-brand-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-brand-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-md">Support</h4>
            <ul className="space-y-2 text-small text-neutral-text-secondary">
              <li>
                <a href="/help" className="hover:text-brand-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-brand-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-brand-primary">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-md">Contact Us</h4>
            <ul className="space-y-2 text-small text-neutral-text-secondary">
              <li>Email: hello@spacehub.ke</li>
              <li>Phone: +254 712 345 678</li>
              <li>Nairobi, Kenya</li>
            </ul>
          </div>
        </div>

        <div className="pt-xl border-t border-neutral-border text-center text-small text-neutral-text-secondary">
          <p>
            © {new Date().getFullYear()} Space Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
