import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

function getEnv(key: string): string {
  return process.env[key] || ''
}

// Only register providers that have credentials configured
const providers: NextAuthOptions['providers'] = []
if (getEnv('GITHUB_CLIENT_ID') && getEnv('GITHUB_CLIENT_SECRET')) {
  providers.push(GithubProvider({
    clientId: getEnv('GITHUB_CLIENT_ID'),
    clientSecret: getEnv('GITHUB_CLIENT_SECRET'),
  }))
}
if (getEnv('GOOGLE_CLIENT_ID') && getEnv('GOOGLE_CLIENT_SECRET')) {
  providers.push(GoogleProvider({
    clientId: getEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
  }))
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
  },
  // Fall back to a random stable secret when NEXTAUTH_SECRET is not set.
  // Sessions won't persist across cold starts without a real secret, but
  // the app won't crash and the /api/auth/session endpoint stays functional.
  secret: getEnv('NEXTAUTH_SECRET') || 'vaathi-dev-secret-set-NEXTAUTH_SECRET-in-production',
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
