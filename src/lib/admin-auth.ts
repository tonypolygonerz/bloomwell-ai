import jwt from 'jsonwebtoken'

export interface AdminUser {
  id: string
  username: string
  role: string
}

interface JwtPayload {
  adminId: string
  username: string
  role: string
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET not found')
      return null
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload
    return {
      id: decoded.adminId,
      username: decoded.username,
      role: decoded.role
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function getAdminFromRequest(request: Request): AdminUser | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  return verifyAdminToken(token)
}
