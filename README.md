# Nightmare

Nightmare is a university project for a **Software Architecture** course.

The project delivers a unified SaaS platform for **small and medium businesses** in two sectors:

- **Catering:** bars, cafés, restaurants
- **Beauty:** barbers, hairdressers, SPA salons

The system supports functionality for both domains, with feature access controlled by each customer’s **subscription plan**.

Nightmare is designed to be operated entirely by **business employees** and **managers**.

---

# Documentation

All project documentation is located in the [`/docs`](docs/) directory:

- [**Software_System_Design.pdf**](docs/Software_System_Design.pdf) - the original system design specification created by another team.
- [**API.yaml**](docs/API.yaml) - the API definition describing available endpoints and data structures, also provided by that team.
- [**CHANGELOG.md**](docs/CHANGELOG.md) - a log of architectural decisions, deviations, and clarifications made during implementation.
- [**Feedback.md**](docs/Feedback.md) - feedback on the original design.

---

# Database Setup

The project uses **PostgreSQL** for data storage. Follow the steps below to set up the database locally:

1. **Install PostgreSQL**  
   Download PostgreSQL from [the official site](https://www.postgresql.org/download/) and follow the installation wizard.

2. **Create a `.env` file**  
   Copy the provided `.env.example` file to `.env` and update the values with your local configuration.

3. **Apply Database Migrations**
    Open the **Package Manager Console** (located at `Tools -> NuGet Package Manager -> Package Manager Console`) then run the following command:

    ```powershell
    Update-Database
    ```

---

# Running the Project (HTTP/HTTPS)

## Backend (ASP.NET Core)
- By default, the backend runs on both HTTP and HTTPS if you use:
  ```powershell
  dotnet run --urls "https://localhost:7049;http://localhost:5087"
  ```
- To trust the development HTTPS certificate (required for HTTPS):
  ```powershell
  dotnet dev-certs https --trust
  ```

## Frontend (Vite)
- By default, the frontend runs on HTTP:
  ```powershell
  npm run dev
  # Access at http://localhost:3000
  ```
- To run the frontend on HTTPS (requires mkcert and generated certs):
  ```powershell
  $env:VITE_HTTPS=1; npm run dev
  # Access at https://localhost:3000
  ```
- To proxy API requests to the backend's HTTPS endpoint, also set:
  ```powershell
  $env:VITE_HTTPS=1; $env:VITE_BACKEND_HTTPS=1; npm run dev
  # Frontend and backend both on HTTPS
  ```
- You can mix protocols as needed:
  - HTTP frontend, HTTP backend: `npm run dev`
  - HTTP frontend, HTTPS backend: `$env:VITE_BACKEND_HTTPS=1; npm run dev`
  - HTTPS frontend, HTTP backend: `$env:VITE_HTTPS=1; npm run dev`
  - HTTPS frontend, HTTPS backend: `$env:VITE_HTTPS=1; $env:VITE_BACKEND_HTTPS=1; npm run dev`

## Certificates for HTTPS (Frontend)
- Install [mkcert](https://github.com/FiloSottile/mkcert) (or with choco: `choco install mkcert`) and run:
  ```powershell
  mkcert -install
  mkcert localhost
  # This generates localhost.pem and localhost-key.pem in your frontend directory
  ```
- These files are used by Vite for HTTPS.

## CORS
- The backend is configured to allow both `http://localhost:3000` and `https://localhost:3000` origins for development.

---