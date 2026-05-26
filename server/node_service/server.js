import express from 'express';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dineInRoutes from './routes/dineInRoutes.js';   // ✅ new route

// Subscribers (always running)
import './controllers/notificationSubscriber.js';
import './controllers/billingSubscriber.js';

const app = express();
app.use(express.json());

// Mount all routes
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dinein', dineInRoutes);   // ✅ new mount

app.listen(process.env.PORT || 3000, () => {
  console.log(`Node service running on port ${process.env.PORT || 3000}`);
});
