import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust the import based on your project structure

// Initialize participant counts
let participantCounts = global.participantCounts || {};
if (!global.participantCounts) {
  global.participantCounts = participantCounts;
}

// Add type declaration for globalThis.broadcastParticipantCounts
declare global {
  // eslint-disable-next-line no-var
  var broadcastParticipantCounts: (() => void) | undefined;
}

// Function to broadcast counts to WebSocket clients (server-side)
function broadcastParticipantCounts() {
  if (typeof globalThis.broadcastParticipantCounts === 'function') {
    globalThis.broadcastParticipantCounts();
    return;
  }
  const message = JSON.stringify({ type: 'counts', rooms: participantCounts });
  if (typeof window === 'undefined') {
    // Server-side: Send to WebSocket server
    const WebSocket = require('ws');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const client = new WebSocket(wsUrl);
    
    client.on('open', () => {
      client.send(message);
      client.close();
    });

    client.on('error', (error: unknown) => {
      console.error('WebSocket error:', error);
    });

    client.on('close', () => {
      console.log('WebSocket connection closed');
    });
  }
}

export async function GET() {
  return NextResponse.json({ rooms: participantCounts });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const { roomId, action, count } = payload || {};
  console.log('JOIN API called with:', { roomId, action });
  
  if (!roomId || !action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    // Allow a direct 'set' action where caller provides an authoritative count
    if (action === 'set' && typeof count !== 'undefined') {
      const safeProvided = Number.isFinite(Number(count)) && Number(count) >= 0 ? Math.floor(Number(count)) : 0;
      // Persist the provided count to DB
      const { data: updateData, error: updateError } = await supabase
        .from('rooms')
        .update({ participants: safeProvided })
        .eq('id', roomId)
        .select('participants');

      if (updateError) {
        console.error('Supabase update error (set):', updateError);
      } else if (updateData && updateData.length > 0) {
        participantCounts[roomId] = Number(updateData[0].participants) || safeProvided;
      } else {
        participantCounts[roomId] = safeProvided;
      }

      // Broadcast authoritative value
      broadcastParticipantCounts();
      return NextResponse.json({ success: true, participants: participantCounts[roomId] });
    }

    // Read the latest participants value from the DB to avoid relying solely on in-memory counters
    const { data: currentData, error: selectError } = await supabase
      .from('rooms')
      .select('participants')
      .eq('id', roomId)
      .single();

    if (selectError) {
      console.error('Supabase select error:', selectError);
    }

    const currentDbValue = currentData && typeof currentData.participants !== 'undefined' && currentData.participants !== null
      ? Number(currentData.participants)
      : 0;
    const safeCurrent = Number.isFinite(currentDbValue) && currentDbValue >= 0 ? Math.floor(currentDbValue) : 0;

    // Compute the new count based on the authoritative DB value
    let newCount = safeCurrent;
    if (action === 'join') {
      newCount = safeCurrent + 1;
      console.log(`Join request for ${roomId}: ${safeCurrent} -> ${newCount}`);
    } else if (action === 'leave') {
      newCount = Math.max(0, safeCurrent - 1);
      console.log(`Leave request for ${roomId}: ${safeCurrent} -> ${newCount}`);
    }

    // Persist the new count back to Supabase
    const { data: updateData, error: updateError } = await supabase
      .from('rooms')
      .update({ participants: newCount })
      .eq('id', roomId)
      .select('participants');

    if (updateError) {
      console.error('Supabase update error:', updateError);
    } else if (updateData && updateData.length > 0) {
      // Ensure we keep an in-memory reflection of the latest value
      participantCounts[roomId] = Number(updateData[0].participants) || newCount;
      console.log(`Updated DB and cache for ${roomId}:`, participantCounts[roomId]);
    } else {
      // Fallback to our computed value
      participantCounts[roomId] = newCount;
      console.log(`Updated cache for ${roomId} (no DB row returned):`, participantCounts[roomId]);
    }

    // Broadcast the update to all WebSocket clients with the authoritative counts
    broadcastParticipantCounts();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating participant count:', error);
    return NextResponse.json({ error: 'Failed to update participant count' }, { status: 500 });
  }
}
