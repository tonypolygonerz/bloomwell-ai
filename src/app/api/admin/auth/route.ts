import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Admin credentials from environment variables for security
// Note: Using direct hash due to environment variable loading issue with $ characters
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: '$2b$10$EFBYmuVedoaaVHQA2dWgX.thEF3hS/L7n4EI8HLuKYINiKS8c15I6', // admin123
  role: process.env.ADMIN_ROLE || 'super_admin'
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }


    // Find admin user in database
    const adminUser = await prisma.adminUser.findUnique({
      where: { username }
    })

    if (!adminUser) {
      console.log('Admin user not found:', username)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminUser.password)
    if (!isValidPassword) {
      console.log('Invalid password for user:', username)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create JWT token
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET not found')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const token = jwt.sign(
      { 
        adminId: adminUser.id, 
        username: adminUser.username, 
        role: adminUser.role 
      },
      secret,
      { expiresIn: '24h' }
    )

    // Return admin info (without password)
    return NextResponse.json({
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      },
      token
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 })
  }
}
