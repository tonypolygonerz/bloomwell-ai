import { AuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
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
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email: user.email!,
                name: user.name || '',
                updatedAt: new Date(),
                Organization: {
                  create: {
                    id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'New Organization',
                    organizationType: 'nonprofit',
                    updatedAt: new Date(),
                  },
                },
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('Error in Google sign-in:', error);
          return false;
        }
      }

      if (account?.provider === 'azure-ad') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                email: user.email!,
                name: user.name || '',
                updatedAt: new Date(),
                Organization: {
                  create: {
                    id: `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: 'New Organization',
                    organizationType: 'nonprofit',
                    updatedAt: new Date(),
                  },
                },
              },
            });
            user.id = newUser.id;
          } else {
            user.id = existingUser.id;
          }
        } catch (error) {
          console.error('Error in Azure AD sign-in:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.organizationId = token.organizationId as string | null | undefined;
      }

      return session;
    },
  },
};


