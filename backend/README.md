# CargoCrazee Backend API

A comprehensive Node.js/Express backend for the CargoCrazee logistics platform, featuring MongoDB Atlas integration, JWT authentication, and AI-powered delivery optimization.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Delivery Management**: Complete CRUD operations for deliveries with tracking and status updates
- **Alert System**: Real-time notifications and alerts for delivery updates
- **Shared Truck Pooling**: AI-powered matching for shared truck opportunities
- **Micro-Warehouse Management**: Storage booking and management system
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Security**: Rate limiting, input validation, and security headers
- **MongoDB Integration**: Optimized database models with indexing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `config.env` and update with your MongoDB Atlas credentials
   - Update JWT secret and other configuration values

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `config.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "company": "ABC Logistics",
  "phone": "+91 98765 43210",
  "businessType": "ecommerce"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Delivery Endpoints

#### Create Delivery
```http
POST /api/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer": {
    "name": "Jane Smith",
    "phone": "+91 98765 43211"
  },
  "pickup": {
    "address": "123 Main St, Delhi"
  },
  "delivery": {
    "address": "456 Oak Ave, Gurgaon"
  },
  "package": {
    "type": "Electronics",
    "weight": 5.5
  },
  "schedule": {
    "deliveryDate": "2024-01-20",
    "preferredTimeSlot": "9-12"
  }
}
```

#### Get Deliveries
```http
GET /api/deliveries?page=1&limit=10&status=Scheduled
Authorization: Bearer <token>
```

#### Update Delivery Status
```http
PUT /api/deliveries/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "In Transit",
  "location": "Delhi Distribution Center",
  "notes": "Package picked up successfully"
}
```

### Alert Endpoints

#### Get Alerts
```http
GET /api/alerts?page=1&limit=20&type=info
Authorization: Bearer <token>
```

#### Mark Alert as Read
```http
PUT /api/alerts/:id/read
Authorization: Bearer <token>
```

### Shared Truck Endpoints

#### Get Available Shared Trucks
```http
GET /api/shared-trucks
Authorization: Bearer <token>
```

#### Search Shared Trucks
```http
POST /api/shared-trucks/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupLocation": "Delhi",
  "deliveryLocation": "Gurgaon",
  "preferredDate": "2024-01-20",
  "packageWeight": 10.5
}
```

### Micro-Warehouse Endpoints

#### Get Available Warehouses
```http
GET /api/micro-warehouses?location=Delhi&size=200
Authorization: Bearer <token>
```

#### Book Warehouse Space
```http
POST /api/micro-warehouses/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "warehouseId": "MW001",
  "spaceRequired": 200,
  "duration": 7,
  "startDate": "2024-01-20"
}
```

### Dashboard Endpoints

#### Get Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

#### Get Analytics
```http
GET /api/dashboard/analytics?period=30
Authorization: Bearer <token>
```

## 🗄️ Database Models

### User Model
- Authentication fields (email, password)
- Profile information (name, company, phone)
- Business details and preferences
- Security features (login attempts, account locking)

### Delivery Model
- Customer and package information
- Pickup and delivery addresses
- Scheduling and pricing details
- Status tracking and history
- AI optimization data

### Alert Model
- Notification types and priorities
- Delivery associations
- Read/unread status
- Expiration and archiving

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing security
- **Helmet**: Security headers middleware
- **Account Locking**: Protection against multiple failed login attempts

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure CORS for production domain
5. Set up proper logging

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Comprehensive error middleware
- **Health Check**: `/api/health` endpoint
- **Performance**: Database indexing and query optimization

## 🔧 Development

### Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── config.env       # Environment configuration
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Features
1. Create model in `models/` directory
2. Add routes in `routes/` directory
3. Update server.js to include new routes
4. Add validation and error handling
5. Test with appropriate test cases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live tracking
- **AI Integration**: Machine learning for route optimization
- **Payment Gateway**: Integrated payment processing
- **Mobile API**: Optimized endpoints for mobile apps
- **Advanced Analytics**: Business intelligence and reporting
- **Multi-language Support**: Internationalization
- **Push Notifications**: Mobile push notification system
