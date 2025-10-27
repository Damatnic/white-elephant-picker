import { NextRequest, NextResponse } from 'next/server'
import { createUser, createSession } from '@/lib/db'
import { hashPassword, generateDemoToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Generate unique demo email
    const demoId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const demoEmail = `${demoId}@demo.astralswap.com`
    const demoName = 'Demo User'

    // Create demo user
    const passwordHash = await hashPassword('demo_password_' + Math.random().toString(36))
    const user = await createUser({
      email: demoEmail,
      passwordHash,
      name: demoName,
      isDemo: true,
    })

    // Create session with shorter expiration for demo
    const token = generateDemoToken(user.id)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    await createSession({
      userId: user.id,
      token,
      expiresAt,
    })

    // Set HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isDemo: user.isDemo,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

