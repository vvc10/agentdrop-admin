import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agentify Admin Panel',
  description: 'Admin panel for Agentify platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProviderWrapper>
          {children}
          <Toaster />
        </ClerkProviderWrapper>
      </body>
    </html>
  )
} 