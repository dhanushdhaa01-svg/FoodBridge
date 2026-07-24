# FoodBridge

**A Food Waste Redistribution System connecting food donors with NGOs and charitable organizations.**

## Description

FoodBridge is a full-stack web platform that reduces food waste by enabling restaurants, hotels, bakeries, supermarkets, and event organizers to donate surplus food before it expires — connecting them directly with NGOs, orphanages, shelters, and old-age homes that can put it to use.

## Project Goal

The goal of FoodBridge is to reduce food waste and help communities by providing a secure platform that connects food donors with NGOs, ensuring surplus food reaches people in need instead of being discarded.

## Problem Statement

Large volumes of edible surplus food are discarded daily by food businesses and event organizers due to a lack of an efficient channel to redirect it to organizations that need it, while NGOs and shelters struggle to source consistent food supplies.

## Proposed Solution

FoodBridge provides a role-based platform where:
- **Donors** post surplus food donations with quantity, food type, expiry window, and pickup details.
- **NGOs** search and claim available donations.
- **Admins** oversee platform activity, verify organizations, and moderate the system.

## Features

- User registration and authentication
- Role-based access (Donor, NGO, Admin)
- Food donation management
- Donation search and filtering
- Donation claim system
- Admin dashboard
- Secure JWT authentication

## Tech Stack

- **Frontend:** Angular, TypeScript, HTML5, SCSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Community Server (Development), MongoDB Atlas (Production), Mongoose
- **Authentication:** JWT, bcrypt
- **Tools:** Git, GitHub, MongoDB Compass, Postman

## User Roles

- Donor
- NGO
- Administrator

## Project Structure

FoodBridge/
├── frontend/          # Angular application
├── backend/           # Express API
├── docs/              # Architecture notes and documentation
├── database/          # Database scripts and references
├── postman/           # API collections
├── assets/            # Shared static assets
├── scripts/           # Utility scripts
├── README.md
└── .gitignore


## Project Status

🚧 Under Development

**Current Milestone:** Project Initialization

## Installation

_To be added once the frontend and backend scaffolds are complete._

## API Documentation

_To be added. Base URL will be `/api/v1`._

## Deployment

_To be added once a deployment target is finalized._

## Future Scope

- Real-time notifications
- Email alerts for donation requests
- Live location tracking for pickups
- AI-based food recommendation and prioritization
- Mobile application for Android and iOS

## Author

**Dhanush**

## License

This project is developed for academic and learning purposes.