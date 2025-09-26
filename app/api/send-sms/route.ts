import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    // For now, we'll just log the SMS instead of actually sending it
    // In production, you'd integrate with Twilio, AWS SNS, or another SMS service
    console.log(`📱 SMS to ${to}: ${message}`)
    
    // Simulate successful SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json({ 
      success: true, 
      message: 'SMS sent successfully (simulated)',
      to,
      content: message
    })
  } catch (error) {
    console.error('SMS API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}