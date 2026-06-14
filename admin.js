const API_BASE_URL = "http://127.0.0.1:3000";
const CARS_API = `${API_BASE_URL}/cars`;
const BOOKINGS_API = `${API_BASE_URL}/bookings`;


let cars = [];
let bookings = [];
let editingCarId = null;


let confirmDeleteAction = null;


const alertContainer = document.getElementById("alertContainer");


const adminStatTotalCars = document.getElementById("adminStatTotalCars");
const adminStatAvailable = document.getElementById("adminStatAvailable");
const adminStatBooked = document.getElementById("adminStatBooked");
const adminStatMaintenance = document.getElementById("adminStatMaintenance");
const adminStatBookings = document.getElementById("adminStatBookings");
const adminStatPending = document.getElementById("adminStatPending");
const adminStatConfirmed = document.getElementById("adminStatConfirmed");
const adminStatCompleted = document.getElementById("adminStatCompleted");
const adminStatCancelled = document.getElementById("adminStatCancelled");
const adminStatRevenue = document.getElementById("adminStatRevenue");


const carForm = document.getElementById("carForm");
const carFormTitle = document.getElementById("carFormTitle");
const carFormSubmitBtn = document.getElementById("carFormSubmitBtn");
const carFormCancelBtn = document.getElementById("carFormCancelBtn");
const carEditId = document.getElementById("carEditId");
const carName = document.getElementById("carName");
const carBrand = document.getElementById("carBrand");
const carModel = document.getElementById("carModel");
const carYear = document.getElementById("carYear");
const carType = document.getElementById("carType");
const carFuel = document.getElementById("carFuel");
const carTransmission = document.getElementById("carTransmission");
const carSeats = document.getElementById("carSeats");
const carPrice = document.getElementById("carPrice");
const carStatus = document.getElementById("carStatus");
const carImage = document.getElementById("carImage");
const carDescription = document.getElementById("carDescription");


const adminCarsLoading = document.getElementById("adminCarsLoading");
const adminCarsError = document.getElementById("adminCarsError");
const adminCarsErrorMsg = document.getElementById("adminCarsErrorMsg");
const adminCarsEmpty = document.getElementById("adminCarsEmpty");
const adminCarsTable = document.getElementById("adminCarsTable");
const carsTableBody = document.getElementById("carsTableBody");
const adminCarSearch = document.getElementById("adminCarSearch");
const adminCarFilterStatus = document.getElementById("adminCarFilterStatus");
const adminCarFilterType = document.getElementById("adminCarFilterType");
const adminCarFilterTransmission = document.getElementById("adminCarFilterTransmission");


const adminBookingsLoading = document.getElementById("adminBookingsLoading");
const adminBookingsError = document.getElementById("adminBookingsError");
const adminBookingsErrorMsg = document.getElementById("adminBookingsErrorMsg");
const adminBookingsEmpty = document.getElementById("adminBookingsEmpty");
const adminBookingsTable = document.getElementById("adminBookingsTable");
const bookingsTableBody = document.getElementById("bookingsTableBody");
const adminBookingSearch = document.getElementById("adminBookingSearch");
const adminBookingFilterStatus = document.getElementById("adminBookingFilterStatus");


const deleteModal = document.getElementById("deleteModal");
const deleteModalMessage = document.getElementById("deleteModalMessage");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");


document.addEventListener("DOMContentLoaded", function () {
  initAdminApp();
});




async function initAdminApp() {
  setupEventListeners();
  await fetchCars();
  await fetchBookings();
}




function setupEventListeners() {

  carForm.addEventListener("submit", handleCarFormSubmit);


  adminCarSearch.addEventListener("input", function () { renderCarsTable(getFilteredCars()); });
  adminCarFilterStatus.addEventListener("change", function () { renderCarsTable(getFilteredCars()); });
  adminCarFilterType.addEventListener("change", function () { renderCarsTable(getFilteredCars()); });
  adminCarFilterTransmission.addEventListener("change", function () { renderCarsTable(getFilteredCars()); });


  adminBookingSearch.addEventListener("input", function () { renderBookingsTable(getFilteredBookings()); });
  adminBookingFilterStatus.addEventListener("change", function () { renderBookingsTable(getFilteredBookings()); });


  confirmDeleteBtn.addEventListener("click", function () {
    if (confirmDeleteAction) {
      confirmDeleteAction();
      confirmDeleteAction = null;
    }
    const modal = bootstrap.Modal.getInstance(deleteModal);
    modal.hide();
  });
}






async function fetchCars() {
  showAdminLoading(adminCarsLoading, adminCarsTable, adminCarsError, adminCarsEmpty);

  try {
    const response = await fetch(CARS_API);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    cars = await response.json();
    renderAdminStats();
    renderCarsTable(getFilteredCars());
  } catch (error) {
    hideAdminLoading(adminCarsLoading);
    showElement(adminCarsError);
    adminCarsErrorMsg.textContent = "Could not connect to JSON Server. Please run: npx json-server --watch db.json";
  }
}




async function fetchBookings() {
  showAdminLoading(adminBookingsLoading, adminBookingsTable, adminBookingsError, adminBookingsEmpty);

  try {
    const response = await fetch(BOOKINGS_API);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    bookings = await response.json();
    renderAdminStats();
    renderBookingsTable(getFilteredBookings());
  } catch (error) {
    hideAdminLoading(adminBookingsLoading);
    showElement(adminBookingsError);
    adminBookingsErrorMsg.textContent = "Could not connect to JSON Server. Please run: npx json-server --watch db.json";
  }
}






function renderAdminStats() {

  adminStatTotalCars.textContent = cars.length;
  adminStatAvailable.textContent = cars.filter(function (c) { return c.status === "Available"; }).length;
  adminStatBooked.textContent = cars.filter(function (c) { return c.status === "Booked"; }).length;
  adminStatMaintenance.textContent = cars.filter(function (c) { return c.status === "Maintenance"; }).length;


  adminStatBookings.textContent = bookings.length;
  adminStatPending.textContent = bookings.filter(function (b) { return b.status === "Pending"; }).length;
  adminStatConfirmed.textContent = bookings.filter(function (b) { return b.status === "Confirmed"; }).length;
  adminStatCompleted.textContent = bookings.filter(function (b) { return b.status === "Completed"; }).length;
  adminStatCancelled.textContent = bookings.filter(function (b) { return b.status === "Cancelled"; }).length;


  const revenue = bookings
    .filter(function (b) { return b.status === "Completed"; })
    .reduce(function (sum, b) { return sum + Number(b.totalPrice); }, 0);

  adminStatRevenue.textContent = revenue.toLocaleString();
}







function getFilteredCars() {
  const query = adminCarSearch.value.toLowerCase().trim();
  const status = adminCarFilterStatus.value;
  const type = adminCarFilterType.value;
  const transmission = adminCarFilterTransmission.value;

  return cars.filter(function (car) {
    const matchesSearch = !query ||
      car.name.toLowerCase().includes(query) ||
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.type.toLowerCase().includes(query) ||
      car.fuel.toLowerCase().includes(query) ||
      car.transmission.toLowerCase().includes(query) ||
      car.status.toLowerCase().includes(query);

    const matchesStatus = !status || car.status === status;
    const matchesType = !type || car.type === type;
    const matchesTransmission = !transmission || car.transmission === transmission;

    return matchesSearch && matchesStatus && matchesType && matchesTransmission;
  });
}





function renderCarsTable(filteredCars) {
  carsTableBody.innerHTML = "";
  hideAdminLoading(adminCarsLoading);

  if (filteredCars.length === 0) {
    showElement(adminCarsEmpty);
    hideElement(adminCarsTable);
    return;
  }

  hideElement(adminCarsEmpty);
  showElement(adminCarsTable);

  filteredCars.forEach(function (car) {
    const badgeClass = getStatusBadge(car.status);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <img src="${car.image}" alt="${car.name}" class="rounded" style="width: 60px; height: 40px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/60x40?text=No+Img'">
      </td>
      <td><strong>${car.name}</strong></td>
      <td>${car.brand} / ${car.model}</td>
      <td>${car.year}</td>
      <td>${car.type}</td>
      <td>${car.fuel}</td>
      <td>${car.transmission}</td>
      <td>${car.seats}</td>
      <td>PKR ${Number(car.pricePerDay).toLocaleString()}</td>
      <td>
        <select class="form-select form-select-sm" style="width: 120px;" onchange="updateCarStatus('${car.id}', this.value)">
          <option value="Available" ${car.status === "Available" ? "selected" : ""}>Available</option>
          <option value="Booked" ${car.status === "Booked" ? "selected" : ""}>Booked</option>
          <option value="Maintenance" ${car.status === "Maintenance" ? "selected" : ""}>Maintenance</option>
        </select>
      </td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-outline-primary btn-sm" onclick="startEditCar('${car.id}')" title="Edit">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteCar('${car.id}')" title="Delete">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    carsTableBody.appendChild(tr);
  });
}





function validateCarForm() {
  let isValid = true;
  const currentYear = new Date().getFullYear();


  const inputs = carForm.querySelectorAll(".form-control, .form-select");
  inputs.forEach(function (input) { input.classList.remove("is-invalid"); });

  if (carName.value.trim().length < 3) { carName.classList.add("is-invalid"); isValid = false; }
  if (!carBrand.value.trim()) { carBrand.classList.add("is-invalid"); isValid = false; }
  if (!carModel.value.trim()) { carModel.classList.add("is-invalid"); isValid = false; }

  const year = parseInt(carYear.value);
  if (!year || year < 2000 || year > currentYear) { carYear.classList.add("is-invalid"); isValid = false; }

  if (!carType.value) { carType.classList.add("is-invalid"); isValid = false; }
  if (!carFuel.value) { carFuel.classList.add("is-invalid"); isValid = false; }
  if (!carTransmission.value) { carTransmission.classList.add("is-invalid"); isValid = false; }

  const seats = parseInt(carSeats.value);
  if (!seats || seats <= 0) { carSeats.classList.add("is-invalid"); isValid = false; }

  const price = parseInt(carPrice.value);
  if (!price || price <= 0) { carPrice.classList.add("is-invalid"); isValid = false; }

  if (!carStatus.value) { carStatus.classList.add("is-invalid"); isValid = false; }
  if (!carImage.value.trim()) { carImage.classList.add("is-invalid"); isValid = false; }

  if (carDescription.value.trim().length < 10) { carDescription.classList.add("is-invalid"); isValid = false; }

  if (!isValid) {
    showAdminAlert("Please correct the highlighted form errors.", "danger");
  }

  return isValid;
}





function getCarFormData() {
  return {
    name: carName.value.trim(),
    brand: carBrand.value.trim(),
    model: carModel.value.trim(),
    year: parseInt(carYear.value),
    type: carType.value,
    fuel: carFuel.value,
    transmission: carTransmission.value,
    seats: parseInt(carSeats.value),
    pricePerDay: parseInt(carPrice.value),
    status: carStatus.value,
    image: carImage.value.trim(),
    description: carDescription.value.trim()
  };
}




function resetCarForm() {
  carForm.reset();
  editingCarId = null;
  carFormTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Add New Car';
  carFormSubmitBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Add Car';
  hideElement(carFormCancelBtn);


  const inputs = carForm.querySelectorAll(".form-control, .form-select");
  inputs.forEach(function (input) { input.classList.remove("is-invalid"); });
}





async function handleCarFormSubmit(event) {
  event.preventDefault();

  if (!validateCarForm()) return;

  const carData = getCarFormData();

  if (editingCarId) {
    await updateCar(editingCarId, carData);
  } else {
    await addCar(carData);
  }
}





async function addCar(carData) {
  carFormSubmitBtn.disabled = true;
  carFormSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Adding...';

  try {
    const response = await fetch(CARS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      throw new Error("Failed to add car.");
    }

    showAdminAlert("Car added successfully.", "success");
    resetCarForm();
    await fetchCars();
  } catch (error) {
    showAdminAlert(error.message, "danger");
  } finally {
    carFormSubmitBtn.disabled = false;
    carFormSubmitBtn.innerHTML = '<i class="bi bi-plus-lg me-1"></i>Add Car';
  }
}





function startEditCar(carId) {
  const car = getCarById(carId);
  if (!car) return;

  editingCarId = car.id;

  carEditId.value = car.id;
  carName.value = car.name;
  carBrand.value = car.brand;
  carModel.value = car.model;
  carYear.value = car.year;
  carType.value = car.type;
  carFuel.value = car.fuel;
  carTransmission.value = car.transmission;
  carSeats.value = car.seats;
  carPrice.value = car.pricePerDay;
  carStatus.value = car.status;
  carImage.value = car.image;
  carDescription.value = car.description;

  carFormTitle.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Edit Car';
  carFormSubmitBtn.innerHTML = '<i class="bi bi-save me-1"></i>Update Car';
  showElement(carFormCancelBtn);


  document.getElementById("carFormSection").scrollIntoView({ behavior: "smooth" });
}






async function updateCar(carId, carData) {
  carFormSubmitBtn.disabled = true;
  carFormSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Updating...';

  try {
    const response = await fetch(CARS_API + "/" + carId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      throw new Error("Failed to update car.");
    }

    showAdminAlert("Car updated successfully.", "success");
    resetCarForm();
    await fetchCars();
  } catch (error) {
    showAdminAlert(error.message, "danger");
  } finally {
    carFormSubmitBtn.disabled = false;
    carFormSubmitBtn.innerHTML = '<i class="bi bi-save me-1"></i>Update Car';
  }
}







async function updateCarStatus(carId, newStatus) {
  const car = getCarById(carId);
  if (!car) return;



  const activeBooking = bookings.find(function (b) {
    return String(b.carId) === String(carId) && (b.status === "Pending" || b.status === "Confirmed");
  });

  if (activeBooking && (newStatus === "Available" || newStatus === "Maintenance")) {
    showAdminAlert("This car has an active booking. Complete or cancel the booking first.", "danger");
    renderCarsTable(getFilteredCars());
    return;
  }

  try {
    const response = await fetch(CARS_API + "/" + carId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (!response.ok) {
      throw new Error("Failed to update car status.");
    }

    showAdminAlert("Car status updated successfully.", "success");
    await fetchCars();
  } catch (error) {
    showAdminAlert(error.message, "danger");
    renderCarsTable(getFilteredCars());
  }
}






function confirmDeleteCar(carId) {

  const hasActiveBooking = bookings.some(function (b) {
    return String(b.carId) === String(carId) && (b.status === "Pending" || b.status === "Confirmed");
  });

  if (hasActiveBooking) {
    showAdminAlert("Cannot delete this car because it has active bookings.", "danger");
    return;
  }

  deleteModalMessage.textContent = "Are you sure you want to delete this car?";
  confirmDeleteAction = function () { deleteCar(carId); };

  const modal = new bootstrap.Modal(deleteModal);
  modal.show();
}





async function deleteCar(carId) {
  try {
    const response = await fetch(CARS_API + "/" + carId, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete car.");
    }

    showAdminAlert("Car deleted successfully.", "success");
    await fetchCars();
  } catch (error) {
    showAdminAlert(error.message, "danger");
  }
}







function getFilteredBookings() {
  const query = adminBookingSearch.value.toLowerCase().trim();
  const status = adminBookingFilterStatus.value;

  return bookings.filter(function (booking) {

    const car = getCarById(booking.carId);
    const carName = car ? car.name.toLowerCase() : "";

    const matchesSearch = !query ||
      booking.customerName.toLowerCase().includes(query) ||
      booking.customerPhone.includes(query) ||
      String(booking.id).includes(query) ||
      carName.includes(query) ||
      booking.status.toLowerCase().includes(query);

    const matchesStatus = !status || booking.status === status;

    return matchesSearch && matchesStatus;
  });
}





function renderBookingsTable(filteredBookings) {
  bookingsTableBody.innerHTML = "";
  hideAdminLoading(adminBookingsLoading);

  if (filteredBookings.length === 0) {
    showElement(adminBookingsEmpty);
    hideElement(adminBookingsTable);
    return;
  }

  hideElement(adminBookingsEmpty);
  showElement(adminBookingsTable);

  filteredBookings.forEach(function (booking) {
    const car = getCarById(booking.carId);
    const carName = car ? car.name : "Car not found";
    const badgeClass = getStatusBadge(booking.status);


    let actionButtons = "";

    if (booking.status === "Pending") {
      actionButtons += `
        <button class="btn btn-primary btn-sm" onclick="updateBookingStatus('${booking.id}', 'Confirmed', '${booking.carId}')" title="Confirm">
          <i class="bi bi-check-lg"></i>
        </button>
        <button class="btn btn-warning btn-sm" onclick="updateBookingStatus('${booking.id}', 'Cancelled', '${booking.carId}')" title="Cancel">
          <i class="bi bi-x-lg"></i>
        </button>
      `;
    } else if (booking.status === "Confirmed") {
      actionButtons += `
        <button class="btn btn-success btn-sm" onclick="updateBookingStatus('${booking.id}', 'Completed', '${booking.carId}')" title="Complete">
          <i class="bi bi-check-all"></i>
        </button>
        <button class="btn btn-warning btn-sm" onclick="updateBookingStatus('${booking.id}', 'Cancelled', '${booking.carId}')" title="Cancel">
          <i class="bi bi-x-lg"></i>
        </button>
      `;
    }

    actionButtons += `
      <button class="btn btn-danger btn-sm" onclick="confirmDeleteBooking('${booking.id}', '${booking.carId}', '${booking.status}')" title="Delete">
        <i class="bi bi-trash"></i>
      </button>
    `;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${booking.id}</td>
      <td>${booking.customerName}</td>
      <td>${booking.customerPhone}</td>
      <td><strong>${carName}</strong></td>
      <td>${booking.pickupDate}</td>
      <td>${booking.returnDate}</td>
      <td>${booking.totalDays}</td>
      <td>PKR ${Number(booking.totalPrice).toLocaleString()}</td>
      <td><span class="status-badge ${badgeClass}">${booking.status}</span></td>
      <td><div class="d-flex gap-1">${actionButtons}</div></td>
    `;
    bookingsTableBody.appendChild(tr);
  });
}







async function updateBookingStatus(bookingId, newStatus, carId) {
  try {

    const bookingResponse = await fetch(BOOKINGS_API + "/" + bookingId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (!bookingResponse.ok) {
      throw new Error("Failed to update booking status.");
    }


    if (newStatus === "Completed" || newStatus === "Cancelled") {
      const carResponse = await fetch(CARS_API + "/" + carId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Available" })
      });

      if (!carResponse.ok) {
        throw new Error("Booking updated, but related car status could not be updated.");
      }
    }

    showAdminAlert("Booking status updated successfully.", "success");
    await fetchCars();
    await fetchBookings();
  } catch (error) {
    showAdminAlert(error.message, "danger");
  }
}







function confirmDeleteBooking(bookingId, carId, bookingStatus) {
  deleteModalMessage.textContent = "Are you sure you want to delete this booking?";
  confirmDeleteAction = function () { deleteBooking(bookingId, carId, bookingStatus); };

  const modal = new bootstrap.Modal(deleteModal);
  modal.show();
}








async function deleteBooking(bookingId, carId, bookingStatus) {
  try {

    if (bookingStatus === "Pending" || bookingStatus === "Confirmed") {
      const carResponse = await fetch(CARS_API + "/" + carId, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Available" })
      });

      if (!carResponse.ok) {
        throw new Error("Related car status could not be updated before deleting booking.");
      }
    }


    const response = await fetch(BOOKINGS_API + "/" + bookingId, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete booking.");
    }

    showAdminAlert("Booking deleted successfully.", "success");
    await fetchCars();
    await fetchBookings();
  } catch (error) {
    showAdminAlert(error.message, "danger");
  }
}








function getCarById(carId) {
  return cars.find(function (c) { return String(c.id) === String(carId); });
}






function getStatusBadge(status) {
  const s = status.toLowerCase();
  if (s === "available" || s === "completed") return "success";
  if (s === "booked" || s === "pending") return "warning";
  if (s === "maintenance" || s === "cancelled") return "danger";
  if (s === "confirmed") return "primary";
  return "secondary";
}




function showAdminLoading(loadingEl, tableEl, errorEl, emptyEl) {
  showElement(loadingEl);
  hideElement(tableEl);
  hideElement(errorEl);
  hideElement(emptyEl);
}




function hideAdminLoading(loadingEl) {
  hideElement(loadingEl);
}






function showAdminAlert(message, type) {
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
  if (el) el.style.display = "";
}





function hideElement(el) {
  if (el) el.style.display = "none";
}
