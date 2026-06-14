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

## Important Business Rules
- Only available cars can be booked.
- Booking a car changes its status to Booked.
- Cancelling or completing a booking makes the car Available again.
- Cars with active bookings cannot be deleted.
- Revenue is calculated only from completed bookings.

## Viva Notes
- **fetch() & async/await**: Used to make asynchronous HTTP requests to the JSON Server without blocking the main thread.
- **JSON Server**: A quick way to get a full fake REST API with zero coding, reading directly from `db.json`.
- **GET/POST/PATCH/DELETE**: HTTP methods representing Read, Create, Update (partial), and Delete operations respectively.
- **DOM manipulation**: JavaScript is used to dynamically read values, create HTML elements, update classes, and render data without reloading the page.
- **Form validation**: Enforced both via HTML attributes (e.g. `min`, `required`) and strict JavaScript checks (regex, length checks) before any API call.
- **response.ok**: Checked after every fetch to verify the HTTP status code is in the 200-299 success range.
- **JSON.stringify()**: Converts JavaScript objects into JSON string format so they can be safely sent as the body of POST/PATCH requests.
- **Why PATCH is used for status updates**: PATCH is ideal for modifying just one specific field (like status) without needing to send the entire object payload again, unlike PUT.
- **Difference between customer panel and admin panel**: The customer panel focuses on safe presentation, strict validation, and creating bookings. The admin panel has elevated privileges to mutate all data, requiring more complex state handling and safety guards (e.g. preventing deletion of cars that are currently booked).

## Known Limitations
- No real authentication.
- JSON Server is local mock backend.
- No real payment system.
- No real image uploads.

## Student Info
Name: 
Roll Number: 
Section: 

## Final Testing Checklist

Final Testing Checklist:
- [ ] JSON Server starts correctly.
- [ ] Customer page loads cars.
- [ ] Customer search/filter/sort works.
- [ ] Customer can book available car.
- [ ] Booking appears in db.json.
- [ ] Car status changes to Booked.
- [ ] Customer can search booking by phone.
- [ ] Customer can cancel pending booking.
- [ ] Admin page loads cars and bookings.
- [ ] Admin stats are correct.
- [ ] Admin can add car.
- [ ] Admin can edit car.
- [ ] Admin can delete car without active bookings.
- [ ] Admin cannot delete car with active bookings.
- [ ] Admin can confirm booking.
- [ ] Admin can complete booking.
- [ ] Completed booking makes car Available.
- [ ] Admin can cancel booking.
- [ ] Cancelled booking makes car Available.
- [ ] Admin can delete booking.
- [ ] Error message appears if JSON Server is not running.
- [ ] Layout works on mobile.
