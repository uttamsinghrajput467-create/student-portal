
// ===============================
// STUDENT DATA
// ===============================

const student = {};



// ===============================
// LOGIN
// ===============================

const loginForm = document.getElementById("loginForm");
const loginScreen = document.getElementById("loginScreen");
const app = document.getElementById("app");
const loginMessage = document.getElementById("loginMessage");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpAFPgFrIhEFAG_spKxWv1HhS-290BCUIiZvGsIKK0whGYLPvbMrLGILLbCdYm4zRx/exec";

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredId = document
        .getElementById("studentId")
        .value.trim().toUpperCase();

    const enteredPassword = document
        .getElementById("studentPassword")
        .value.trim();

    if (!enteredId || !enteredPassword) {
        loginMessage.textContent = "Enter Student ID and Password.";
        return;
    }

    loginMessage.textContent = "Logging in...";

    const callbackName = "studentLoginCallback";
    const script = document.createElement("script");

    // Purane callback ko clear karo
    delete window[callbackName];

    let completed = false;

    function cleanup() {
        completed = true;
        delete window[callbackName];
        script.remove();
        clearTimeout(timeout);
    }

    window[callbackName] = function (data) {
        cleanup();

        if (data && data.success) {
            Object.assign(student, data.student);
            loginMessage.textContent = "";
            showStudentApp();
        } else {
            loginMessage.textContent =
                data?.message || "Incorrect Student ID or Password.";
        }
    };

    const params = new URLSearchParams({
        callback: callbackName,
        studentId: enteredId,
        password: enteredPassword
    });

    script.src = SCRIPT_URL + "?" + params.toString();

    script.onerror = function () {
        if (completed) return;

        cleanup();
        loginMessage.textContent = "Server connection failed. Please try again.";
        console.error("Student login script failed to load.");
    };

    const timeout = setTimeout(function () {
        if (completed) return;

        cleanup();
        loginMessage.textContent = "Server response timeout. Please try again.";
    }, 15000);

    document.body.appendChild(script);
});



// ===============================
// HELPER FUNCTIONS
// ===============================

function formatMoney(value) {

    const number = Number(
        String(value || "0").replace(/,/g, "")
    );

    if (!Number.isFinite(number)) return "₹0";

    return "₹" + number.toLocaleString("en-IN");
}


function addProfileRow(label, value) {

    const details = document.querySelector(".profile-details");

    const row = document.createElement("div");
    row.className = "dynamic-profile-row";

    const name = document.createElement("span");
    name.textContent = label;

    const data = document.createElement("strong");
    if (label === "Address") {
    data.classList.add("address-value");
}
    data.textContent = value || "Not available";

    row.appendChild(name);
    row.appendChild(data);

    const schoolRow = Array.from(details.children).find(item =>
        item.querySelector("span")?.textContent.trim() === "School"
    );

    if (schoolRow) {
        details.insertBefore(row, schoolRow);
    } else {
        details.appendChild(row);
    }

}


// ===============================
// STUDENT PHOTO URL
// ===============================

function getPhotoUrl(url) {

    const value = String(url || "").trim();

    const match =
        value.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
        value.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (match) {

        return "https://drive.google.com/thumbnail?id=" +
            match[1] + "&sz=w1000";

    }

    return value;

}


// ===============================
// SHOW STUDENT APP
// ===============================

function showStudentApp() {

    loginScreen.classList.add("hidden");
    app.classList.remove("hidden");


    // HOME DETAILS

    document.getElementById("welcomeName").textContent =
        (student.name || "Student") + " 👋";

   document.getElementById("welcomeClass").innerHTML =
    `Class: ${student.className || ""}<br>Student ID: ${student.id || ""}`;

    document.getElementById("homeAttendance").textContent =
        student.attendance || "0%";

    document.getElementById("homeResult").textContent =
        student.result || "—";


    // HOME DASHBOARD FEES

    document.getElementById("homeTotalFees").textContent =
        formatMoney(student.totalFees);

    document.getElementById("homePaidFees").textContent =
        formatMoney(student.paidFees);

    document.getElementById("homePendingFees").textContent =
        formatMoney(student.remainingFees);


    document.querySelector("#homeResult + small").textContent =
        student.result ? "Latest exam result" : "Result not available";


    // PROFILE BASIC DETAILS

    document.getElementById("profileName").textContent =
        student.name || "";

    document.getElementById("profileClass").textContent =
        student.className || "";

    document.getElementById("profileRoll").textContent =
        student.roll || "";


    // REMOVE OLD DYNAMIC PROFILE ROWS

    const profileDetails = document.querySelector(".profile-details");

    profileDetails.querySelectorAll(".dynamic-profile-row")
        .forEach(row => row.remove());


    // ADD PARENT DETAILS

     addProfileRow("Address", student.address);
    addProfileRow("Father's Name", student.fatherName);
    addProfileRow("Mother's Name", student.motherName);
    addProfileRow("Guardian Mobile", student.guardianMobile);


    // STUDENT PHOTO

    const avatar = document.querySelector(".profile-avatar");

    avatar.replaceChildren();

    const photoUrl = getPhotoUrl(student.studentPhoto);

    console.log("Photo URL:", photoUrl);

    if (photoUrl) {

        const photo = document.createElement("img");

        photo.src = photoUrl;
        photo.alt = "Student Photo";

        photo.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            display: block;
        `;

        photo.onload = function () {
            console.log("PHOTO LOADED SUCCESSFULLY");
        };

        photo.onerror = function () {

            console.error("PHOTO LOAD FAILED:", photo.src);

            avatar.innerHTML =
                '<i class="fa-solid fa-user"></i>';

        };

        avatar.appendChild(photo);

    } else {

        avatar.innerHTML =
            '<i class="fa-solid fa-user"></i>';

    }

    showPage("homePage");

}


// ===============================
// PAGE SWITCHING
// ===============================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(function (page) {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".nav-item").forEach(function (button) {

        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );

    });

    if (pageId === "modulesPage") {

        moduleDetail.classList.add("hidden");
        moduleList.classList.remove("hidden");

    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ===============================
// BOTTOM NAVIGATION
// ===============================

document.querySelectorAll(".nav-item").forEach(function (button) {

    button.addEventListener("click", function () {

        showPage(button.dataset.page);

    });

});


// ===============================
// MODULE DATA
// ===============================

function getModuleData() {

    return {

        attendance: {

            title: "Attendance",

            rows: [

                ["Overall Attendance", student.attendance || "0%"],
                ["Present Days", student.presentDays || "0"],
                ["Absent Days", student.absentDays || "0"]

            ]

        },


        result: {

            title: "Result",

            rows: [

                ["Result", student.result || "Not available"]

            ]

        },


        fees: {

            title: "Fees Details",

            rows: [

                ["Total Fees", formatMoney(student.totalFees)],
                ["Paid Fees", formatMoney(student.paidFees)],
                ["Remaining Fees", formatMoney(student.remainingFees)]

            ]

        },


        study: {

            title: "Study Material",

            rows: [

            ]

        },


        notices: {

            title: "Notice Board",

            rows: [

                ["School Notice", "Check with the school office"],
                ["Exam Reminder", "Prepare for the upcoming test"]

            ]

        }

    };

}


// ===============================
// MODULE ELEMENTS
// ===============================

const moduleList = document.getElementById("moduleList");

const moduleDetail = document.getElementById("moduleDetail");

const moduleDetailContent =
    document.getElementById("moduleDetailContent");


// Previous page tracking

let previousPage = "modulesPage";


function openModule(moduleName, fromPage = "modulesPage") {

    const data = getModuleData()[moduleName];

    if (!data) return;

    previousPage = fromPage;

    showPage("modulesPage");
    moduleDetailContent.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = data.title;
    moduleDetailContent.appendChild(heading);

    // SPECIAL ATTENDANCE DESIGN
    if (moduleName === "attendance") {

        const attendanceBox = document.createElement("div");
        attendanceBox.className = "attendance-overview";

        const attendanceItems = [
            {
                label: "Present Days",
                value: student.presentDays || "0",
                icon: "fa-calendar-check"
            },
            {
                label: "Absent Days",
                value: student.absentDays || "0",
                icon: "fa-calendar-xmark"
            },
            {
                label: "Overall Attendance",
                value: student.attendance || "0%",
                icon: "fa-chart-pie"
            }
        ];

        attendanceItems.forEach(function(item) {

            const card = document.createElement("div");
            card.className = "attendance-item";

            const icon = document.createElement("i");
            icon.className = "fa-solid " + item.icon;

            const value = document.createElement("h3");
            value.textContent = item.value;

            const label = document.createElement("p");
            label.textContent = item.label;

            card.append(icon, value, label);
            attendanceBox.appendChild(card);

        });

        moduleDetailContent.appendChild(attendanceBox);

        // ATTENDANCE PROGRESS BAR
        const progressBox = document.createElement("div");
        progressBox.className = "attendance-progress";

        const progressHeading = document.createElement("div");
        progressHeading.className = "progress-heading";

        const progressTitle = document.createElement("span");
        progressTitle.textContent = "Overall Attendance";

        const percentage = document.createElement("strong");
        percentage.textContent = student.attendance || "0%";

        progressHeading.append(progressTitle, percentage);

        const track = document.createElement("div");
        track.className = "progress-track";

        const fill = document.createElement("div");
        fill.className = "progress-fill";

        let percent = parseFloat(
            String(student.attendance || "0").replace("%", "")
        );

        percent = Number.isFinite(percent)
            ? Math.max(0, Math.min(100, percent))
            : 0;

        fill.style.width = percent + "%";

        track.appendChild(fill);
        progressBox.append(progressHeading, track);

        moduleDetailContent.appendChild(progressBox);

    } else {

        // OTHER MODULES - OLD DESIGN
        data.rows.forEach(function(item) {

            const row = document.createElement("div");
            row.className = "detail-row";

            const label = document.createElement("span");
            label.textContent = item[0];

            const value = document.createElement("strong");
            value.textContent = item[1];

            row.append(label, value);
            moduleDetailContent.appendChild(row);

        });

    }

    moduleList.classList.add("hidden");
    moduleDetail.classList.remove("hidden");

    moduleDetail.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

// ===============================
// HOME ATTENDANCE CARD CLICK
// ===============================
// ===============================
// MODULE BUTTON CLICK
// ===============================

moduleList.addEventListener("click", function(event) {

    const button = event.target.closest(".module-card");

    if (!button) return;

    const moduleName = button.dataset.module;

    openModule(moduleName, "modulesPage");

});

const homeAttendanceCard =
    document.querySelector("#homePage .stats-grid .stat-card:first-child");

homeAttendanceCard.style.cursor = "pointer";

homeAttendanceCard.addEventListener("click", function () {

    openModule("attendance", "homePage");

});


// ===============================
// BACK BUTTON
// ===============================

document.getElementById("backToModules")
    .addEventListener("click", function () {

        moduleDetail.classList.add("hidden");

        if (previousPage === "homePage") {

            showPage("homePage");

        } else {

            showPage("modulesPage");

        }

    });


// ===============================
// LOGOUT
// ===============================

document.getElementById("logoutButton")
    .addEventListener("click", function () {

        app.classList.add("hidden");
        loginScreen.classList.remove("hidden");

        loginForm.reset();
        loginMessage.textContent = "";

        Object.keys(student).forEach(key => delete student[key]);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });
