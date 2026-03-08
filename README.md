Blood Report Analysis Dashboard
This project analyzes blood test reports and provides insights and health trends.
Users can upload a blood report (PDF or image), extract parameters using OCR, analyze values, and view insights and trends through a dashboard.

Tech Stack
Frontend: React, Vite, Tailwind CSS
Backend: Node.js, Express
Database: PostgreSQL
OCR: PDF text extraction + image OCR
Charts: Recharts / Chart libraries

Project Structure
Bloodreportanalysisdashboard
│
├── backend          → Node.js API server
│
├── src              → React frontend source code
│
├── index.html       → Frontend entry
├── package.json     → Frontend dependencies
├── vite.config.ts
│
└── README.md
Prerequisites
Before running the project, make sure the following are installed on your system:
Node.js (version 18 or higher)
npm (comes with Node.js)
Git

Check installation:
node -v
npm -v
git --version

Step 1 — Clone the repository
Open terminal and run:
git clone https://github.com/komalg11/Bloodreportanalysisdashboard.git
Move into the project folder:
cd Bloodreportanalysisdashboard

Step 2 — Install Frontend Dependencies
Run this in the root folder:
npm install
This installs all frontend packages such as:
React
Tailwind CSS
MUI components
Charts libraries

Step 3 — Install Backend Dependencies
Move to the backend folder:
cd backend
Install backend packages:
npm install
This installs:
Express
OCR libraries
File upload middleware
Database drivers

Step 4 — Environment Variables
If the project uses environment variables, create a .env file inside the backend folder.
Example:
PORT=5000
DATABASE_URL=your_database_url
(If the repository already contains .env, you do not need to create it.)

Step 5 — Start Backend Server
Inside the backend folder run:
npm run dev
You should see:
Server running on port 5000

Step 6 — Start Frontend
Open a new terminal window.
Go to the main project folder:
cd Bloodreportanalysisdashboard
Run:
npm run dev

Step 7 — Open the Application
Open your browser and go to:
http://localhost:5173
The dashboard will start running locally.

How the System Works
User uploads a blood report
OCR extracts text from the report
System detects blood parameters
Values are analyzed against reference ranges
Insights and health recommendations are generated
Trends are visualized using charts

Common Issues
Dependencies not installed
Run:
npm install
again in both frontend and backend.
Backend not running
Make sure the backend server is started:
cd backend
npm run dev
Port already in use
Change the port inside the .env file.
