import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name?: string | null;
    username?: string | null;
    role: string;
    businessName?: string | null;
    phoneNumber?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    bio?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    address?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    isBlocked?: boolean;
    isVerified?: boolean;
    status?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      username?: string | null;
      role: string;
      businessName?: string | null;
      phoneNumber?: string | null;
      emailVerified?: Date | null;
      image?: string | null;
      bio?: string | null;
      country?: string | null;
      state?: string | null;
      city?: string | null;
      address?: string | null;
      website?: string | null;
      instagram?: string | null;
      facebook?: string | null;
      linkedin?: string | null;
      isBlocked?: boolean;
      isVerified?: boolean;
      status?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    username?: string | null;
    businessName?: string | null;
    phoneNumber?: string | null;
    emailVerified?: Date | null;
    bio?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    address?: string | null;
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
    isBlocked?: boolean;
    isVerified?: boolean;
    status?: string;
  }
}
