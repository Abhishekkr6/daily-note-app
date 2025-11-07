import { cookies } from 'next/headers';

export async function GET(req) {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Find NextAuth cookies
    const nextAuthCookies = allCookies.filter(cookie => 
      cookie.name.includes('next-auth') || 
      cookie.name.includes('__Secure-next-auth') ||
      cookie.name.includes('__Host-next-auth')
    );
    
    return Response.json({
      totalCookies: allCookies.length,
      nextAuthCookies: nextAuthCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0
      })),
      allCookieNames: allCookies.map(c => c.name),
      headers: {
        host: req.headers.get('host'),
        origin: req.headers.get('origin'),
        referer: req.headers.get('referer'),
      }
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
