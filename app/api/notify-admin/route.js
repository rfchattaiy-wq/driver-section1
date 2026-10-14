import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      bookingReference,
      riderName,
      riderPhone,
      pickup,
      dropoff,
      scheduledTime,
      serviceType,
      vehicleType,
    } = body;

    // അഡ്മിന്റെ WhatsApp നമ്പർ (രാജ്യ കോഡ് സഹിതം)
    const ADMIN_WHATSAPP = 'whatsapp:+916238775403';
    
    // Twilio WhatsApp Sender Number (+17372508034)
    const FROM_WHATSAPP = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+17372508034';

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.error('Twilio credentials missing');
      return NextResponse.json({ error: 'Twilio credentials not configured' }, { status: 500 });
    }

    const messageBody = 
      `🚗 *NEW EASY DRIVE BOOKING REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎫 *Ref:* #${bookingReference}\n` +
      `👤 *Customer:* ${riderName}\n` +
      `📞 *Phone:* ${riderPhone}\n` +
      `📍 *Pickup:* ${pickup}\n` +
      `🏁 *Dropoff:* ${dropoff}\n` +
      `🕒 *Time:* ${scheduledTime}\n` +
      `🚘 *Vehicle:* ${vehicleType}\n` +
      `📋 *Service:* ${serviceType}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `_Forward this route to the verified driver pool to assign._`;

    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('From', FROM_WHATSAPP);
    formData.append('To', ADMIN_WHATSAPP);
    formData.append('Body', messageBody);

    const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const twilioResponse = await fetch(twilioEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: formData.toString(),
    });

    const responseData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio WhatsApp Error:', responseData);
      return NextResponse.json({ error: responseData.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, messageId: responseData.sid });
  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
