import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getExchangeById, updateExchange, deleteExchange } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exchange = await getExchangeById(params.id)

    if (!exchange || exchange.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ exchange })
  } catch (error) {
    console.error('Get exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exchange = await getExchangeById(params.id)

    if (!exchange || exchange.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { name, people, results, completed } = await request.json()

    const updated = await updateExchange(params.id, {
      name,
      people,
      results,
      completed,
    })

    return NextResponse.json({ exchange: updated })
  } catch (error) {
    console.error('Update exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteExchange(params.id, decoded.userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete exchange error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

