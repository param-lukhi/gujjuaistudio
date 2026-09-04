import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error('No user found with this email address.');
        }

        if (user.isBlocked) {
          throw new Error('Your account has been suspended. Please contact admin support.');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password. Please try again.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          businessName: user.businessName,
          phoneNumber: user.phoneNumber,
          emailVerified: user.emailVerified,
          image: user.image,
          bio: user.bio,
          country: user.country,
          state: user.state,
          city: user.city,
          address: user.address,
          website: user.website,
          instagram: user.instagram,
          facebook: user.facebook,
          linkedin: user.linkedin,
          isBlocked: user.isBlocked,
          isVerified: user.isVerified,
          status: user.status,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase().trim() },
          });
          if (dbUser && dbUser.isBlocked) {
            return false;
          }
        } catch (e) {
          console.error('Error verifying Google user sign in:', e);
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'CLIENT';
        token.username = (user as any).username;
        token.businessName = (user as any).businessName;
        token.phoneNumber = (user as any).phoneNumber;
        token.emailVerified = (user as any).emailVerified;
        token.bio = (user as any).bio;
        token.country = (user as any).country;
        token.state = (user as any).state;
        token.city = (user as any).city;
        token.address = (user as any).address;
        token.website = (user as any).website;
        token.instagram = (user as any).instagram;
        token.facebook = (user as any).facebook;
        token.linkedin = (user as any).linkedin;
        token.isBlocked = (user as any).isBlocked;
        token.isVerified = (user as any).isVerified;
        token.status = (user as any).status;
      }

      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase().trim() },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role || 'CLIENT';
            token.isBlocked = dbUser.isBlocked;
            token.isVerified = dbUser.isVerified;
            if (!dbUser.isVerified) {
              await prisma.user.update({
                where: { id: dbUser.id },
                data: { isVerified: true, emailVerified: new Date() },
              });
            }
          }
        } catch (err) {
          console.error('Google OAuth jwt callback error:', err);
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch latest profile state from DB to reflect profile edits or block state in real-time
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              role: true,
              businessName: true,
              phoneNumber: true,
              emailVerified: true,
              image: true,
              bio: true,
              country: true,
              state: true,
              city: true,
              address: true,
              website: true,
              instagram: true,
              facebook: true,
              linkedin: true,
              isBlocked: true,
              isVerified: true,
              status: true,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.email = dbUser.email;
            session.user.name = dbUser.name;
            session.user.username = dbUser.username;
            session.user.role = dbUser.role;
            session.user.businessName = dbUser.businessName;
            session.user.phoneNumber = dbUser.phoneNumber;
            session.user.emailVerified = dbUser.emailVerified;
            session.user.image = dbUser.image;
            session.user.bio = dbUser.bio;
            session.user.country = dbUser.country;
            session.user.state = dbUser.state;
            session.user.city = dbUser.city;
            session.user.address = dbUser.address;
            session.user.website = dbUser.website;
            session.user.instagram = dbUser.instagram;
            session.user.facebook = dbUser.facebook;
            session.user.linkedin = dbUser.linkedin;
            session.user.isBlocked = dbUser.isBlocked;
            session.user.isVerified = dbUser.isVerified;
            session.user.status = dbUser.status;
          }
        } catch (e) {
          console.error('Session callback DB lookup error:', e);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'gujju-ai-studio-secret-key-2026',
};
