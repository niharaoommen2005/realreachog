let donations = [];
let filteredDonations = [];

const donationList = document.getElementById('donation-list');

async function fetchDonations() {
  try {
    const res = await fetch('http://localhost:4000/donations');
    donations = await res.json();

    donations = donations.map(d => ({
      itemName: d.itemName || 'Unnamed Item',
      category: d.category || 'Other',
      description: d.description || '',
      phone: d.phone || '',
      image: d.image || ''
    }));

    filteredDonations = donations;
    renderDonations(filteredDonations);
  } catch (err) {
    console.error(err);
  }
}

function renderDonations(items) {
  donationList.innerHTML = '';
  items.forEach(donation => {
    const div = document.createElement('div');
    div.classList.add('donation-item');

    const imageUrl = donation.image
      ? `http://localhost:4000/uploads/${donation.image}`
      : 'https://via.placeholder.com/120';

    div.innerHTML = `
      <div class="donation-text">
        <p><strong>Item Name:</strong> ${donation.itemName}</p>
        <p><strong>Category:</strong> ${donation.category}</p>
        <p><strong>Description:</strong></p>
        <div class="description-box">${donation.description}</div>
        <p><strong>Phone:</strong> <span class="phone-hidden">Hidden</span></p>
        <button onclick="revealPhone(this, '${donation.phone}')">Chat</button>
      </div>
      <img src="${imageUrl}" alt="${donation.itemName}">
    `;

    donationList.appendChild(div);
  });
}

function filterDonations(category) {
  if (category === 'All') {
    filteredDonations = donations;
  } else {
    filteredDonations = donations.filter(d => d.category === category);
  }
  renderDonations(filteredDonations);
}

function revealPhone(button, phone) {
  const phoneElem = button.parentElement.querySelector('.phone-hidden');
  phoneElem.textContent = phone;
}

// Initial fetch
fetchDonations();
