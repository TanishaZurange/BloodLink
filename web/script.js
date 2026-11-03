const API_URL = "https://bloodlink-backend-gyfg.onrender.com/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

let allDonors = [];
let allHospitals = [];
let allRequests = [];

// ---------------- API CONNECTION ----------------

async function apiRequest(endpoint, method = "GET", data = null) {
    const options = { method };

    if (data !== null) {
        options.headers = { "Content-Type": "text/plain" };
        options.body = JSON.stringify(data);
    }

    const response = await fetch(API_URL + endpoint, options);

    if (!response.ok) {
        throw new Error(await response.text() || "Server request failed");
    }

    const responseText = await response.text();

    if (!responseText) return null;

    return JSON.parse(responseText);
}

// ---------------- NOTIFICATIONS ----------------

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showError(error) {
    console.error(error);
    showToast("Error: " + error.message);
}

// ---------------- SAFE TABLE HELPERS ----------------

function addCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "-";
    row.appendChild(cell);
    return cell;
}

function addBadge(row, text, className) {
    const cell = document.createElement("td");
    const badge = document.createElement("span");

    badge.className = "badge " + className;
    badge.textContent = text;

    cell.appendChild(badge);
    row.appendChild(cell);
    return cell;
}

function showEmptyRow(tbody, columns, message) {
    tbody.innerHTML = "";

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = columns;
    cell.className = "empty-table";
    cell.textContent = message;

    row.appendChild(cell);
    tbody.appendChild(row);
}

// ---------------- PAGE NAVIGATION ----------------

function showPage(pageId, clickedButton = null) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });

    const activeButton = clickedButton ||
        document.querySelector(`[data-page="${pageId}"]`);

    if (activeButton) {
        activeButton.classList.add("active");
    }
}

// ---------------- DONORS ----------------

async function loadDonors() {
    allDonors = await apiRequest("/donors") || [];

    document.getElementById("donorCount").textContent =
        allDonors.length;

    document.getElementById("donorTotal").textContent =
        allDonors.length + (allDonors.length === 1 ? " Donor" : " Donors");

    document.getElementById("availableCount").textContent =
        allDonors.filter(d => d.available === true).length;

    renderDonors();
    renderAvailability();
}

function renderDonors() {
    const tbody = document.getElementById("donorTableBody");

    if (!tbody) return;

    const search = document.getElementById("donorSearch")
        .value.toLowerCase().trim();

    const selectedGroup = document.getElementById("bloodFilter").value;

    const filtered = allDonors.filter(d => {
        const matchesSearch =
            String(d.donorID).toLowerCase().includes(search) ||
            String(d.name).toLowerCase().includes(search) ||
            String(d.phone).toLowerCase().includes(search);

        const matchesGroup =
            !selectedGroup || d.bloodGroup === selectedGroup;

        return matchesSearch && matchesGroup;
    });

    if (filtered.length === 0) {
        showEmptyRow(tbody, 8, "No matching donors found.");
        return;
    }

    tbody.innerHTML = "";

    filtered.forEach(d => {
        const row = document.createElement("tr");

        addCell(row, "#" + d.donorID);
        addCell(row, d.name);
        addCell(row, d.phone);
        addCell(row, d.age);
        addCell(row, d.bloodGroup);
        addCell(row, d.address);

        addBadge(
            row,
            d.available ? "Available" : "Unavailable",
            d.available ? "available" : "unavailable"
        );

        const actionCell = document.createElement("td");
        const button = document.createElement("button");

        button.className = "action-button " +
            (d.available ? "red-action" : "green-action");

        button.textContent = d.available
            ? "Mark Unavailable"
            : "Mark Available";

        button.addEventListener("click", () => {
            changeAvailability(d.donorID, !d.available);
        });

        actionCell.appendChild(button);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

async function refreshAll() {
    try {
        await loadDonors();
        await loadHospitals();
        await loadRequests();

        renderDemandIntelligence();
        renderEmergencyIntelligence();

    } catch (error) {
        console.error("Refresh error:", error);
        showToast("Unable to connect to BloodLink server.");
    }
}

document.getElementById("donorSearch").addEventListener(
    "input", renderDonors
);

document.getElementById("bloodFilter").addEventListener(
    "change", renderDonors
);

document.getElementById("donorForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    try {
        const result = await apiRequest("/donors", "POST", {
            name: document.getElementById("donorName").value.trim(),
            phone: document.getElementById("donorPhone").value.trim(),
            age: Number(document.getElementById("donorAge").value),
            bloodGroup: document.getElementById("donorBlood").value,
            address: document.getElementById("donorAddress").value.trim()
        });

        this.reset();

        await refreshAll();

        showToast("Donor registered successfully! ID: " + result.donorID);

    } catch (error) {
        showError(error);
    }
});

// ---------------- HOSPITALS ----------------

async function loadHospitals() {
    allHospitals = await apiRequest("/hospitals") || [];

    document.getElementById("hospitalCount").textContent =
        allHospitals.length;

    document.getElementById("hospitalTotal").textContent =
        allHospitals.length +
        (allHospitals.length === 1 ? " Hospital" : " Hospitals");

    renderHospitals();
    updateHospitalDropdown();
}

function renderHospitals() {
    const tbody = document.getElementById("hospitalTableBody");

    if (!tbody) return;

    const search = document.getElementById("hospitalSearch")
        .value.toLowerCase().trim();

    const filtered = allHospitals.filter(h => {
        return (
            String(h.hospitalID).toLowerCase().includes(search) ||
            String(h.name).toLowerCase().includes(search) ||
            String(h.location).toLowerCase().includes(search) ||
            String(h.phone).toLowerCase().includes(search)
        );
    });

    if (filtered.length === 0) {
        showEmptyRow(tbody, 5, "No matching hospitals found.");
        return;
    }

    tbody.innerHTML = "";

    filtered.forEach(h => {
        const row = document.createElement("tr");

        addCell(row, "#" + h.hospitalID);
        addCell(row, h.name);
        addCell(row, h.phone);
        addCell(row, h.location);
        addCell(row, h.address);

        tbody.appendChild(row);
    });
}

function updateHospitalDropdown() {
    const select = document.getElementById("requestHospital");
    const previousValue = select.value;

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select hospital";
    select.appendChild(defaultOption);

    allHospitals.forEach(h => {
        const option = document.createElement("option");

        option.value = h.hospitalID;
        option.textContent = h.name + " (ID: " + h.hospitalID + ")";

        select.appendChild(option);
    });

    if (allHospitals.some(h =>
        String(h.hospitalID) === previousValue
    )) {
        select.value = previousValue;
    }
}

document.getElementById("hospitalSearch").addEventListener(
    "input", renderHospitals
);

document.getElementById("hospitalForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    try {
        const result = await apiRequest("/hospitals", "POST", {
            name: document.getElementById("hospitalName").value.trim(),
            phone: document.getElementById("hospitalPhone").value.trim(),
            address: document.getElementById("hospitalAddress").value.trim(),
            location: document.getElementById("hospitalLocation").value.trim()
        });

        this.reset();

        await refreshAll();

        showToast("Hospital registered successfully! ID: " + result.hospitalID);

    } catch (error) {
        showError(error);
    }
});

// ---------------- BLOOD REQUESTS ----------------

async function loadRequests() {
    allRequests = await apiRequest("/requests") || [];

    document.getElementById("requestCount").textContent =
        allRequests.length;

    document.getElementById("requestTotal").textContent =
        allRequests.length +
        (allRequests.length === 1 ? " Request" : " Requests");

    renderRequests();
    renderRecentRequests();
}

function getHospitalName(hospitalID) {
    const hospital = allHospitals.find(
        h => Number(h.hospitalID) === Number(hospitalID)
    );

    return hospital ? hospital.name : "Hospital #" + hospitalID;
}


function renderRequests() {
    const tbody = document.getElementById("requestTableBody");

    if (!tbody) return;

    const search = document.getElementById("requestSearch")
        .value.toLowerCase().trim();

    const statusFilter = document.getElementById("requestStatusFilter").value;

    const filtered = allRequests.filter(r => {
        const hospitalName = getHospitalName(r.hospitalID);

        const matchesSearch =
            String(r.requestID).toLowerCase().includes(search) ||
            hospitalName.toLowerCase().includes(search);

        const matchesStatus =
            !statusFilter || r.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        showEmptyRow(tbody, 8, "No matching blood requests found.");
        return;
    }

    tbody.innerHTML = "";

    filtered.forEach(r => {
        const row = document.createElement("tr");

        addCell(row, "#" + r.requestID);
        addCell(row, getHospitalName(r.hospitalID));
        addCell(row, r.bloodGroup);
        addCell(row, r.units);

        addBadge(row, r.urgency, String(r.urgency).toLowerCase());
        addBadge(row, r.status, String(r.status).toLowerCase());

        // Update request status
        const actionCell = document.createElement("td");

        const select = document.createElement("select");
        select.className = "status-select";
        select.id = "status-" + r.requestID;

        ["Pending", "Accepted", "Completed", "Cancelled"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        });

        select.value = r.status;

        const updateButton = document.createElement("button");
        updateButton.className = "action-button green-action";
        updateButton.textContent = "Update";

        updateButton.addEventListener("click", () => {
            updateStatus(r.requestID);
        });

        actionCell.appendChild(select);
        actionCell.appendChild(updateButton);
        row.appendChild(actionCell);

        // Smart donor matching button
        const matchCell = document.createElement("td");
        const matchButton = document.createElement("button");

        const matches = getMatchingDonors(r.bloodGroup, r.hospitalID);

        matchButton.className = "action-button red-action";
        matchButton.textContent = "Find Donors (" + matches.length + ")";

        matchButton.addEventListener("click", () => {
            showMatchingDonors(r.requestID);
        });

        matchCell.appendChild(matchButton);
        row.appendChild(matchCell);

        tbody.appendChild(row);
    });
}

// RBC compatibility: recipient blood group -> compatible donor groups

/* ==========================================
   BLOODLINK SMART DONOR RANKING SYSTEM
========================================== */

// RBC compatibility rules:
// Recipient blood group -> compatible donor groups
const donorCompatibility = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"]
};

// Convert addresses into comparable text
function normalizeLocation(location) {
    return String(location || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Calculate location matching score
function calculateLocationScore(donorAddress, hospitalLocation) {
    const donorLocation = normalizeLocation(donorAddress);
    const hospitalArea = normalizeLocation(hospitalLocation);

    if (!donorLocation || !hospitalArea) {
        return {
            score: 0,
            reason: "Location information unavailable"
        };
    }

    // Exact location or one address contains the other
    if (
        donorLocation.includes(hospitalArea) ||
        hospitalArea.includes(donorLocation)
    ) {
        return {
            score: 25,
            reason: "Strong location text match"
        };
    }

    // Compare meaningful location words
    const ignoredWords = [
        "near", "road", "street", "area", "city",
        "district", "india", "maharashtra", "pune",
        "the", "and"
    ];

    const donorWords = donorLocation.split(" ")
        .filter(word => word.length > 2 && !ignoredWords.includes(word));

    const hospitalWords = hospitalArea.split(" ")
        .filter(word => word.length > 2 && !ignoredWords.includes(word));

    const commonWords = donorWords.filter(word =>
        hospitalWords.includes(word)
    );

    if (commonWords.length > 0) {
        return {
            score: 10,
            reason: "Partial location text match"
        };
    }

    return {
        score: 0,
        reason: "No location match identified"
    };
}

// Find and rank compatible available donors
function getMatchingDonors(requiredGroup, hospitalID) {
    const compatibleGroups = donorCompatibility[requiredGroup] || [];

    const hospital = allHospitals.find(h =>
        Number(h.hospitalID) === Number(hospitalID)
    );

    const hospitalLocation = hospital
        ? hospital.location
        : "";

    const matchingDonors = allDonors
        .filter(d =>
            d.available === true &&
            compatibleGroups.includes(d.bloodGroup)
        )
        .map(d => {
            const locationResult = calculateLocationScore(
                d.address,
                hospitalLocation
            );

            // All donors pass the compatibility and availability filters.
            // Location provides an additional ranking bonus.
            const score = 100 + locationResult.score;

            return {
                ...d,
                rankingScore: score,
                locationReason: locationResult.reason
            };
        });

    // Highest ranking first; donor ID breaks ties consistently.
    matchingDonors.sort((a, b) =>
        b.rankingScore - a.rankingScore ||
        Number(a.donorID) - Number(b.donorID)
    );

    return matchingDonors;
}

// Display ranked donors for a blood request
function showMatchingDonors(requestID) {
    const request = allRequests.find(r =>
        Number(r.requestID) === Number(requestID)
    );

    if (!request) {
        showToast("Request not found.");
        return;
    }

    const matches = getMatchingDonors(
        request.bloodGroup,
        request.hospitalID
    );

    let modal = document.getElementById("matchingModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "matchingModal";
        modal.className = "matching-modal";

        const dialog = document.createElement("div");
        dialog.className = "matching-dialog";

        const closeButton = document.createElement("button");
        closeButton.className = "modal-close";
        closeButton.textContent = "×";
        closeButton.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        const eyebrow = document.createElement("span");
        eyebrow.className = "eyebrow";
        eyebrow.textContent = "SMART DONOR RANKING";

        const heading = document.createElement("h2");
        heading.textContent = "Recommended Donors";

        const description = document.createElement("p");
        description.id = "matchingDescription";

        const results = document.createElement("div");
        results.id = "matchingResults";

        const note = document.createElement("div");
        note.className = "matching-note";
        note.textContent =
            "Ranking is a preliminary software suggestion based on " +
            "blood-group compatibility, availability and address text. " +
            "It does not confirm distance or medical eligibility. " +
            "Blood-bank testing and crossmatching are mandatory.";

        dialog.append(
            closeButton,
            eyebrow,
            heading,
            description,
            results,
            note
        );

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        modal.addEventListener("click", e => {
            if (e.target === modal) {
                modal.classList.remove("show");
            }
        });
    }

    document.getElementById("matchingDescription").textContent =
        "Request #" + request.requestID +
        " | Blood Group: " + request.bloodGroup +
        " | " + matches.length + " compatible available donor(s)";

    const results = document.getElementById("matchingResults");
    results.innerHTML = "";

    if (matches.length === 0) {
        const empty = document.createElement("div");
        empty.className = "no-matches";
        empty.textContent =
            "No compatible available donors found for this request.";

        results.appendChild(empty);
    } else {
        matches.forEach((d, index) => {
            const card = document.createElement("div");
            card.className = "matching-donor-card ranked-card";

            const info = document.createElement("div");
            info.className = "ranked-donor-info";

            const rank = document.createElement("span");
            rank.className = "rank-number";
            rank.textContent = "#" + (index + 1);

            const details = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = d.name;

            const donorDetails = document.createElement("p");
            donorDetails.textContent =
                "Donor ID: " + d.donorID +
                " | " + d.bloodGroup +
                " | " + d.phone;

            const location = document.createElement("p");
            location.textContent = "Location: " + d.locationReason;

            const score = document.createElement("span");
            score.className = "ranking-score";
            score.textContent = "Ranking score: " + d.rankingScore;

            details.append(name, donorDetails, location, score);
            info.append(rank, details);

            const badge = document.createElement("span");
            badge.className = "badge available";
            badge.textContent = "Available";

            card.append(info, badge);
            results.appendChild(card);
        });
    }

    modal.classList.add("show");
}




function renderRecentRequests() {
    const tbody = document.getElementById("recentRequestsBody");

    if (!tbody) return;

    const recent = [...allRequests].reverse().slice(0, 5);

    if (recent.length === 0) {
        showEmptyRow(tbody, 6, "No blood requests have been submitted yet.");
        return;
    }

    tbody.innerHTML = "";

    recent.forEach(r => {
        const row = document.createElement("tr");

        addCell(row, "#" + r.requestID);
        addCell(row, getHospitalName(r.hospitalID));
        addCell(row, r.bloodGroup);
        addCell(row, r.units);
        addBadge(row, r.urgency, String(r.urgency).toLowerCase());
        addBadge(row, r.status, String(r.status).toLowerCase());

        tbody.appendChild(row);
    });
}

document.getElementById("requestSearch").addEventListener(
    "input", renderRequests
);

document.getElementById("requestStatusFilter").addEventListener(
    "change", renderRequests
);

document.getElementById("requestForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    if (allHospitals.length === 0) {
        showToast("Please register a hospital first.");
        return;
    }

    try {
        const result = await apiRequest("/requests", "POST", {
            hospitalID: Number(document.getElementById("requestHospital").value),
            bloodGroup: document.getElementById("requestBlood").value,
            units: Number(document.getElementById("requestUnits").value),
            urgency: document.getElementById("urgency").value
        });

        this.reset();

        await refreshAll();

        showToast("Blood request submitted! ID: " + result.requestID);

    } catch (error) {
        showError(error);
    }
});

async function updateStatus(requestID) {
    try {
        const status = document.getElementById(
            "status-" + requestID
        ).value;

        await apiRequest("/requests/status", "POST", {
            requestID: Number(requestID),
            status: status
        });

        await refreshAll();

        showToast("Request status updated!");

    } catch (error) {
        showError(error);
    }
}

// ---------------- BLOOD AVAILABILITY ----------------

function renderAvailability() {
    const output = document.getElementById("availabilityList");

    output.innerHTML = "";

    BLOOD_GROUPS.forEach(group => {
        const count = allDonors.filter(d =>
            d.bloodGroup === group && d.available === true
        ).length;

        const item = document.createElement("div");
        item.className = "availability-item";

        const heading = document.createElement("strong");
        heading.textContent = group;

        const description = document.createElement("span");
        description.textContent =
            count + (count === 1 ? " donor available" : " donors available");

        item.appendChild(heading);
        item.appendChild(description);

        output.appendChild(item);
    });
}

// ---------------- REFRESH ALL DATA ----------------

async function refreshAll() {
    try {
        await loadDonors();
        await loadHospitals();
        await loadRequests();

        renderDemandIntelligence();
        renderEmergencyIntelligence();

    } catch (error) {
        console.error("Refresh error:", error);
        showToast("Unable to connect to BloodLink server.");
    }
}

// ---------------- START APPLICATION ----------------

window.addEventListener("DOMContentLoaded", () => {
    refreshAll();
});

// ======================================
// BLOODLINK DEMAND INTELLIGENCE
// ======================================

function renderDemandIntelligence() {
    const dashboard = document.getElementById("dashboard");
    if (!dashboard) return;

    let section = document.getElementById("demandIntelligence");

    if (!section) {
        section = document.createElement("div");
        section.id = "demandIntelligence";
        section.className = "demand-intelligence";
        
        const recentPanel = dashboard.querySelector(".recent-panel");
        if (recentPanel) {
            dashboard.insertBefore(section, recentPanel);
        } else {
            dashboard.appendChild(section);
        }
    }

    const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const requests = allRequests || [];
    const donors = allDonors || [];

    const demand = groups.map(group => ({
        group,
        count: requests.filter(r => r.bloodGroup === group).length,
        units: requests
            .filter(r => r.bloodGroup === group)
            .reduce((sum, r) => sum + Number(r.units || 0), 0),
        available: donors.filter(d =>
            d.bloodGroup === group && d.available === true
        ).length
    }));

    const maxDemand = Math.max(1, ...demand.map(d => d.count));

    const urgency = {
        High: requests.filter(r => r.urgency === "High").length,
        Medium: requests.filter(r => r.urgency === "Medium").length,
        Low: requests.filter(r => r.urgency === "Low").length
    };

    const highestDemand = [...demand].sort(
        (a, b) => b.count - a.count
    )[0];

    const alerts = demand
        .filter(d => d.count > 0 && d.available < d.count)
        .sort((a, b) => (b.count - b.available) - (a.count - a.available));

    section.innerHTML = `
        <div class="demand-heading">
            <div>
                <span class="eyebrow">DATA & INSIGHTS</span>
                <h2>Demand Intelligence</h2>
                <p>Understand blood group demand using saved request records.</p>
            </div>
            <span class="demand-live">● LIVE DATA</span>
        </div>

        <div class="demand-summary">
            <div class="demand-card">
                <span>Total Requests</span>
                <strong>${requests.length}</strong>
                <small>All recorded requests</small>
            </div>
            <div class="demand-card">
                <span>Units Requested</span>
                <strong>${demand.reduce((s, d) => s + d.units, 0)}</strong>
                <small>Total requested units</small>
            </div>
            <div class="demand-card">
                <span>Highest Demand</span>
                <strong>${requests.length ? highestDemand.group : "—"}</strong>
                <small>${requests.length ? highestDemand.count + " requests" : "No request data yet"}</small>
            </div>
            <div class="demand-card">
                <span>High Urgency</span>
                <strong>${urgency.High}</strong>
                <small>Urgent requests recorded</small>
            </div>
        </div>

        <div class="demand-panels">
            <div class="panel demand-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Blood Group Demand</h2>
                        <p>Number of requests for each blood group</p>
                    </div>
                </div>
                <div class="demand-bars">
                    ${demand.map(d => `
                        <div class="demand-bar-row">
                            <strong>${d.group}</strong>
                            <div class="demand-track">
                                <div class="demand-fill"
                                     style="width:${(d.count / maxDemand) * 100}%">
                                </div>
                            </div>
                            <span>${d.count}</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="panel demand-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Urgency Analysis</h2>
                        <p>Breakdown of request priority</p>
                    </div>
                </div>
                ${["High", "Medium", "Low"].map(level => {
                    const percent = requests.length
                        ? Math.round(urgency[level] / requests.length * 100)
                        : 0;

                    return `
                        <div class="urgency-row">
                            <div class="urgency-label">
                                <strong>${level}</strong>
                                <span>${urgency[level]} requests (${percent}%)</span>
                            </div>
                            <div class="demand-track">
                                <div class="urgency-fill ${level.toLowerCase()}"
                                     style="width:${percent}%">
                                </div>
                            </div>
                        </div>
                    `;
                }).join("")}
            </div>
        </div>

        <div class="panel demand-panel alert-panel">
            <div class="panel-heading">
                <div>
                    <h2>Smart Demand Alerts</h2>
                    <p>Compare recorded requests with currently available donors</p>
                </div>
            </div>

            ${alerts.length ? alerts.map(d => `
                <div class="demand-alert">
                    <strong>⚠ ${d.group} – Supply gap indicator</strong>
                    <span>${d.count} recorded request(s), ${d.available} currently available donor(s).</span>
                </div>
            `).join("") : `
                <div class="demand-no-alert">
                    ${requests.length
                        ? "No blood group currently has more recorded requests than available donors."
                        : "Add blood requests to generate demand insights."}
                </div>
            `}
        </div>

        <p class="demand-disclaimer">
            Insights are based on saved records, not medical inventory.
            Donor counts are not confirmed blood units. This is historical
            analysis, not a prediction of future demand.
        </p>
    `;
}

// ======================================
// BLOODLINK EMERGENCY INTELLIGENCE
// ======================================

function renderEmergencyIntelligence() {
    const dashboard = document.getElementById("dashboard");
    if (!dashboard) return;

    let section = document.getElementById("emergencyIntelligence");

    if (!section) {
        section = document.createElement("section");
        section.id = "emergencyIntelligence";
        section.style.cssText =
            "background:#fff;padding:24px;border-radius:16px;" +
            "margin:24px 0;box-shadow:0 4px 20px #0000000d;";

        const recentPanel = dashboard.querySelector(".recent-panel");
        if (recentPanel) {
            dashboard.insertBefore(section, recentPanel);
        } else {
            dashboard.appendChild(section);
        }
    }

    const ranked = allRequests.map(request => {
        const donors = getMatchingDonors(
            request.bloodGroup,
            request.hospitalID
        );

        let score =
            request.urgency === "High" ? 45 :
            request.urgency === "Medium" ? 25 : 10;

        score += Math.min(Number(request.units) * 5, 20);

        if (donors.length === 0) score += 25;
        else if (donors.length < request.units) score += 15;
        else if (donors.length < request.units * 2) score += 8;

        score = Math.min(score, 100);

        const reasons = [];
        if (request.urgency === "High")
            reasons.push("High urgency");
        if (request.units >= 3)
            reasons.push("Large blood requirement");
        if (donors.length === 0)
            reasons.push("No compatible available donors");
        else if (donors.length < request.units)
            reasons.push("Limited compatible donors");

        if (reasons.length === 0)
            reasons.push("Normal priority");

        return {
            ...request,
            score,
            donorCount: donors.length,
            reasons,
            priority:
                score >= 75 ? "CRITICAL" :
                score >= 55 ? "HIGH" :
                score >= 35 ? "MEDIUM" : "LOW"
        };
    });

    ranked.sort((a, b) =>
        b.score - a.score ||
        Number(a.requestID) - Number(b.requestID)
    );

    section.innerHTML = `
        <div style="display:flex;justify-content:space-between;
                    align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
                <span style="color:#dc2626;font-weight:bold;">
                    EMERGENCY DECISION SUPPORT
                </span>
                <h2 style="margin:8px 0;">Emergency Intelligence</h2>
                <p style="color:#777;">
                    Requests ranked by urgency, units and donor availability.
                </p>
            </div>
            <strong>${ranked.length} Requests Analysed</strong>
        </div>

        <div id="emergencyCards"></div>

        <p style="font-size:12px;color:#888;margin-top:18px;">
            Scores are software-generated decision-support indicators,
            not medical triage decisions. Hospitals must verify urgency
            and donor eligibility.
        </p>
    `;

    const cards = section.querySelector("#emergencyCards");

    if (ranked.length === 0) {
        cards.textContent = "No emergency requests available yet.";
        return;
    }

    ranked.forEach(r => {
        const card = document.createElement("div");
        card.style.cssText =
            "padding:16px;margin-top:14px;border:1px solid #eee;" +
            "border-radius:12px;display:flex;justify-content:space-between;" +
            "align-items:center;gap:15px;flex-wrap:wrap;";

        const info = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent =
            "Request #" + r.requestID + " — " + r.bloodGroup;

        const details = document.createElement("p");
        details.textContent =
            getHospitalName(r.hospitalID) + " | " +
            r.units + " unit(s) | " +
            r.urgency + " urgency | " +
            r.donorCount + " compatible available donor(s)";

        const reason = document.createElement("p");
        reason.textContent = "Reason: " + r.reasons.join(", ");

        info.append(heading, details, reason);

        const score = document.createElement("strong");
        score.style.cssText =
            "font-size:17px;color:" +
            (r.priority === "CRITICAL" ? "#dc2626" :
             r.priority === "HIGH" ? "#ea580c" :
             r.priority === "MEDIUM" ? "#ca8a04" : "#15803d");

        score.textContent =
            r.priority + " | " + r.score + "/100";

        card.append(info, score);
        cards.appendChild(card);
    });
}
