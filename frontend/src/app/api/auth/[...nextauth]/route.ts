import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

/**
 * NextAuth.js v5 (Auth.js) route handler.
 *
 * Flow:
 *  1. User clicks "Sign in with Google" → NextAuth redirects to Google
 *  2. Google authenticates and redirects back here with profile info
 *  3. The `signIn` callback calls our Spring Boot backend (/api/auth/google-callback)
 *     which finds-or-creates the user in PostgreSQL and returns our JWT
 *  4. We store the JWT in the NextAuth session token so the frontend can use it
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const { handlers } = NextAuth({
  providers: [
    GoogleProvider({
      // ────────────────────────────────────────────────
      // 🔑 GOOGLE CREDENTIALS — set in .env.local:
      //    GOOGLE_CLIENT_ID=your_id_here
      //    GOOGLE_CLIENT_SECRET=your_secret_here
      // ────────────────────────────────────────────────
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Use JWT-based sessions (no DB for NextAuth sessions)
  session: {
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Called after a successful sign-in.
     * We call our Spring Boot backend to get our own JWT and store it.
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Only on first sign-in — exchange Google profile for our backend JWT
        try {
          const response = await axios.post(`${apiUrl}/auth/google-callback`, {
            googleId: profile.sub,
            email: profile.email,
            name: profile.name,
            picture: (profile as any).picture,
            idToken: account.id_token,
          });

          const { token: backendJwt, id, name, email, role } = response.data;

          // Store our backend JWT and user info in the NextAuth token
          token.backendJwt = backendJwt;
          token.userId = id;
          token.userName = name;
          token.userEmail = email;
          token.userRole = role;
        } catch (error) {
          console.error('[NextAuth] Backend google-callback failed:', error);
          token.error = 'BackendAuthFailed';
        }
      }
      return token;
    },

    /**
     * Expose our backend JWT and user info in the session
     * so the frontend can access them via useSession().
     */
    async session({ session, token }) {
      (session as any).backendJwt = token.backendJwt;
      (session as any).userId = token.userId;
      (session as any).userRole = token.userRole;
      if (session.user) {
        session.user.name = token.userName as string;
        session.user.email = token.userEmail as string;
      }
      return session;
    },
  },

  pages: {
    // Use our own modal for sign-in, not NextAuth's built-in page
    signIn: '/',
  },
});

export const { GET, POST } = handlers;
