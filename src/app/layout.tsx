/* eslint-disable import/order */
import type { Metadata } from 'next'
import './globals.css'

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'Bloomwell AI',
  description: 'Nonprofit AI Assistant',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<React.ReactElement> {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}