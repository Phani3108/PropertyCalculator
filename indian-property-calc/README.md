# India Property Calculator

A comprehensive tool to calculate property costs, EMIs, and build estimates for Indian real estate.

## Features

- **Flat Purchase Calculator**: Calculate total costs including stamp duty, registration, GST, and EMI for flat purchases
- **House Building Calculator**: Estimate construction costs including materials, labor, and permits
- **City-Specific Data**: Accurate estimates based on city and state-specific costs
- **Loan EMI Calculator**: Calculate EMIs based on loan amount, interest rate, and tenure
- **PMAY Subsidy Integration**: Calculate eligible subsidies under the Pradhan Mantri Awas Yojana

## Tech Stack

### Frontend
- Next.js with React
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- SWR for data fetching

### Backend
- Node.js with Express
- TypeScript
- JSON-based data models
- Jest for testing
- Winston for logging
- Rate limiting and security middleware

### DevOps
- Docker containers
- GitHub Actions for CI/CD
- AWS deployment
- Automated testing
- Performance monitoring

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Phani31/India-Property-Calculator.git
   cd India-Property-Calculator
   ```

2. Install dependencies for backend:
   ```bash
   cd backend
   npm install
   ```

3. Install dependencies for frontend:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   The backend server will run on http://localhost:5000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at http://localhost:3000

## Usage

1. Select either "Flat Purchase" or "House Build" tab
2. Fill in the required details:
   - City
   - Built-up area
   - Budget quality
   - Other property-specific details
3. Add loan details if financing is required
4. Click "Calculate Property Cost" to view the detailed breakdown

## Project Structure

```
indian-property-calc/
├── frontend/                # Next.js frontend application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── backend/               # Express backend server
│   ├── src/
│   │   ├── api/          # API routes
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
└── docker/               # Docker configuration
```

## API Documentation

Detailed API documentation is available at `/api/docs` when running the server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built by Phani Marupaka
- Uses real estate data from various Indian sources
- Stamp duty and registration costs based on state government regulations
