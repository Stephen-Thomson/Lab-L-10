import express, { Express, Request, Response } from 'express'
import bodyParser from 'body-parser'
import Authrite from 'authrite-express'
import fs from 'fs'

// Let TypeScript know there is possibly an authrite prop on incoming requests
declare module 'express-serve-static-core' {
  interface Request {
    authrite?: {
      identityKey: string
    }
    certificates?: any
  }
}

const app: Express = express()
const port = 3000

// Define the server private key and base URL
const serverPrivateKey = fs.readFileSync('server-private-key.hex', 'utf8').trim(); // Load private key from a file
const baseUrl = 'http://localhost:3000' // Base URL of application

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Expose-Headers', '*')
  res.header('Access-Control-Allow-Private-Network', 'true')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Non-protected route
app.get('/non-protected', (req: Request, res: Response) => {
  res.json({ message: 'This is a non-protected route' })
})

// Use Authrite middleware to validate requests
app.use(
  Authrite.middleware({
    serverPrivateKey,
    baseUrl,
  })
)

// Protected route
app.post('/protected', (req: Request, res: Response) => {
  if (req.authrite && req.authrite.identityKey) {
    const userIdentityKey = req.authrite.identityKey
    console.log('Authenticated User Identity Key:', userIdentityKey)
    
    res.json({
      message: `Authenticated user identity key: ${userIdentityKey}`,
    })
  } else {
    console.log('Unauthorized access attempt.')
    res.status(401).json({ message: 'Unauthorized' })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
