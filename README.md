# 🩸 BloodLink – Blood Donor and Emergency Request Management System

## About the Project

BloodLink is a C++ and web-based Blood Donor and Emergency Request Management System. It provides a common platform to manage blood donors, hospitals and emergency blood requests.

The system helps identify compatible available donors, analyse blood demand and prioritise emergency requests through rule-based decision support.

## Features

### 1. Donor Management
- Register new blood donors.
- Store donor details and blood groups.
- Manage donor availability.

### 2. Hospital Management
- Register hospitals.
- Store hospital details and locations.

### 3. Blood Request Management
- Create blood requests with blood group, units and urgency.
- Track request status: Pending, Accepted, Completed or Cancelled.
- Update request status.

### 4. Smart Donor Matching
- Checks blood-group compatibility using a predefined compatibility mapping.
- Filters available compatible donors.
- Ranks donors using location-text matching.
- Displays matching information and ranking reasons.

### 5. Demand Intelligence
- Displays blood-group demand based on registered requests.
- Analyses request urgency.
- Identifies possible gaps between demand and available donors.

### 6. Emergency Intelligence
- Calculates a priority score for blood requests.
- Considers urgency, required units and compatible donor availability.
- Displays priority levels and reasons behind the score.

*Note: The matching, demand and emergency intelligence features use programmed rules and existing records. They do not use a trained machine-learning model or GPS tracking.*

## Technologies Used

| Technology | Purpose |
|---|---|
| C++17 | Backend logic |
| Crow C++ Framework | HTTP server and API |
| Standalone Asio | Networking support |
| HTML | Website structure |
| CSS | Website styling |
| JavaScript | Frontend functionality |
| JSON | Data exchange between frontend and backend |

## Object-Oriented Programming Concepts

- **Encapsulation:** Data members are kept private and accessed through public methods.
- **Inheritance:** Donor and Hospital inherit from the Person base class.
- **Abstraction:** Person is an abstract base class with a pure virtual displayDetails() function.
- **Polymorphism:** Donor and Hospital provide their own implementations of displayDetails().

## Project Structure

- `backend/` – C++ web server code.
- `web/` – HTML, CSS and JavaScript frontend files.
- `libraries/` – Crow and Asio dependencies.
- `Person.h / Person.cpp` – Base Person class.
- `Donor.h / Donor.cpp` – Donor class.
- `Hospital.h / Hospital.cpp` – Hospital class.
- `BloodRequest.h / BloodRequest.cpp` – Blood request class.
- `BloodBankSystem.h / BloodBankSystem.cpp` – Main system management logic.
- `main.cpp` – Console application entry point.

## How It Works

1. The user interacts with the website.
2. JavaScript sends HTTP requests to the C++ backend.
3. The Crow server processes API requests.
4. BloodBankSystem manages donor, hospital and request records.
5. The backend returns JSON responses.
6. The website displays updated information on the dashboard.



GitHub: https://github.com/TanishaZurange/BloodLink
