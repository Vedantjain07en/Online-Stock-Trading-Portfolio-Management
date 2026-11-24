# Online Stock Trading and Portfolio Management System

**Academic Software Engineering project** built with HTML, CSS, JavaScript, Node.js, Express and MongoDB.

## Project team
- Vedant Sonvane — EN24CS3011130
- Vedant Gour — EN24CS3011128
- Vedant Jain — EN24CS3011129

## Features
- User registration and login (hashed passwords and JWT authentication)
- Stock market watch with search
- Simulated buy and sell orders using virtual cash
- Portfolio holdings and average buy price
- Current-value and unrealised profit/loss calculation
- Recent transaction history
- MongoDB persistence

## Technology stack
- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express.js, REST API
- Database: MongoDB with Mongoose
- Authentication: bcryptjs and JSON Web Tokens

This stack is intentionally simple to run in VS Code: one Node server serves both the frontend and API. No React build step is required.

## Requirements
- Node.js 18 or newer
- MongoDB Community Server running locally OR a MongoDB Atlas connection string
- Visual Studio Code (recommended)

## Setup in VS Code
1. Extract the ZIP and open the `Online_Stock_Trading_Project` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to a new file named `.env`.
5. Set `MONGODB_URI` in `.env`:
   - Local MongoDB: `mongodb://127.0.0.1:27017/stock_portfolio`
   - MongoDB Atlas: paste your own Atlas connection string.
6. Replace `JWT_SECRET` with a long random secret.
7. Seed the sample stocks:
   ```bash
   npm run seed
   ```
8. Start the application:
   ```bash
   npm start
   ```
9. Open `http://localhost:5000` in your browser.
10. Create an account. Each new account starts with ₹1,00,000 virtual cash.

For development with automatic server restart:
```bash
npm run dev
```

## Sample stocks
RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK, ITC, WIPRO and SBIN.
The prices are fixed illustrative sample data. They are not live market quotes.

## API overview
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server health |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/stocks` | List stocks |
| GET | `/api/stocks?search=tcs` | Search stocks |
| GET | `/api/portfolio` | Portfolio and recent transactions (JWT required) |
| POST | `/api/portfolio/trade` | Simulated BUY/SELL (JWT required) |

Trade request example:
```json
{ "symbol": "TCS", "type": "BUY", "quantity": 2 }
```

## GitHub upload
1. Create a new GitHub repository named `Online-Stock-Trading-Portfolio-Management`.
2. In this folder, open the VS Code terminal.
3. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial SE project submission"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/Online-Stock-Trading-Portfolio-Management.git
   git push -u origin main
   ```
4. Replace `YOUR-USERNAME` with your GitHub username.
5. Copy the repository URL into `Github_Link.txt` and include it in your final submission ZIP.

## Important notes
- Do not upload `.env` or database passwords to GitHub.
- Do not upload `node_modules`; it can be recreated with `npm install`.
- This is a classroom simulation. It does not connect to a broker, execute real orders, or provide investment advice.
- Before live deployment, add stronger validation, rate limiting, secure cookie/session handling, tests, audit logging and transactional safeguards.# stock-trading-and-portfolio
