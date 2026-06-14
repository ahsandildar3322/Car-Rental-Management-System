# Car Rental Management System

## Description
A comprehensive, professionally built Car Rental Management System designed to handle customer car bookings and an admin panel for managing fleet inventory and booking lifecycles. Built entirely without external frameworks, emphasizing core web technologies and clean architecture.

## Tech Stack
- HTML5
- CSS3
- Bootstrap 5
- Plain JavaScript
- Fetch API
- JSON Server

## Folder Structure

```
car-rental-management-system/
├── index.html
├── admin.html
├── style.css
├── app.js
├── admin.js
├── db.json
└── README.md
```

## Setup Instructions

1. Open project folder in your terminal.
2. Run JSON Server (this provides the mock backend API):
   ```bash
   npx json-server --watch db.json
   ```
3. Open `index.html` in your browser for the customer panel.
4. Open `admin.html` in your browser for the admin panel.

## Customer Features
- View cars
- Search/filter/sort cars
- Book available car
- View bookings by phone
- Cancel pending bookings
- Loading/error/empty states

## Admin Features
- Dashboard stats
- Add cars
- Edit cars
- Delete cars
- Change car status
- View bookings
- Confirm bookings
- Complete bookings
- Cancel bookings
- Delete bookings
- Search/filter cars
- Search/filter bookings

## API Endpoints

Cars:
- `GET /cars`
- `POST /cars`
- `PATCH /cars/:id`
- `DELETE /cars/:id`

Bookings:
- `GET /bookings`
- `POST /bookings`
- `PATCH /bookings/:id`
- `DELETE /bookings/:id`

# Student Information
Name: Ahsan Dildar
Roll No: F24BDOCS1M01035
Project Name: Car Rental Management System
