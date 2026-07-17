import express from 'express';
import cors from 'cors';
import { seedData } from '../../../src/demoData.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

let state = structuredClone(seedData);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({ ok: true, stack: 'node-express', source: 'local' });
});

app.get('/api/bootstrap', (_request, response) => {
  response.json(state);
});

app.get('/api/stats', (_request, response) => {
  response.json({
    source: 'local',
    stack: 'node-express',
    totalBookings: state.bookings.length,
    activeBookings: state.bookings.filter((booking) => ['pending', 'confirmed', 'in_progress'].includes(booking.status)).length,
    totalProfessionals: state.professionals.length,
    totalCategories: state.categories.length,
    lastUpdated: new Date().toISOString(),
  });
});

app.post('/api/bookings', (request, response) => {
  const booking = request.body?.booking;
  if (!booking?.id) {
    return response.status(400).json({ error: 'booking is required' });
  }

  state = {
    ...state,
    bookings: [booking, ...state.bookings.filter((item) => item.id !== booking.id)],
  };

  return response.status(201).json({ booking });
});

app.patch('/api/bookings/:bookingId', (request, response) => {
  const booking = request.body?.booking;
  const bookingExists = state.bookings.some((item) => item.id === request.params.bookingId);

  if (!booking?.id) {
    return response.status(400).json({ error: 'booking is required' });
  }

  if (!bookingExists) {
    return response.status(404).json({ error: 'Booking not found' });
  }

  state = {
    ...state,
    bookings: state.bookings.map((item) => (item.id === request.params.bookingId ? booking : item)),
  };

  return response.json({ booking });
});

app.listen(PORT, () => {
  console.log(`Express backend running on http://localhost:${PORT}`);
});
