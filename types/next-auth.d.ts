import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      organizationId?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    organizationId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name?: string;
    image?: string;
    organizationId?: string | null;
  }
}
