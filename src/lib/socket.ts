import { Server } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle joining booking room
    socket.on('join-booking', (bookingId: string) => {
      socket.join(`booking-${bookingId}`);
      console.log(`Client ${socket.id} joined booking room: ${bookingId}`);
    });

    // Handle leaving booking room
    socket.on('leave-booking', (bookingId: string) => {
      socket.leave(`booking-${bookingId}`);
      console.log(`Client ${socket.id} left booking room: ${bookingId}`);
    });

    // Handle booking status updates (for cleaners/admins)
    socket.on('update-booking-status', (data: {
      bookingId: string;
      status: string;
      message?: string;
    }) => {
      // Broadcast to all clients in the booking room
      io.to(`booking-${data.bookingId}`).emit('booking-status-update', {
        bookingId: data.bookingId,
        status: data.status,
        message: data.message || `Booking status updated to ${data.status}`
      });
      console.log(`Booking ${data.bookingId} status updated to ${data.status}`);
    });

    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};