form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const locationInput = document.getElementById('location').value;

  // Geocode using OpenStreetMap Nominatim
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`);
  const data = await response.json();

  if (data.length === 0) {
    alert('Location not found');
    return;
  }

  // Fill hidden latitude and longitude
  const lat = data[0].lat;
  const lon = data[0].lon;
  document.getElementById('Latitude').value = lat;
  document.getElementById('Longitude').value = lon;

  // Prepare job data
  const formData = new FormData(form);
  const newJob = Object.fromEntries(formData.entries());

  // Send to backend
  fetch('http://localhost:3000/add-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJob)
  })
  .then(res => res.json())
  .then(job => {
    addJobToList(job);
    form.reset();
    alert('Job added successfully!');
  })
  .catch(err => console.error(err));
});
