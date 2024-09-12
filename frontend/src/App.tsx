import React, { useState } from 'react';
import { Button, Typography, Container, CircularProgress } from '@mui/material';
import { Authrite } from 'authrite-js';
const PacketPay = require('@packetpay/js');  // Import PacketPay

const TEST_CLIENT_PRIVATE_KEY = 'bf4d159ac007184e0d458b7d6e3deb0e645269f55f13ba10f24e654ffc194daa';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleButtonClick = async () => {
    setIsLoading(true);
    setErrorMessage(null);  // Clear any previous errors

    try {
      const authriteClient = new Authrite({
        clientPrivateKey: TEST_CLIENT_PRIVATE_KEY
      });

      // Make a request using PacketPay
      const response = await PacketPay(
        'http://localhost:3000/weather',  // The backend endpoint
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        {
          clientPrivateKey: TEST_CLIENT_PRIVATE_KEY,  // Use the private key
          description: 'Payment for weather data',  // Payment description
        }
      );

      // Check for 402 Payment Required response
      if (response.status === 402) {
        console.log('Payment required: 333 satoshis');
        setErrorMessage('Payment required: 333 satoshis');
        return;
      }

      // If no payment error, parse the response as JSON
      const decodedResponse = await response.json();
      console.log('Weather data:', decodedResponse);

      // Set the weather data in the state to display it
      setWeatherData(decodedResponse);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setErrorMessage('Error occurred while fetching weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Weather Data App
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Fetch Weather Data'}
      </Button>

      {errorMessage && (
        <Typography variant="body1" style={{ color: 'red', marginTop: '20px' }}>
          {errorMessage}
        </Typography>
      )}

      {weatherData && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6">Weather Data:</Typography>
          <Typography variant="body1">
            Temperature: {weatherData.main.temp}°C
          </Typography>
          <Typography variant="body1">
            Weather: {weatherData.weather[0].description}
          </Typography>
          <Typography variant="body1">
            Humidity: {weatherData.main.humidity}%
          </Typography>
        </div>
      )}
    </Container>
  );
};

export default App;
