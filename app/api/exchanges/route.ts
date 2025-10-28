import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getUserExchanges, createExchange as dbCreateExchange } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exchanges = await getUserExchanges(decoded.userId)
    
    return NextResponse.json({ exchanges })
  } catch (error) {
    console.error('Get exchanges error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, people, results, completed } = await request.json()

    const exchange = await dbCreateExchange({
      userId: decoded.userId,
      name: name || 'Gift Exchange',
      date: new Date(),
      people,
      results,
      completed: completed || false,
    })

    return NextResponse.json({ exchange })
  } catch (error) {
    console.error('Create exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

