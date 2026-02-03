# MongoDB Setup Instructions

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/cartify

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Client URL
CLIENT_URL=http://localhost:5173

# Server Port
PORT=4000
```

## Setup Steps

1. **Install MongoDB** (if not already installed):
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
   - Make sure MongoDB service is running

2. **Create environment file**:
   - Copy the `.env` file and update the `MONGODB_URI`
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/cartify`
   - For MongoDB Atlas: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cartify`

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Test the connection**:
   ```bash
   npm test
   ```

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```

6. **Start the server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running on your system
- Check if the connection string is correct
- For local MongoDB, make sure it's running on port 27017

### Timeout Errors
- The connection now has extended timeouts (30s server selection, 45s socket)
- MongoDB buffering is disabled to prevent timeout issues
- Make sure your MongoDB instance is accessible

## Database Models

The application now uses three main MongoDB collections:

- **Users**: Store user authentication data
- **Items**: Store product information
- **Carts**: Store user shopping carts with items

## Migration Notes

- The application has been migrated from db.json to MongoDB
- All existing API endpoints remain the same
- ObjectIds are now used instead of nanoid strings
- The database connection is established on server startup
