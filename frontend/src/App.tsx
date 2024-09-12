import React, { useState } from 'react';
import { Button, Typography, Container, CircularProgress } from '@mui/material';
import { Authrite } from 'authrite-js';

const TEST_CLIENT_PRIVATE_KEY = 'bf4d159ac007184e0d458b7d6e3deb0e645269f55f13ba10f24e654ffc194daa';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      // Create an instance of Authrite using the client private key
      const authriteClient = new Authrite({
        clientPrivateKey: TEST_CLIENT_PRIVATE_KEY
      });

      // Make a signed request to the server
      const res = await authriteClient.request('http://localhost:3000/protected', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello from client'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Convert ArrayBuffer to string
      const buffer = new Uint8Array(res.body);
      const decodedResponse = new TextDecoder().decode(buffer);
      const parsedData = JSON.parse(decodedResponse);

      // Log and set the parsed response
      console.log('Parsed response:', parsedData);
      setResponse(`Message from backend: ${parsedData.message}`);
    } catch (error) {
      console.error('Error sending request:', error);
      setResponse('Error occurred while sending request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Frontend App
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Send Request to Backend'}
      </Button>
      {response && (
        <Typography variant="body1" style={{ marginTop: '20px' }}>
          {response}
        </Typography>
      )}
    </Container>
  );
};

export default App;
