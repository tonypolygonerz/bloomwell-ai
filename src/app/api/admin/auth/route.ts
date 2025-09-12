import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
const jwt = require('jsonwebtoken')

// For now, let's use a simple hardcoded admin for testing
// In production, this should come from the database
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: '$2b$10$pq/qYG95sWKjmz70Ge2pf.XTh37c/O7QGRkPZSje5wIWeHlf2CyGa', // admin123
  id: 'cmfez9ezh0000402ck1i6gs56',
  role: 'super_admin'
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    console.log('Admin auth attempt for username:', username)

    // Check credentials
    if (username !== ADMIN_CREDENTIALS.username) {
      console.log('Admin user not found:', username)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Admin user found:', username)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.password)
    if (!isValidPassword) {
      console.log('Invalid password for user:', username)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Password verified for user:', username)

    // Create JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET not found')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const token = jwt.sign(
      { 
        adminId: ADMIN_CREDENTIALS.id, 
        username: ADMIN_CREDENTIALS.username, 
        role: ADMIN_CREDENTIALS.role 
      },
      secret,
      { expiresIn: '24h' }
    )

    console.log('JWT token created for user:', username)

    // Return admin info (without password)
    return NextResponse.json({
      admin: {
        id: ADMIN_CREDENTIALS.id,
        username: ADMIN_CREDENTIALS.username,
        role: ADMIN_CREDENTIALS.role
      },
      token
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}
