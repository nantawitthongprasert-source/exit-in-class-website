const API_URL = "PUT_YOUR_GOOGLE_SCRIPT_URL_HERE";

/* ===== LOGIN ===== */
const role = document.getElementById("role");
if (role) {
  role.onchange = () => {
    student-box?.classList.toggle("hidden", role.value !== "student");
    staff-box?.classList.toggle("hidden", role.value !== "staff");
  };
}

function login() {
  const isStudent = role.value === "student";
  const data = isStudent
    ? { action: "loginStudent", student_id: student_id.value, citizen_id: citizen_id.value }
    : { action: "loginStaff", username: username.value, password: password.value };

  fetch(API_URL, { method: "POST", body: JSON.stringify(data) })
    .then(r => r.json())
    .then(res => {
      if (!res.success) return error.textContent = res.message;
      localStorage.setItem("session", JSON.stringify(res.data));
      location.href = "index.html";
    });
}

/* ===== AUTH ===== */
const session = JSON.parse(localStorage.getItem("session") || "null");
if (location.pathname.endsWith("index.html") && !session) {
  location.href = "login.html";
}

function logout() {
  localStorage.removeItem("session");
  location.href = "login.html";
}

/* ===== STUDENT SUBMIT ===== */
function submitLeave(e) {
  e.preventDefault();

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "submitLeave",
      student_id: session.student_id,
      citizen_id: session.citizen_id,
      student_name: student-name.value,
      grade: grade.value,
      room: room.value,
      reason: reason.value
    })
  })
  .then(r => r.json())
  .then(res => {
    alert(res.message);
    loadStudentStatus();
  });
}

/* ===== STUDENT STATUS ===== */
function loadStudentStatus() {
  if (session.role !== "student") return;

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getStudentLeaves", student_id: session.student_id })
  })
  .then(r => r.json())
  .then(res => {
    const box = document.getElementById("student-status");
    box.innerHTML = res.data.map(r =>
      `<p>สถานะ: <b>${r[8]}</b> ${r[9] ? "- " + r[9] : ""}</p>`
    ).join("");
  });
}

/* ===== ADMIN ===== */
function loadAdmin() {
  if (session.role !== "staff") return;
  document.getElementById("admin-box").classList.remove("hidden");

  fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "getAllLeaves" }) })
    .then(r => r.json())
    .then(res => {
      admin-table.innerHTML = res.data.map(r => `
        <tr>
          <td>${r[3]}</td>
          <td>${r[6]}</td>
          <td>${r[8]}</td>
          <td>
            <button onclick="approve('${r[0]}')">✔</button>
            <button onclick="reject('${r[0]}')">✖</button>
          </td>
        </tr>
      `).join("");
    });
}

function approve(id) {
  fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateStatus", id, status: "approved" }) })
    .then(() => loadAdmin());
}

function reject(id) {
  const note = prompt("เหตุผลที่ไม่อนุมัติ");
  if (!note) return;
  fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "updateStatus", id, status: "rejected", note }) })
    .then(() => loadAdmin());
}

document.addEventListener("DOMContentLoaded", () => {
  loadStudentStatus();
  loadAdmin();
});
