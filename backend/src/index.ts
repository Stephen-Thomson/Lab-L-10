import express, { Express, Request, Response } from 'express';
import bodyParser from 'body-parser';
import Authrite from 'authrite-express';
import PacketPay from '@packetpay/express';  // Import PacketPay
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Let TypeScript know there is possibly an authrite prop on incoming requests
declare module 'express-serve-static-core' {
  interface Request {
    authrite?: {
      identityKey: string;
    };
    certificates?: any;
  }
}

// Extend the Request type to include the packetpay property
declare module 'express-serve-static-core' {
  interface Request {
    packetpay?: {
      satoshisPaid: number;
      reference: string;
    };
  }
}

// Initialize Express app and set port
const app: Express = express();
const port = process.env.PORT || 3000;

// Define the server private key and base URL from environment variables
const serverPrivateKey = process.env.SERVER_PRIVATE_KEY;
const baseUrl = process.env.HOSTING_DOMAIN || 'http://localhost:3000';  // Fallback to localhost if not defined

if (!serverPrivateKey) {
  throw new Error("SERVER_PRIVATE_KEY is not defined in the .env file");
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Expose-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Non-protected route
app.get('/non-protected', (req: Request, res: Response) => {
  res.json({ message: 'This is a non-protected route' });
});

// Use Authrite middleware to validate requests
app.use(
  Authrite.middleware({
    serverPrivateKey,
    baseUrl,
  })
);

// Configure PacketPay middleware
app.use(
  PacketPay({
    serverPrivateKey,
    ninjaConfig: {
      dojoURL: 'https://staging-dojo.babbage.systems',  // URL for the dojo payment service
    },
    calculateRequestPrice: (req: Request) => {
      // Set the price for weather route, 333 satoshis
      if (req.originalUrl === '/weather') {
        return 333;  // Price for accessing weather data
      }
      return 100;  // Default price for other routes (if any)
    }
  })
);

// Protected route for payment and weather data
app.post('/weather', async (req: Request, res: Response) => {
  try {
    console.log('Payment request:', req.packetpay);
    
    if ((req.packetpay?.satoshisPaid ?? 0) >= 333) {
      console.log(`Payment received: ${req.packetpay?.satoshisPaid} satoshis`);

      const response = await fetch('https://openweathermap.org/data/2.5/weather?id=5746545&appid=439d4b804bc8187953eb36d2a8c26a02', { method: 'GET' });
      const weatherData = await response.json();

      console.log('Weather data fetched:', weatherData);
      res.json(weatherData);
    } else {
      console.log('Insufficient payment:', req.packetpay?.satoshisPaid);
      res.status(402).json({ message: 'Payment required: 333 satoshis' });
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
