const API = 'http://localhost:5000/api';
async function test() {
    const evRes = await fetch(`${API}/events`);
    const events = await evRes.json();
    console.log('✅ Events loaded:', events.length, '— first event id:', events[0]?.id);

    const patchRes = await fetch(`${API}/events/e1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotsFilled: 13 })
    });
    const patchBody = await patchRes.json();
    console.log('✅ PATCH event e1:', patchRes.status, '— spotsFilled now:', patchBody.spotsFilled);

    const tickRes = await fetch(`${API}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: 'NEX-TEST01', eventId: 'e1', quantity: 1, totalPaid: 0, bookedAt: new Date().toISOString() })
    });
    const tickBody = await tickRes.json();
    console.log('✅ POST ticket:', tickRes.status, '— ticketId:', tickBody.ticketId || tickBody.error);
}
test().catch(e => console.error('❌ Test failed:', e.message));
