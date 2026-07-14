# LuminaLearn: AI-Powered Online Learning Platform

LuminaLearn is a Next-Generation Online Learning Platform designed to provide a highly interactive, personalized, and gamified study ecosystem far beyond traditional structures (Udemy/Coursera).

## 🚀 Advanced Features

1. **Context-Aware AI Tutor**: Integrated alongside course video players, scanning active subtitles/transcripts to resolve coding doubts or concepts in real-time.
2. **ATS Resume Builder**: paste plain-text CVs to retrieve keyword gap analyses, numeric ATS scores, and bullet adjustments.
3. **Career Roadmap Generator**: Input target fields to output detailed study schedules, weekly hours, reading materials, and salary ranges.
4. **Interactive Code Sandbox**: Compile JavaScript, Java, Python, or C++ directly in the browser with AI Code Review audits grading O(N) complexity constraints.
5. **Gamification Streak Engine**: Earn XP points for logging in daily, completing modules, and winning achievement badges.
6. **Certificate Verification Portal**: Generate secure completion certificates verified via unique ID lookups and mock blockchain transaction logs.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript, Redux Toolkit, React Query (TanStack), Framer Motion.
* **Backend**: Spring Boot 3.3, Spring Security, JPA/Hibernate, JWT Authentication, Mailer.
* **Database & Caching**: PostgreSQL, Redis (active streaks and rate-limiting).
* **Containerization**: Docker, Docker Compose.

---

## 🏃 Run the Platform Locally

### Option 1: Via Docker Compose (Quickest)

Spin up the entire stack (PostgreSQL, Redis, Spring Boot REST API, Next.js frontend Client) with a single command:

```bash
docker-compose up --build
```

Access the components:
* **Frontend Application**: `http://localhost:3000`
* **Backend API Gateway**: `http://localhost:8080`
* **Swagger API Explorer**: `http://localhost:8080/swagger-ui/index.html`

---

### Option 2: Running Services Separately (Development Mode)

#### 1. Boot Database Services
Ensure you have local instances of PostgreSQL and Redis active, or modify `backend/src/main/resources/application.yml` configurations.

#### 2. Run the Backend REST API
Navigate to the backend directory and launch the Spring Boot service:
```bash
cd backend
mvn clean spring-boot:run
```

#### 3. Run the Frontend Client
Navigate to the frontend directory, install dependencies, and launch the dev environment:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Seeding & Default Credentials

The platform includes a database seeder that auto-populates mock users, badges, and comprehensive course modules upon boot:

* **Student Account**:
  * Email: `student@platform.com`
  * Password: `password`
* **Instructor Account**:
  * Email: `instructor@platform.com`
  * Password: `password`
* **General OTP Bypass**: `123456`
