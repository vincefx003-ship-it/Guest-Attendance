async function searchGuest() {
  let q = document.getElementById("searchInput").value;

  let res = await fetch(API_URL + "?action=search&q=" + q);
  let data = await res.json();

  let html = "";

  data.results.forEach(g => {
    html += `
      <div>
        <h3>${g.name}</h3>
        <p>${g.phone}</p>
        <button onclick="checkIn('${g.guestId}')">Mark Present</button>
      </div>
    `;
  });

  document.getElementById("result").innerHTML = html;
}

async function checkIn(id) {
  let res = await fetch(API_URL + "?action=checkin&guestId=" + id);
  let data = await res.json();
  alert(data.message);
}

async function loadDashboard() {
  let res = await fetch(API_URL + "?action=dashboard");
  let data = await res.json();

  document.getElementById("dashboard").innerHTML = `
    <p>Total Guests: ${data.totalGuests}</p>
    <p>Present Today: ${data.presentToday}</p>
    <p>Event: ${data.event.eventName}</p>
  `;
}

loadDashboard();
