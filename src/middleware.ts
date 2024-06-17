



import { NextRequest } from 'next/server'

const KEY = process.env.API_PASSWORD;
 
// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: '/api/:function*',
}
 
export function middleware(request: NextRequest) {
  // Call our authentication function to check the request
  if (!isAuthenticated(request)) {
    // Respond with JSON indicating an error message
    return Response.json(
      { success: false, message: 'authentication failed' },
      { status: 401 }
    )
  }
}

function isAuthenticated(request: NextRequest) {
  // Get the `Authorization` header from the request
  const authHeader = request.headers.get('Authorization')
 
  // If the header is missing, return false
  if (!authHeader) {
    return false
  }
 
  // Check if the header contains the correct API key
  return authHeader === `Bearer ${KEY}`
}