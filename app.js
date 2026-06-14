const API_BASE_URL = "http://127.0.0.1:3000";
const CARS_API = `${API_BASE_URL}/cars`;
const BOOKINGS_API = `${API_BASE_URL}/bookings`;


let allCars = [];
let filteredCars = [];
let selectedCar = null;


const carsGrid = document.getElementById("carsGrid");
const carsLoading = document.getElementById("carsLoading");
const carsError = document.getElementById("carsError");
const carsErrorMessage = document.getElementById("carsErrorMessage");
const carsEmpty = document.getElementById("carsEmpty");
const alertContainer = document.getElementById("alertContainer");


const statTotalCars = document.getElementById("statTotalCars");
const statAvailable = document.getElementById("statAvailable");
const statBooked = document.getElementById("statBooked");
const statMinPrice = document.getElementById("statMinPrice");


const searchInput = document.getElementById("searchInput");
const filterType = document.getElementById("filterType");
const filterStatus = document.getElementById("filterStatus");
const filterTransmission = document.getElementById("filterTransmission");
const sortBy = document.getElementById("sortBy");


const bookingModal = document.getElementById("bookingModal");
const bookingCarId = document.getElementById("bookingCarId");
const bookingCarName = document.getElementById("bookingCarName");
const bookingCarDetails = document.getElementById("bookingCarDetails");
const bookingPricePerDay = document.getElementById("bookingPricePerDay");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const pickupDate = document.getElementById("pickupDate");
const returnDate = document.getElementById("returnDate");
const bookingDays = document.getElementById("bookingDays");
const bookingTotal = document.getElementById("bookingTotal");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");


const lookupPhone = document.getElementById("lookupPhone");
const bookingsLoading = document.getElementById("bookingsLoading");
const bookingsEmpty = document.getElementById("bookingsEmpty");
const bookingsList = document.getElementById("bookingsList");


document.addEventListener("DOMContentLoaded", function () {
  initCustomerApp();
});




async function initCustomerApp() {
  await fetchCars();
  setupFilterListeners();
  setupBookingModalListeners();
}






async function fetchCars() {
  showCustomerLoading();
  hideElement(carsError);
  hideElement(carsEmpty);
  carsGrid.innerHTML = "";

  try {
    const response = await fetch(CARS_API);

    if (!response.ok) {
      throw new Error("Server responded with status " + response.status);
    }

    allCars = await response.json();
    filteredCars = getFilteredAndSortedCars();

    renderCustomerStats();
    renderCars(filteredCars);
  } catch (error) {
    
    carsErrorMessage.textContent = "Could not connect to JSON Server. Please run: npx json-server --watch db.json";
    showElement(carsError);
  } finally {
    hideCustomerLoading();
  }
}







function renderCars(cars) {
  carsGrid.innerHTML = "";
  hideElement(carsEmpty);
  hideElement(carsError);

  if (cars.length === 0) {
    showEmptyState("No cars match your current search or filter criteria. Try adjusting your filters.");
    return;
  }

  cars.forEach(function (car) {
    const statusClass = car.status.toLowerCase();
    const isAvailable = car.status === "Available";

    
    let buttonText = "";
    let buttonClass = "";

    if (car.status === "Available") {
      buttonText = '<i class="bi bi-calendar-check me-1"></i>Book Now';
      buttonClass = "btn btn-primary btn-sm";
    } else if (car.status === "Booked") {
      buttonText = "Already Booked";
      buttonClass = "btn btn-secondary btn-sm";
    } else {
      buttonText = "Under Maintenance";
      buttonClass = "btn btn-warning btn-sm";
    }

    const cardHTML = `
      <div class="col-md-6 col-lg-4">
        <div class="car-card">
          <img src="${car.image}" alt="${car.name}" class="car-image"
               onerror="this.src='https://via.placeholder.com/600x350?text=No+Image'">
          <div class="car-body">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h5 class="car-name mb-0">${car.name}</h5>
              <span class="status-badge ${statusClass}">${car.status}</span>
            </div>
            <p class="car-description">${car.description}</p>
            <div class="car-meta">
              <span>${car.type}</span>
              <span>${car.fuel}</span>
              <span>${car.transmission}</span>
              <span>${car.seats} Seats</span>
              <span>${car.year}</span>
            </div>
            <div class="car-footer">
              <div class="car-price">
                PKR ${car.pricePerDay.toLocaleString()} <small>/ day</small>
              </div>
              <button class="${buttonClass}"
                      ${isAvailable ? "" : "disabled"}
                      onclick="openBookingModal('${car.id}')">
                ${buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    carsGrid.innerHTML += cardHTML;
  });
}






function renderCustomerStats() {
  const total = allCars.length;
  const available = allCars.filter(function (c) { return c.status === "Available"; }).length;
  const booked = allCars.filter(function (c) { return c.status === "Booked"; }).length;

  
  const availablePrices = allCars
    .filter(function (c) { return c.status === "Available"; })
    .map(function (c) { return c.pricePerDay; });
  const minPrice = availablePrices.length > 0 ? Math.min(...availablePrices) : 0;

  statTotalCars.textContent = total;
  statAvailable.textContent = available;
  statBooked.textContent = booked;
  statMinPrice.textContent = minPrice.toLocaleString();
}






function setupFilterListeners() {
  searchInput.addEventListener("input", handleSearchAndFilters);
  filterType.addEventListener("change", handleSearchAndFilters);
  filterStatus.addEventListener("change", handleSearchAndFilters);
  filterTransmission.addEventListener("change", handleSearchAndFilters);
  sortBy.addEventListener("change", handleSearchAndFilters);
}




function handleSearchAndFilters() {
  filteredCars = getFilteredAndSortedCars();
  renderCars(filteredCars);
}






function getFilteredAndSortedCars() {
  const query = searchInput.value.toLowerCase().trim();
  const type = filterType.value;
  const status = filterStatus.value;
  const transmission = filterTransmission.value;
  const sort = sortBy.value;

  
  let result = allCars.filter(function (car) {
    
    const matchesSearch =
      !query ||
      car.name.toLowerCase().includes(query) ||
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.type.toLowerCase().includes(query) ||
      car.fuel.toLowerCase().includes(query) ||
      car.transmission.toLowerCase().includes(query);

    const matchesType = !type || car.type === type;
    const matchesStatus = !status || car.status === status;
    const matchesTransmission = !transmission || car.transmission === transmission;

    return matchesSearch && matchesType && matchesStatus && matchesTransmission;
  });

  
  if (sort === "price-asc") {
    result.sort(function (a, b) { return a.pricePerDay - b.pricePerDay; });
  } else if (sort === "price-desc") {
    result.sort(function (a, b) { return b.pricePerDay - a.pricePerDay; });
  } else if (sort === "year-desc") {
    result.sort(function (a, b) { return b.year - a.year; });
  } else if (sort === "year-asc") {
    result.sort(function (a, b) { return a.year - b.year; });
  } else if (sort === "seats-desc") {
    result.sort(function (a, b) { return b.seats - a.seats; });
  }

  return result;
}






function setupBookingModalListeners() {
  pickupDate.addEventListener("change", calculateBookingTotal);
  returnDate.addEventListener("change", calculateBookingTotal);
}






function openBookingModal(carId) {
  
  selectedCar = allCars.find(function (c) { return c.id === carId; });
  if (!selectedCar) return;

  
  if (selectedCar.status !== "Available") {
    showCustomerAlert("This car is not available for booking.", "warning");
    selectedCar = null;
    return;
  }

  
  bookingCarId.value = selectedCar.id;
  bookingPricePerDay.value = selectedCar.pricePerDay;
  bookingCarName.textContent = selectedCar.name;
  bookingCarDetails.textContent =
    selectedCar.type + " | " +
    selectedCar.transmission + " | " +
    selectedCar.seats + " Seats | PKR " +
    selectedCar.pricePerDay.toLocaleString() + "/day";

  
  customerName.value = "";
  customerPhone.value = "";
  pickupDate.value = "";
  returnDate.value = "";
  bookingDays.textContent = "0 days";
  bookingTotal.textContent = "PKR 0";
  clearValidationErrors();

  
  const today = new Date().toISOString().split("T")[0];
  pickupDate.min = today;
  returnDate.min = today;

  
  const modal = new bootstrap.Modal(bookingModal);
  modal.show();
}





function calculateBookingTotal() {
  const pickup = pickupDate.value;
  const returnD = returnDate.value;
  const pricePerDay = parseInt(bookingPricePerDay.value) || 0;

  if (pickup && returnD) {
    const pickupMs = new Date(pickup).getTime();
    const returnMs = new Date(returnD).getTime();
    const diffMs = returnMs - pickupMs;
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) {
      const totalPrice = days * pricePerDay;
      bookingDays.textContent = days + (days === 1 ? " day" : " days");
      bookingTotal.textContent = "PKR " + totalPrice.toLocaleString();
    } else {
      bookingDays.textContent = "Invalid";
      bookingTotal.textContent = "PKR 0";
    }
  } else {
    bookingDays.textContent = "0 days";
    bookingTotal.textContent = "PKR 0";
  }
}









function validateBookingForm() {
  let isValid = true;
  clearValidationErrors();

  
  if (!selectedCar) {
    showCustomerAlert("No car selected. Please try again.", "danger");
    return false;
  }

  if (selectedCar.status !== "Available") {
    showCustomerAlert("This car is no longer available for booking.", "danger");
    return false;
  }

  
  const name = customerName.value.trim();
  if (!name) {
    showFieldError(customerName, "nameError", "Customer name is required.");
    isValid = false;
  } else if (name.length < 3) {
    showFieldError(customerName, "nameError", "Name must be at least 3 characters.");
    isValid = false;
  }

  
  const phone = customerPhone.value.trim();
  const phoneRegex = /^03[0-9]{9}$/;
  if (!phone) {
    showFieldError(customerPhone, "phoneError", "Phone number is required.");
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    showFieldError(customerPhone, "phoneError", "Enter a valid phone number (e.g. 03001234567).");
    isValid = false;
  }

  
  if (!pickupDate.value) {
    showFieldError(pickupDate, "pickupError", "Pickup date is required.");
    isValid = false;
  }

  
  if (!returnDate.value) {
    showFieldError(returnDate, "returnError", "Return date is required.");
    isValid = false;
  } else if (pickupDate.value && returnDate.value <= pickupDate.value) {
    showFieldError(returnDate, "returnError", "Return date must be after pickup date.");
    isValid = false;
  }

  return isValid;
}







function showFieldError(inputEl, errorId, message) {
  inputEl.classList.add("is-invalid");
  document.getElementById(errorId).textContent = message;
}




function clearValidationErrors() {
  const inputs = [customerName, customerPhone, pickupDate, returnDate];
  inputs.forEach(function (input) {
    input.classList.remove("is-invalid");
  });
}







async function createBooking(event) {
  if (event) {
    event.preventDefault();
  }

  if (!validateBookingForm()) {
    return;
  }

  if (!selectedCar) {
    showCustomerAlert("Please select a car before booking.", "danger");
    return;
  }

  const carId = bookingCarId.value;

  
  confirmBookingBtn.disabled = true;
  confirmBookingBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Booking...';

  try {
    
    const checkRes = await fetch(`${CARS_API}/${carId}`);
    
    if (!checkRes.ok) {
      throw new Error("Could not verify car availability.");
    }
    
    const liveCar = await checkRes.json();
    
    if (liveCar.status !== "Available") {
      showCustomerAlert("This car is no longer available for booking.", "danger");
      const modal = bootstrap.Modal.getInstance(bookingModal);
      if (modal) modal.hide();
      await fetchCars();
      return;
    }

    const pricePerDay = parseInt(bookingPricePerDay.value);
    const pickup = pickupDate.value;
    const returnD = returnDate.value;

    
    const pickupMs = new Date(pickup).getTime();
    const returnMs = new Date(returnD).getTime();
    const diffMs = returnMs - pickupMs;
    const totalDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (totalDays < 1) {
      showCustomerAlert("Please select valid pickup and return dates.", "danger");
      return;
    }

    const totalPrice = totalDays * pricePerDay;

    
    const bookingData = {
      carId: carId,
      customerName: customerName.value.trim(),
      customerPhone: customerPhone.value.trim(),
      pickupDate: pickup,
      returnDate: returnD,
      totalDays: totalDays,
      totalPrice: totalPrice,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0]
    };

    
    const bookingResponse = await fetch(BOOKINGS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    if (!bookingResponse.ok) {
      throw new Error("Failed to create booking.");
    }

    
    await updateCarStatus(carId, "Booked");

    
    const modal = bootstrap.Modal.getInstance(bookingModal);
    if (modal) modal.hide();

    
    customerName.value = "";
    customerPhone.value = "";
    pickupDate.value = "";
    returnDate.value = "";
    
    selectedCar = null;

    
    await fetchCars();
    showCustomerAlert("Booking created successfully. Your booking is pending admin confirmation.", "success");
    
  } catch (error) {
    showCustomerAlert(error.message || "Failed to create booking. Please try again.", "danger");
  } finally {
    confirmBookingBtn.disabled = false;
    confirmBookingBtn.innerHTML = '<i class="bi bi-check-lg me-1"></i>Confirm Booking';
  }
}






async function updateCarStatus(carId, status) {
  const response = await fetch(CARS_API + "/" + carId, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: status })
  });

  if (!response.ok) {
    throw new Error("Failed to update car status.");
  }
}








async function fetchCustomerBookings() {
  const phone = lookupPhone.value.trim();

  
  if (!phone) {
    showCustomerAlert("Please enter your phone number to look up bookings.", "warning");
    return;
  }

  bookingsList.innerHTML = "";
  hideElement(bookingsEmpty);
  showElement(bookingsLoading);

  try {
    const response = await fetch(BOOKINGS_API);

    if (!response.ok) {
      throw new Error("Failed to fetch bookings.");
    }

    const allBookings = await response.json();

    
    const customerBookings = allBookings.filter(function (b) {
      return b.customerPhone === phone;
    });

    hideElement(bookingsLoading);

    if (customerBookings.length === 0) {
      showElement(bookingsEmpty);
      return;
    }

    renderCustomerBookings(customerBookings);
  } catch (error) {
    hideElement(bookingsLoading);
    showCustomerAlert("Could not fetch bookings. Make sure JSON Server is running.", "danger");
  }
}






function renderCustomerBookings(bookings) {
  bookingsList.innerHTML = "";

  bookings.forEach(function (booking) {
    
    const car = allCars.find(function (c) { return c.id === booking.carId; });
    const carDisplayName = car ? car.name : "Unknown Car";
    const statusClass = booking.status.toLowerCase();
    const canCancel = booking.status === "Pending";

    const bookingHTML = `
      <div class="booking-card">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>${carDisplayName}</strong>
            <div class="text-muted small">Booking #${booking.id} &mdash; ${booking.customerName}</div>
          </div>
          <span class="status-badge ${statusClass}">${booking.status}</span>
        </div>
        <div class="row g-2 small text-muted">
          <div class="col-6"><strong>Phone:</strong> ${booking.customerPhone}</div>
          <div class="col-6"><strong>Booked On:</strong> ${booking.createdAt}</div>
          <div class="col-6"><strong>Pickup:</strong> ${booking.pickupDate}</div>
          <div class="col-6"><strong>Return:</strong> ${booking.returnDate}</div>
          <div class="col-6"><strong>Duration:</strong> ${booking.totalDays} day(s)</div>
          <div class="col-6"><strong>Total:</strong> PKR ${booking.totalPrice.toLocaleString()}</div>
        </div>
        ${canCancel ? `
          <div class="mt-3">
            <button class="btn btn-outline-danger btn-sm" onclick="cancelCustomerBooking('${booking.id}', '${booking.carId}')">
              <i class="bi bi-x-lg me-1"></i>Cancel Booking
            </button>
          </div>
        ` : ""}
      </div>
    `;
    bookingsList.innerHTML += bookingHTML;
  });
}







async function cancelCustomerBooking(bookingId, carId) {
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  try {
    
    const bookingRes = await fetch(BOOKINGS_API + "/" + bookingId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Cancelled" })
    });

    if (!bookingRes.ok) {
      throw new Error("Failed to cancel booking.");
    }

    
    await updateCarStatus(carId, "Available");

    
    showCustomerAlert("Booking cancelled successfully.", "success");
    await fetchCars();
    await fetchCustomerBookings();
  } catch (error) {
    showCustomerAlert(error.message || "Failed to cancel booking.", "danger");
  }
}






function showCustomerLoading() {
  showElement(carsLoading);
  hideElement(carsError);
  hideElement(carsEmpty);
}




function hideCustomerLoading() {
  hideElement(carsLoading);
}





function showEmptyState(message) {
  const emptyText = carsEmpty.querySelector("p");
  if (emptyText) {
    emptyText.textContent = message;
  }
  showElement(carsEmpty);
}






function showCustomerAlert(message, type) {
  const alertId = "alert-" + Date.now();
  const iconMap = {
    success: "bi-check-circle-fill",
    danger: "bi-exclamation-triangle-fill",
    warning: "bi-exclamation-circle-fill",
    info: "bi-info-circle-fill"
  };
  const icon = iconMap[type] || "bi-info-circle-fill";

  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show d-flex align-items-center" role="alert">
      <i class="bi ${icon} me-2"></i>
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  alertContainer.innerHTML += alertHTML;

  
  setTimeout(function () {
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
      alertEl.classList.remove("show");
      setTimeout(function () { alertEl.remove(); }, 300);
    }
  }, 5000);
}





function showElement(el) {
  el.style.display = "";
}





function hideElement(el) {
  el.style.display = "none";
}
