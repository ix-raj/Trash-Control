# TRASH CONTROL

TRASH CONTROL is a civic waste-management platform that connects residents with municipal operations teams. Citizens can report waste, follow local cleanup activity, participate in campaigns, and earn Eco Points. Administrators can verify reports, prioritize work, analyze waste density, and coordinate cleanup routes.


## Product Model

### Citizen experience

- Report waste with a description, location, and optional image.
- View nearby waste reports and their current status.
- Discover and join community cleanup campaigns.
- Track Eco Points, rewards, achievements, and leaderboard progress.
- Receive notifications about reports, campaigns, and contributions.

### Municipal admin experience

- Review, approve, reject, assign, and resolve waste reports.
- Monitor operational metrics and citywide waste activity.
- Use the Operations Map for reports, hotspots, risk assessment, and cleanup planning.
- Analyze report density and automated priority assessments.
- Generate cleanup routes for selected operational locations.
- Create and manage cleanup campaigns and monitor volunteer participation.

## Architecture

```text
React/Vite frontend
        |
        | REST API, JWT, Socket.IO
        v
Node.js/Express backend ---- MongoDB/Mongoose
        |
        | protected AI proxy routes
        v
Flask AI service
        |
        +-- Random Forest prediction model
        +-- Geographic hotspot analysis
        +-- Rule-based priority assessment
        +-- Route optimization heuristic
```

### Repository structure

```text
frontend/       React and Vite application
backend/        Express API, authentication, database, uploads, and sockets
ai-service/     Flask prediction and operational analysis service
docs/           Database and project documentation
```

## Prerequisites

- Node.js 22.x
- npm
- Python 3.10 or newer
- MongoDB local instance or MongoDB Atlas database
- Cloudinary account for image uploads

## Environment Setup

Copy each `.env.example` file to `.env` in the same directory, then replace placeholders with your local values. Do not commit secrets.

### `frontend/.env.example`

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### `backend/.env.example`

```env
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:5000
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

`MONGO_URI`, `JWT_SECRET`, and the Cloudinary variables must contain real values for the corresponding features to work. The AI service must be reachable at `AI_SERVICE_URL` for prediction, hotspot, classification, and route requests.

### `ai-service/.env.example`

The Flask service listens on port `5000` by default. Set `PORT` only when using another local port:

```env
PORT=5000
```

## Installation

Install each service in its own directory:

```powershell
cd backend
npm install

cd ..\frontend
npm install

cd ..\ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If the virtual environment already exists, activate it and run the `pip install` command when dependencies change.

## Start Locally

Start each service in a separate terminal from the project root.

### Terminal 1: AI service

```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
python app.py
```

The service runs at `http://localhost:5000`.

### Terminal 2: backend

```powershell
cd backend
npm run dev
```

The API runs at `http://localhost:3000`.

### Terminal 3: frontend

```powershell
cd frontend
npm run dev
```

Open `http://localhost:5173` in a browser.

MongoDB must be reachable before logging in or using database-backed features.

## Available Scripts

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a frontend build |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | Run Oxlint |

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Express and Socket.IO server |
| `npm start` | Start the Express server |
| `npm run build` | Run the backend build placeholder |
| `node src/config/seed.js` | Clear and repopulate the database with local demo data |

### AI service

| Command | Purpose |
| --- | --- |
| `python app.py` | Start the Flask service |
| `python train_model.py` | Train and save `waste_model.pkl` from the sample dataset |
| `pip install -r requirements.txt` | Install Python dependencies |

The seed command deletes existing users, reports, notifications, achievements, leaderboard records, and rewards before inserting demo data. Use it only with a development database.

## Local Profiles

The seed script creates these development profiles:

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Admin | `ops_admin` | `admin@trashcontrol.in` | `password123` |
| Citizen | `arjun_nair` | `arjun.nair@example.in` | `password123` |
| Citizen | `kavya_iyer` | `kavya.iyer@example.in` | `password123` |

These are demo credentials only. Change or remove them before using a shared database.

## Maps and Role-Based Access

The citizen map focuses on community visibility: waste reports, report status, cleanup campaigns, nearby activity, and collection hubs at appropriate zoom levels.

The admin Operations Map adds municipal tools: report management, operational layers, hotspot analysis, area risk assessment, priority explanations, and cleanup route planning. Admin APIs are protected by backend role authorization; hiding a menu item is not the security boundary.

## AI and Operational Analysis

The Flask service exposes four capabilities through protected backend routes:

1. **Waste-volume prediction**: Uses the trained `RandomForestRegressor` when `waste_model.pkl` is available. Inputs include latitude, longitude, month, population density, and complaint count. Without the model file, the service reports that it is using its analytical fallback.
2. **Waste hotspots**: Groups report coordinates into rounded geographic cells and assigns a density-based risk level. This is geographic analysis, not a predictive ML model.
3. **Automated priority assessment**: Uses report waste type and description rules to identify priorities such as hazardous material, blocked pathways, organic decomposition, or non-hazardous waste.
4. **Cleanup route optimization**: Filters points to an optional region, removes duplicates, builds a nearest-neighbor route, and applies a bounded 2-opt improvement pass. It returns route stops, distance, estimated time, fuel savings, and the method used.

## Data and Integrations

- **MongoDB/Mongoose** stores users, waste reports, notifications, achievements, leaderboard records, rewards, and campaigns.
- **JWT authentication** identifies users and protects citizen/admin APIs.
- **Socket.IO** delivers realtime notifications and activity updates.
- **Cloudinary** stores uploaded report images when its backend credentials are configured.
- **Leaflet and OpenStreetMap-compatible tiles** provide the map interface.
- The database design is documented in [`docs/database_schema.md`](docs/database_schema.md).

## Troubleshooting

### MongoDB connection refused

Start MongoDB locally or provide a reachable MongoDB Atlas connection string in `backend/.env`. Confirm that `MONGO_URI` is loaded by the backend.

### AI requests fail

Start the Flask service first and confirm that `AI_SERVICE_URL` matches its port. If prediction reports a missing model, run `python train_model.py` from `ai-service` and restart Flask.

### Images do not upload

Check all three Cloudinary variables and verify that the backend can reach Cloudinary. Reports without images can still use the rest of the reporting flow.

### Frontend cannot reach the API

Confirm `VITE_API_URL=http://localhost:3000/api`, restart Vite after changing `.env`, and check that the backend is running.

### Admin tools are unavailable

Log in with the seeded admin profile or another user whose database role is `admin`. Citizen accounts cannot call admin-only endpoints.

## Validation

Useful local checks:

```powershell
cd frontend
npm run lint

cd ..\backend
node --check server.js

cd ..\ai-service
python -m py_compile app.py train_model.py
```

The full application requires MongoDB, the backend, the AI service, and the frontend to be running together.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
