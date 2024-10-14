# AlgoDevShop

AlgoDevShop is a web application that interacts with the Algorand blockchain, allowing users to create wallets, dispense Algorand, and view wallet balances. 

## Getting Started

### Prerequisites

- **Node.js** and **npm** for the frontend.
- **Python** and **Flask** for the backend.
- **Algokit** for local blockchain interactions.
- **Docker Desktop** for Containerization

### Setup Instructions

1. **Backend**:
   - Navigate to the backend directory: `cd ./backend`
   - Install dependencies: `pip install -r requirements.txt`
   - Start Algorand localnet: `algokit localnet start`
   - Run the Flask app: `flask run`

2. **Frontend**:
   - Navigate to the frontend directory: `cd ../frontend`
   - Install dependencies: `npm install`
   - Start the React app: `npm start`

