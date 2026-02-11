document.addEventListener("DOMContentLoaded", () => {

    const bookingForm = document.getElementById("bookingForm");
    const message = document.getElementById("message");
    const popup = document.getElementById("bookingPopup");
    const closePopupBtn = document.getElementById("closePopup");

    // Payment Elements
    const paymentModal = document.getElementById("paymentModal");
    const closePaymentBtn = document.getElementById("closePayment");
    const confirmPaymentBtn = document.getElementById("confirmPayment");
    const paymentAmountEl = document.getElementById("payment-amount");
    const orderIdEl = document.getElementById("order-id");
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    // Room Prices
    const roomPrices = {
        "Deluxe Room": 2500,
        "Premium Room": 4000,
        "Suite Room": 6000
    };

    // State to hold booking data before payment
    let pendingBookingData = null;

    // 1. Reusable Room Selection Function
    function prefillRoom() {
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        if (roomParam) {
            const roomSelect = document.getElementById('room');
            const decodedRoom = decodeURIComponent(roomParam);

            for (let i = 0; i < roomSelect.options.length; i++) {
                if (roomSelect.options[i].value === decodedRoom) {
                    roomSelect.selectedIndex = i;
                    // Force the value to stick
                    roomSelect.value = decodedRoom;
                    break;
                }
            }
        }
    }

    // Call on Load
    prefillRoom();

    // 2. Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            // Add to current
            tab.classList.add("active");
            document.getElementById(tab.dataset.target).classList.add("active");
        });
    });

    // 3. Form Submission -> Show Payment Modal
    bookingForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Collect Values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const guests = document.getElementById("guests").value;
        const checkin = document.getElementById("checkin").value;
        const checkout = document.getElementById("checkout").value;
        const room = document.getElementById("room").value;
        const requests = document.getElementById("requests").value.trim();

        // Basic Validation
        if (!name || !email || !phone || !checkin || !checkout || !room) {
            message.style.color = "red";
            message.innerText = "Please fill all required fields.";
            return;
        }

        // Calculate Price
        const startDate = new Date(checkin);
        const endDate = new Date(checkout);
        const timeDiff = endDate - startDate;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            message.style.color = "red";
            message.innerText = "Check-out must be after check-in.";
            return;
        }

        const pricePerNight = roomPrices[room] || 0;
        const totalPrice = days * pricePerNight;

        // Store Data for Payment Step
        pendingBookingData = {
            name, email, phone, guests, checkin, checkout, room, requests,
            totalPrice, days
        };

        // Open Payment Modal
        paymentAmountEl.innerText = "₹" + totalPrice.toLocaleString('en-IN');
        orderIdEl.innerText = Math.floor(Math.random() * 1000000);
        paymentModal.classList.add("active");
        message.innerText = "";
    });

    // 4. Confirm Payment -> Call API -> Show Success
    confirmPaymentBtn.addEventListener("click", async () => {
        if (!pendingBookingData) return;

        confirmPaymentBtn.innerText = "Processing...";
        confirmPaymentBtn.disabled = true;

        try {
            // Simulate Payment Delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call API
            const response = await fetch(
                "https://jn442qrdmg.execute-api.us-east-1.amazonaws.com/book",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(pendingBookingData)
                }
            );

            // Hide Payment Modal
            paymentModal.classList.remove("active");
            confirmPaymentBtn.innerText = "Pay Now";
            confirmPaymentBtn.disabled = false;

            // Populate Success Popup
            // Format Date Helper
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            };
            const prettyCheckin = formatDate(pendingBookingData.checkin);
            const prettyCheckout = formatDate(pendingBookingData.checkout);
            const year = new Date(pendingBookingData.checkin).getFullYear();

            // Populate Success Popup
            const txnId = "TXN" + Math.floor(Math.random() * 10000000000);
            document.getElementById("popup-txid").innerText = txnId;
            document.getElementById("popup-name").innerText = pendingBookingData.name;
            // Shorter Room Text
            document.getElementById("popup-room").innerText = pendingBookingData.room;
            // Cleaner Date Text
            document.getElementById("popup-dates").innerText = `${prettyCheckin} - ${prettyCheckout}, ${year}`;
            document.getElementById("popup-price").innerText = "₹" + pendingBookingData.totalPrice.toLocaleString('en-IN');

            // Show Success Popup
            popup.classList.add("active");

        } catch (err) {
            console.error(err);
            paymentModal.classList.remove("active");
            confirmPaymentBtn.innerText = "Pay Now";
            confirmPaymentBtn.disabled = false;

            message.style.color = "red";
            message.innerText = "Payment Failed. Please try again.";
        }
    });

    // Close Handlers
    closePaymentBtn.addEventListener("click", () => {
        paymentModal.classList.remove("active");
    });

    closePopupBtn.addEventListener("click", () => {
        popup.classList.remove("active");

        // Reset form
        bookingForm.reset();
        message.innerText = "";

        // CRITICAL: Re-apply room selection immediately
        setTimeout(prefillRoom, 50);
    });
});
