import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
// import { PrismaClient } from '@prisma/client'

// const prisma = new PrismaClient()

// Mock user storage for testing
const mockUsers: Array<{id: string, name: string, email: string, password: string}> = []

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (mock)
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    }
    
    mockUsers.push(user)

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
