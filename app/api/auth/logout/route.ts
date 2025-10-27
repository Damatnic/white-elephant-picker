import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('token')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

