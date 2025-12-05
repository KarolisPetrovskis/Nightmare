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

- [**Software_System_Design.pdf**](docs/Software_System_Design.pdf) — the original system design specification created by another team.
- [**API.yaml**](docs/API.yaml) — the API definition describing available endpoints and data structures, also provided by that team.
- [**CHANGELOG.md**](docs/CHANGELOG.md) — a log of architectural decisions, deviations, and clarifications made during implementation.

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