// Initialize map (India view)
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// Show user's location (red pin only, no popup)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "leaflet-div-icon custom-red-pin",
        html: "📍",
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      })
    }).addTo(map);
  });
}

// Fetch jobs from backend and show as blue pins with HOVER popup + Volunteer button
fetch("http://localhost:3000/jobs")
  .then(res => res.json())
  .then(data => {
    data.forEach(job => {
      const lat = parseFloat(job.Latitude);
      const lng = parseFloat(job.Longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const marker = L.marker([lat, lng], {
        riseOnHover: true,
        icon: L.divIcon({
          className: "leaflet-div-icon custom-blue-pin",
          html: "🔵",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);

      // Build popup content (with Volunteer button)
      const popupDiv = document.createElement("div");
      popupDiv.innerHTML = `
        <div class="popup-card" style="min-width:200px;">
          <b>${job.JobTitle || "Untitled"}</b><br>
          ${job.Company || ""}<br>
          ${job.Type || ""}<br>
          <small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small><br>
        </div>
      `;
      const btn = document.createElement("button");
      btn.textContent = "Volunteer";
      btn.style.marginTop = "6px";
      btn.onclick = () => {
        alert(`You volunteered for ${job.JobTitle || "this posting"}`);
        // TODO: later send to backend / add to profile
      };
      popupDiv.appendChild(btn);

      marker.bindPopup(popupDiv, { autoPan: true, closeButton: true });

      // --- Hover behavior: open on mouseover, keep open when hovering popup ---
      let closeTimer = null;

      const scheduleClose = () => {
        closeTimer = setTimeout(() => marker.closePopup(), 250);
      };
      const cancelClose = () => {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      };

      marker.on("mouseover", () => {
        cancelClose();
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        scheduleClose();
      });

      marker.on("click", () => {
        cancelClose();
        marker.openPopup();
      });

      marker.on("popupopen", (e) => {
        const el = e.popup.getElement();
        el.addEventListener("mouseenter", cancelClose);
        el.addEventListener("mouseleave", scheduleClose);
      });
    });
  })
  .catch(err => console.error("Error loading jobs:", err));

// City card click zoom
document.querySelectorAll(".city-card").forEach(card => {
  card.addEventListener("click", () => {
    const lat = parseFloat(card.getAttribute("data-lat"));
    const lng = parseFloat(card.getAttribute("data-lng"));
    const zoom = parseInt(card.getAttribute("data-zoom")) || 12;
    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 2
    });
  });
});
