"use client"

import type { Session } from "next-auth"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

interface SessionProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export default function SessionProvider({ children, session }: SessionProviderProps): React.ReactElement {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
}
