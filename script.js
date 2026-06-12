async function searchGuest() {
  const q = document.getElementById("searchInput").value.trim();
  const popup = document.getElementById("popup");

  if (!q) {
    popup.innerHTML = `<div class="modal"><p>Please enter a name, ID, or phone</p></div>`;
    return;
  }

  try {
    const res = await fetch(`${API_URL}?action=search&q=${encodeURIComponent(q)}`);
    const data = await res.json();

    if (data.success && data.found) {
      const g = data.found;

      popup.innerHTML = `
        <div class="modal">
          <h2>Guest Found</h2>
          <p><strong>${g.name}</strong></p>
          <p>${g.phone}</p>
          <p>Status: ${g.status}</p>

          <button onclick="checkIn('${g.guestId}')">
            Check In
          </button>

          <button onclick="closePopup()">
            Close
          </button>
        </div>
      `;
    } else {
      popup.innerHTML = `
        <div class="modal">
          <h2>Guest Not Found</h2>

          <input id="regName" placeholder="Full Name">
          <input id="regPhone" placeholder="Phone Number">

          <button onclick="registerGuest()">
            Register & Check In
          </button>

          <button onclick="closePopup()">
            Cancel
          </button>
        </div>
      `;
    }

  } catch (error) {
    console.error(error);
    popup.innerHTML = `<div class="modal"><p>Error connecting to server</p></div>`;
  }
}


/* =========================
   CHECK IN EXISTING GUEST
========================= */
async function checkIn(id) {
  try {
    const res = await fetch(`${API_URL}?action=checkin&id=${id}`, {
      method: "POST"
    });

    const data = await res.json();

    alert(data.message);

    // refresh search instead of full reload
    searchGuest();

  } catch (error) {
    console.error(error);
    alert("Check-in failed");
  }
}


/* =========================
   REGISTER NEW GUEST
========================= */
async function registerGuest() {
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();

  if (!name || !phone) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${API_URL}?action=register`, {
      method: "POST",
      body: new URLSearchParams({ name, phone })
    });

    const data = await res.json();

    alert(data.message);

    // optional: re-run search or close popup
    closePopup();

  } catch (error) {
    console.error(error);
    alert("Registration failed");
  }
}


/* =========================
   CLOSE POPUP
========================= */
function closePopup() {
  document.getElementById("popup").innerHTML = "";
}
