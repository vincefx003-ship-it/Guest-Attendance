async function searchGuest() {
  const q = document.getElementById("searchInput").value;

  const res = await fetch(`${API_URL}?action=search&q=${q}`);
  const data = await res.json();

  const popup = document.getElementById("popup");

  // IF FOUND → CHECK-IN POPUP
  if (data.found) {
    const g = data.found;

    popup.innerHTML = `
      <div class="modal">
        <h2>Guest Found</h2>
        <p>${g.name} (${g.phone})</p>
        <button onclick="checkIn('${g.guestId}')">Check In</button>
      </div>
    `;
  }

  // IF NOT FOUND → REGISTER POPUP
  else {
    popup.innerHTML = `
      <div class="modal">
        <h2>Guest Not Found</h2>

        <input id="regName" placeholder="Name">
        <input id="regPhone" placeholder="Phone">

        <button onclick="registerGuest()">Register & Check In</button>
      </div>
    `;
  }
}

// CHECK IN EXISTING
async function checkIn(id) {
  const res = await fetch(`${API_URL}?action=checkin&id=${id}`, {
    method: "POST"
  });

  const data = await res.json();
  alert(data.message);
  location.reload();
}

// REGISTER NEW + MARK PRESENT
async function registerGuest() {
  const name = document.getElementById("regName").value;
  const phone = document.getElementById("regPhone").value;

  const res = await fetch(`${API_URL}?action=register`, {
    method: "POST",
    body: new URLSearchParams({ name, phone })
  });

  const data = await res.json();
  alert(data.message);
  location.reload();
}
