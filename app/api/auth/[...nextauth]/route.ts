import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Mock user data for testing
const mockUsers = [
  {
    id: '1',
    email: 'test@bloomwellai.com',
    password: '$2a$12$lW8zeoAFxxCORmRPsI.AZuAx6pZWgp4uQFeugvDQSejT531MXYsqu', // testpassword123
    name: 'Test User',
  }
]

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock authentication for testing
        const user = mockUsers.find(u => u.email === credentials.email)
        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account, _profile }) {
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        // Mock OAuth sign-in for testing
        console.log('OAuth sign-in:', { provider: account.provider, email: user.email })
        return true
      }
      return true
    },
    async jwt({ token, user, _account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
