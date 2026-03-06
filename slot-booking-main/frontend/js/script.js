const AUTH_KEY = "slotBookingUser";
const PUBLIC_PAGES = ["/login.html", "/register.html"];

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function getPathname() {
    let path = window.location.pathname;
    if (path === "/") return "/index.html";

    // Normalize path by removing trailing slashes
    if (path.endsWith('/')) path = path.slice(0, -1);

    // Append .html if missing (useful for Netlify pretty URLs)
    if (!path.endsWith('.html')) path += '.html';

    return path;
}

function getCurrentUser() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(AUTH_KEY);
}

function requireAuth() {
    const path = getPathname();
    const isPublic = PUBLIC_PAGES.includes(path);
    const user = getCurrentUser();

    if (!user && !isPublic) {
        window.location.replace("/login.html");
        return null;
    }

    if (user && isPublic) {
        window.location.replace("/");
        return null;
    }

    return user;
}

function setupLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (event) => {
        event.preventDefault();
        clearCurrentUser();
        window.location.href = "/login.html";
    });
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || data.detail || "Something went wrong");
    }
    return data;
}

function toDate(value) {
    return new Date(value);
}

function formatTime(value) {
    return toDate(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatLongDate(value) {
    return toDate(value).toLocaleDateString([], {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatDateTime(value) {
    return toDate(value).toLocaleString();
}

function buildSlotCard(slot, isBooked) {
    const safeId = Number(slot.id || 0);
    const time = formatTime(slot.slot_time);
    const date = formatLongDate(slot.slot_time);
    const badgeClass = isBooked ? "booked" : "available";
    const badgeText = isBooked ? "Booked" : "Available";
    const actionClass = isBooked ? "btn-danger booked-btn" : "";
    const actionText = isBooked ? "Booked" : "Book Now";
    const actionHtml = isBooked
        ? `<button class="btn slot-action ${actionClass}" disabled>${actionText}</button>`
        : `<a class="btn slot-action ${actionClass}" href="/book.html?slot_id=${safeId}">${actionText}</a>`;

    return `
        <article class="slot-card">
            <h3 class="slot-time">${escapeHtml(time)}</h3>
            <p class="slot-date">${escapeHtml(date)}</p>
            <span class="badge ${badgeClass}">${badgeText}</span>
            ${actionHtml}
        </article>
    `;
}

async function loadSlotsList() {
    const slotsGrid = document.getElementById("slotsGrid");
    if (!slotsGrid) return;

    try {
        const [availableSlots, bookedSlots] = await Promise.all([
            fetchJson("/api/slots"),
            fetchJson("/api/bookings"),
        ]);

        const available = (availableSlots || []).map((slot) => ({
            id: slot.id,
            slot_time: slot.slot_time,
            is_booked: false,
        }));

        const booked = (bookedSlots || []).map((booking) => ({
            id: booking.id,
            slot_time: booking.slot_time,
            is_booked: true,
        }));

        const combined = [...booked, ...available].sort(
            (a, b) => toDate(a.slot_time) - toDate(b.slot_time)
        );

        if (!combined.length) {
            slotsGrid.innerHTML = '<div class="slot-card empty">No slots found.</div>';
            return;
        }

        slotsGrid.innerHTML = combined
            .map((slot) => buildSlotCard(slot, slot.is_booked))
            .join("");
    } catch (error) {
        slotsGrid.innerHTML = `<div class="slot-card empty">${escapeHtml(
            error.message
        )}</div>`;
    }
}

function setPreselectedSlot() {
    const slotSelect = document.getElementById("slot");
    if (!slotSelect) return;

    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("slot_id");
    if (!selectedId) return;

    const option = slotSelect.querySelector(`option[value="${selectedId}"]`);
    if (option) {
        slotSelect.value = selectedId;
    }
}

function populateBookingUser(user) {
    const nameNode = document.getElementById("bookingUserName");
    const emailNode = document.getElementById("bookingUserEmail");
    if (nameNode) nameNode.textContent = user?.name || "-";
    if (emailNode) emailNode.textContent = user?.email || "-";
}

async function loadBookingFormSlots() {
    const slotSelect = document.getElementById("slot");
    if (!slotSelect) return;

    try {
        const slots = await fetchJson("/api/slots");
        if (!slots.length) {
            slotSelect.innerHTML = "<option value=''>No slots available</option>";
            slotSelect.disabled = true;
            return;
        }
        slotSelect.disabled = false;
        slotSelect.innerHTML = slots
            .map(
                (slot) =>
                    `<option value="${slot.id}">${escapeHtml(
                        `${formatLongDate(slot.slot_time)} - ${formatTime(slot.slot_time)}`
                    )}</option>`
            )
            .join("");
        setPreselectedSlot();
    } catch (error) {
        slotSelect.innerHTML = `<option value=''>${escapeHtml(error.message)}</option>`;
        slotSelect.disabled = true;
    }
}

async function handleBookingSubmit(user) {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    const message = document.getElementById("bookingMessage");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "Submitting booking...";

        const slotId = document.getElementById("slot").value;

        try {
            const result = await fetchJson("/api/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    slot_id: Number(slotId),
                    user_name: user.name,
                    user_email: user.email,
                }),
            });
            message.textContent = result.message;
            await loadBookingFormSlots();
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

window.cancelBooking = async function (bookingId) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
        const result = await fetchJson(`/api/bookings/${bookingId}`, { method: 'DELETE' });
        // show toast
        const toastBox = document.createElement('div');
        toastBox.className = 'toast-container';
        toastBox.innerHTML = `<div class="toast"><svg width="20" height="20" fill="none" stroke="var(--success)" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg><span>${escapeHtml(result.message)}</span></div>`;
        document.body.appendChild(toastBox);
        setTimeout(() => toastBox.remove(), 3000);
        loadBookingsList();
    } catch (error) {
        alert(error.message);
    }
}

window.rescheduleBooking = async function (bookingId) {
    if (!confirm("To reschedule, we will cancel your current booking so you can select a new time. Proceed?")) return;
    try {
        await fetchJson(`/api/bookings/${bookingId}`, { method: 'DELETE' });
        window.location.href = '/slots.html';
    } catch (error) {
        alert(error.message);
    }
}

window.addToCalendar = function (slotTime) {
    const date = new Date(slotTime);
    const startDate = date.toISOString().replace(/-|:|\.\d+/g, '');
    const endDateObj = new Date(date.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
    const endDate = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Slot+Booking&dates=${startDate}/${endDate}&details=Your+scheduled+slot+booking.`;
    window.open(googleUrl, '_blank');
}

async function loadBookingsList() {
    const bookingsList = document.getElementById("bookingsList");
    if (!bookingsList) return;

    try {
        const bookings = await fetchJson("/api/bookings");
        if (!bookings.length) {
            bookingsList.innerHTML = '<article class="booking-card empty">No bookings yet.</article>';
            return;
        }
        bookingsList.innerHTML = bookings
            .map(
                (booking) => `
                    <article class="booking-card" style="display: flex; flex-direction: column;">
                        <div style="flex-grow: 1;">
                            <h3>${escapeHtml(formatTime(booking.slot_time))} - ${escapeHtml(formatLongDate(booking.slot_time))}</h3>
                            <p style="margin-bottom: 16px;"><strong>${escapeHtml(booking.user_name)}</strong> &middot; ${escapeHtml(booking.user_email)}</p>
                            <span class="badge confirmed" style="margin-bottom: 16px; display: inline-block;">Confirmed</span>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: auto;">
                            <button class="btn btn-small btn-secondary" style="flex: 1;" onclick="rescheduleBooking(${booking.id})">Reschedule</button>
                            <button class="btn btn-small btn-danger" style="flex: 1;" onclick="cancelBooking(${booking.id})">Cancel</button>
                        </div>
                        <button class="btn btn-small btn-outline" style="margin-top: 8px; width: 100%;" onclick="addToCalendar('${booking.slot_time}')">
                            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Add to Calendar
                        </button>
                    </article>
                `
            )
            .join("");
    } catch (error) {
        bookingsList.innerHTML = `<article class="booking-card empty">${escapeHtml(
            error.message
        )}</article>`;
    }
}

function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const message = document.getElementById("loginMessage");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "Signing in...";

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const data = await fetchJson("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            setCurrentUser(data.user);
            window.location.href = "/";
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

function setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const message = document.getElementById("registerMessage");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        message.textContent = "Creating account...";

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;

        try {
            await fetchJson("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            message.textContent = "Account created. Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 900);
        } catch (error) {
            message.textContent = error.message;
        }
    });
}

function setupHomeUser(user) {
    const node = document.getElementById("currentUserName");
    if (node && user) {
        node.textContent = user.name;
    }
}

(function init() {
    const path = getPathname();
    const isPublic = PUBLIC_PAGES.includes(path);
    const user = requireAuth();

    if (isPublic) {
        setupLoginForm();
        setupRegisterForm();
        return;
    }
    if (!user) return;

    setupLogout();
    setupHomeUser(user);
    populateBookingUser(user);

    loadSlotsList();
    loadBookingFormSlots();
    handleBookingSubmit(user);
    loadBookingsList();
})();
