// ==========================================
// YOUTUBE API KEY - LƯU RIÊNG THEO TRÌNH DUYỆT (KHÔNG HARDCODE TRONG CODE)
// ==========================================
// Trước đây key bị hardcode thẳng vào file JS, có nghĩa là bất kỳ ai xem
// mã nguồn (view-source) cũng lấy được key và có thể lạm dụng quota của bạn.
// Nay người dùng tự dán API Key cá nhân của họ vào mục Cài Đặt, key chỉ được
// lưu trong localStorage của trình duyệt, không xuất hiện trong mã nguồn.
function getYtApiKey() {
  return localStorage.getItem("userYtApiKey") || "";
}
function saveYtApiKey() {
  const input = document.getElementById("settingYtApiKey");
  if (!input) return;
  localStorage.setItem("userYtApiKey", input.value.trim());
}
function loadYtApiKey() {
  const input = document.getElementById("settingYtApiKey");
  if (input) input.value = localStorage.getItem("userYtApiKey") || "";
}

let currentChatFriend = null;

// ==========================================
// CÀI ĐẶT CÁ NHÂN HÓA THEO TÀI KHOẢN
// ==========================================
function saveUserSettings() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  const settings = {
    textColor: document.getElementById("settingTextColor").value,
    style: document.getElementById("settingStyle").value,
    accent: document.getElementById("settingAccent").value,
    bgUrl: document.getElementById("settingBgUrl").value,
  };

  localStorage.setItem("userSettings_" + currentUser, JSON.stringify(settings));
  applyUserSettings(settings);
}

function loadUserSettings() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  // Load ảnh đại diện vào khung preview trong mục cài đặt
  const accData =
    JSON.parse(localStorage.getItem("accountData_" + currentUser)) || {};
  const settingsAvatarPreview = document.getElementById(
    "settingsAvatarPreview",
  );
  if (settingsAvatarPreview) {
    if (accData.avatar && accData.avatar.trim() !== "") {
      settingsAvatarPreview.innerHTML = `<img src="${accData.avatar}" alt="Avatar">`;
    } else {
      settingsAvatarPreview.innerHTML = currentUser.charAt(0).toUpperCase();
      settingsAvatarPreview.style.fontWeight = "bold";
    }
  }

  const saved = localStorage.getItem("userSettings_" + currentUser);
  if (saved) {
    const settings = JSON.parse(saved);
    document.getElementById("settingTextColor").value =
      settings.textColor || "#f5f5f7";
    document.getElementById("settingStyle").value = settings.style || "apple";
    document.getElementById("settingAccent").value =
      settings.accent || "#0a84ff";
    document.getElementById("settingBgUrl").value = settings.bgUrl || "";
    applyUserSettings(settings);
  } else {
    resetUserSettings();
  }

  loadYtApiKey();
}

function applyUserSettings(settings) {
  if (settings.textColor) {
    document.documentElement.style.setProperty(
      "--text-main",
      settings.textColor,
    );
  }

  const body = document.getElementById("pageBody");
  body.classList.remove(
    "style-blur",
    "style-rgb",
    "style-basic",
    "style-cyberpunk",
    "style-matrix",
  );

  if (settings.style && settings.style !== "apple") {
    body.classList.add("style-" + settings.style);
  }

  if (settings.accent) {
    document.documentElement.style.setProperty("--accent", settings.accent);
  }

  if (settings.bgUrl) {
    document.documentElement.style.setProperty(
      "--custom-bg-image",
      `url('${settings.bgUrl}')`,
    );
  } else {
    document.documentElement.style.setProperty("--custom-bg-image", "none");
  }
}

function resetUserSettings() {
  document.getElementById("settingTextColor").value = "#f5f5f7";
  document.getElementById("settingStyle").value = "apple";
  document.getElementById("settingAccent").value = "#0a84ff";
  document.getElementById("settingBgUrl").value = "";
  saveUserSettings();
}

// ==========================================
// XỬ LÝ ĐỔI AVATAR TRONG PHẦN SETTING (mở popup cắt ảnh, xem thêm bên dưới)
// ==========================================
function handleSettingsAvatarChange(event) {
  handleAvatarFileSelected(event);
}

function loadUserHeaderProfile() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  const nameRow = document.getElementById("displayAccountName");
  if (nameRow) {
    const nameSpan = nameRow.querySelector("span");
    if (nameSpan) nameSpan.textContent = currentUser;
  }

  let accData = JSON.parse(
    localStorage.getItem("accountData_" + currentUser),
  ) || { avatar: "" };
  const headerAvatar = document.getElementById("headerAvatarDisplay");

  if (accData.avatar && accData.avatar.trim() !== "") {
    headerAvatar.innerHTML = `<img src="${accData.avatar}" alt="Avatar">`;
  } else {
    headerAvatar.innerHTML = currentUser.charAt(0).toUpperCase();
    headerAvatar.style.fontWeight = "bold";
  }
}

// ==========================================
// DROPDOWN MENU TÀI KHOẢN (Section 2)
// ==========================================
function toggleAccountDropdown() {
  const dropdown = document.getElementById("accountDropdown");
  if (dropdown) dropdown.classList.toggle("active");
}
function closeAccountDropdown() {
  const dropdown = document.getElementById("accountDropdown");
  if (dropdown) dropdown.classList.remove("active");
}
document.addEventListener("click", (e) => {
  const widget = document.getElementById("userAccountWidget");
  if (widget && !widget.contains(e.target)) {
    closeAccountDropdown();
  }
});
function triggerHeaderAvatarChange() {
  closeAccountDropdown();
  const input = document.getElementById("headerAvatarInput");
  if (input) input.click();
}

// ==========================================
// CẮT ẢNH ĐẠI DIỆN (AVATAR CROPPER) - Section 5
// ==========================================
const cropState = {
  naturalW: 0,
  naturalH: 0,
  zoom: 1,
  dx: 0,
  dy: 0,
  dragging: false,
  startX: 0,
  startY: 0,
  startDx: 0,
  startDy: 0,
  containerSize: 260,
};

// Nhận ảnh từ ô chọn file (header hoặc settings) rồi mở popup cắt ảnh
function handleAvatarFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => openAvatarCropper(e.target.result);
  reader.readAsDataURL(file);
  event.target.value = "";
}

function openAvatarCropper(dataUrl) {
  cropState.zoom = 1;
  cropState.dx = 0;
  cropState.dy = 0;
  document.getElementById("cropZoomRange").value = 100;

  const img = document.getElementById("cropImage");
  img.onload = () => {
    cropState.naturalW = img.naturalWidth;
    cropState.naturalH = img.naturalHeight;
    cropState.dx = 0;
    cropState.dy = 0;
    updateCropTransform();
  };
  img.src = dataUrl;

  document.getElementById("avatarCropOverlay").classList.add("active");
  attachCropDragHandlers();
}

function closeAvatarCropper() {
  document.getElementById("avatarCropOverlay").classList.remove("active");
}

function getCropBaseScale() {
  return Math.max(
    cropState.containerSize / cropState.naturalW,
    cropState.containerSize / cropState.naturalH,
  );
}

function updateCropTransform() {
  cropState.zoom = document.getElementById("cropZoomRange").value / 100;
  const scale = getCropBaseScale() * cropState.zoom;
  const dispW = cropState.naturalW * scale;
  const dispH = cropState.naturalH * scale;

  const minDx = cropState.containerSize - dispW;
  const minDy = cropState.containerSize - dispH;
  cropState.dx = Math.min(0, Math.max(minDx, cropState.dx));
  cropState.dy = Math.min(0, Math.max(minDy, cropState.dy));

  const img = document.getElementById("cropImage");
  img.style.width = dispW + "px";
  img.style.height = dispH + "px";
  img.style.transform = `translate(${cropState.dx}px, ${cropState.dy}px)`;
}

function attachCropDragHandlers() {
  const container = document.getElementById("cropContainer");
  if (container.dataset.bound === "true") return;
  container.dataset.bound = "true";

  const start = (clientX, clientY) => {
    cropState.dragging = true;
    cropState.startX = clientX;
    cropState.startY = clientY;
    cropState.startDx = cropState.dx;
    cropState.startDy = cropState.dy;
    container.style.cursor = "grabbing";
  };
  const move = (clientX, clientY) => {
    if (!cropState.dragging) return;
    cropState.dx = cropState.startDx + (clientX - cropState.startX);
    cropState.dy = cropState.startDy + (clientY - cropState.startY);
    updateCropTransform();
  };
  const end = () => {
    cropState.dragging = false;
    container.style.cursor = "grab";
  };

  container.addEventListener("mousedown", (e) => start(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => move(e.clientX, e.clientY));
  window.addEventListener("mouseup", end);

  container.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    },
    { passive: true },
  );
  container.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0];
      move(t.clientX, t.clientY);
      e.preventDefault();
    },
    { passive: false },
  );
  container.addEventListener("touchend", end);
}

function saveCroppedAvatar() {
  const scale = getCropBaseScale() * cropState.zoom;
  const sx = -cropState.dx / scale;
  const sy = -cropState.dy / scale;
  const sSize = cropState.containerSize / scale;

  const canvas = document.createElement("canvas");
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  const img = document.getElementById("cropImage");
  ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 300, 300);

  persistUserAvatar(canvas.toDataURL("image/jpeg", 0.9));
  closeAvatarCropper();
  showToast("Đã cập nhật ảnh đại diện!", "success");
}

function persistUserAvatar(dataUrl) {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;
  const dataKey = "accountData_" + currentUser;
  let accData = JSON.parse(localStorage.getItem(dataKey)) || {};
  accData.avatar = dataUrl;
  localStorage.setItem(dataKey, JSON.stringify(accData));

  loadUserHeaderProfile();
  loadUserSettings();
  loadMessengerConversations();
}

// ==========================================
// TÌM KIẾM TÀI KHOẢN & KẾT BẠN
// ==========================================
function searchUser() {
  const keyword = document
    .getElementById("searchFriendInput")
    .value.trim()
    .toLowerCase();
  const resultBox = document.getElementById("searchResultBox");
  const currentUser = sessionStorage.getItem("currentUser");

  if (!keyword) {
    resultBox.innerHTML = "";
    loadMessengerConversations();
    return;
  }

  if (keyword === currentUser.toLowerCase()) {
    resultBox.innerHTML = `<span style="color: #ff453a;">Không thể tìm chính bạn!</span>`;
    return;
  }

  let foundUser = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("account_")) {
      const uname = key.replace("account_", "");
      if (uname.toLowerCase() === keyword) {
        foundUser = uname;
        break;
      }
    }
  }

  if (foundUser) {
    resultBox.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(48,209,88,0.1); padding: 8px 12px; border-radius: 8px; border: 1px solid #30d158;">
        <span>👤 <b>${foundUser}</b></span>
        <button class="btn-primary" style="padding: 5px 10px; font-size: 11px;" onclick="startChatWithUser('${foundUser}')">Nhắn tin ngay</button>
      </div>
    `;
  } else {
    resultBox.innerHTML = `<span style="color: var(--text-muted);">Không tìm thấy tài khoản</span>`;
  }
}

function startChatWithUser(friendName) {
  const currentUser = sessionStorage.getItem("currentUser");
  const friendsKey = "friends_" + currentUser;
  let friends = JSON.parse(localStorage.getItem(friendsKey)) || [];

  if (!friends.includes(friendName)) {
    friends.push(friendName);
    localStorage.setItem(friendsKey, JSON.stringify(friends));
  }

  document.getElementById("searchResultBox").innerHTML = "";
  document.getElementById("searchFriendInput").value = "";
  loadMessengerConversations();
  openChatWith(friendName);
}

// ==========================================
// QUẢN LÝ ĐOẠN CHAT (MESSENGER SIDEBAR)
// ==========================================
function loadMessengerConversations() {
  const currentUser = sessionStorage.getItem("currentUser");
  const friendsKey = "friends_" + currentUser;
  let friends = JSON.parse(localStorage.getItem(friendsKey)) || [];
  const container = document.getElementById("friendList");

  if (friends.length === 0) {
    container.innerHTML = `<div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 30px;">Chưa có đoạn chat nào. Hãy tìm kiếm tên bạn bè ở trên để bắt đầu!</div>`;
    return;
  }

  container.innerHTML = "";
  friends.forEach((friend) => {
    const chatKey = getChatStorageKey(currentUser, friend);
    const messages = JSON.parse(localStorage.getItem(chatKey)) || [];
    const lastMsg =
      messages.length > 0
        ? messages[messages.length - 1].text
        : "Nhấn để bắt đầu trò chuyện...";

    const friendData =
      JSON.parse(localStorage.getItem("accountData_" + friend)) || {};
    const friendAvatar = friendData.avatar
      ? `<img src="${friendData.avatar}" alt="Avatar">`
      : friend.charAt(0).toUpperCase();

    const div = document.createElement("div");
    div.className = `conversation-item ${currentChatFriend === friend ? "active" : ""}`;
    div.innerHTML = `
      <div class="messenger-avatar-placeholder" style="width: 34px; height: 34px; font-size: 13px; font-weight: bold;">${friendAvatar}</div>
      <div class="conversation-info">
        <div class="conversation-name">${friend}</div>
        <div class="conversation-lastmsg">${lastMsg}</div>
      </div>
    `;
    div.onclick = () => openChatWith(friend);
    container.appendChild(div);
  });
}

// ==========================================
// KHUNG NHẮN TIN TRỰC TIẾP
// ==========================================
function openChatWith(friendName) {
  currentChatFriend = friendName;
  document.getElementById("chatPeerName").textContent = friendName;

  const friendData =
    JSON.parse(localStorage.getItem("accountData_" + friendName)) || {};
  const avatarHtml = friendData.avatar
    ? `<img src="${friendData.avatar}" alt="Avatar">`
    : friendName.charAt(0).toUpperCase();
  document.getElementById("chatPeerAvatar").innerHTML = avatarHtml;

  document.getElementById("chatInput").disabled = false;
  document.getElementById("sendChatBtn").disabled = false;
  loadMessengerConversations();
  loadChatMessages();
}

function getChatStorageKey(userA, userB) {
  return "chat_" + [userA, userB].sort().join("_");
}

function sendChatMessage() {
  const inputElem = document.getElementById("chatInput");
  const text = inputElem.value.trim();
  if (!text || !currentChatFriend) return;

  const currentUser = sessionStorage.getItem("currentUser");
  const chatKey = getChatStorageKey(currentUser, currentChatFriend);

  let messages = JSON.parse(localStorage.getItem(chatKey)) || [];
  messages.push({ sender: currentUser, text: text, time: Date.now() });

  localStorage.setItem(chatKey, JSON.stringify(messages));
  inputElem.value = "";
  loadChatMessages();
  loadMessengerConversations();
}

function loadChatMessages() {
  if (!currentChatFriend) return;
  const currentUser = sessionStorage.getItem("currentUser");
  const chatKey = getChatStorageKey(currentUser, currentChatFriend);
  const messages = JSON.parse(localStorage.getItem(chatKey)) || [];

  const area = document.getElementById("chatMessagesArea");
  area.innerHTML = "";

  if (messages.length === 0) {
    area.innerHTML = `<div style="color: var(--text-muted); text-align: center; margin: auto;">Chưa có tin nhắn nào. Gửi lời chào ngay!</div>`;
    return;
  }

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className =
      msg.sender === currentUser ? "chat-bubble-me" : "chat-bubble-friend";
    div.textContent = msg.text;
    area.appendChild(div);
  });
  area.scrollTop = area.scrollHeight;
}

setInterval(() => {
  if (
    currentChatFriend &&
    sessionStorage.getItem("itDashboardLogged") === "true"
  ) {
    loadChatMessages();
    loadMessengerConversations();
  }
}, 2000);

// ==========================================
// AUTHENTICATION & QUẢN LÝ TÀI KHOẢN
// ==========================================
let isLoginMode = true;
let loginStartTime = null;
let usageTimerInterval = null;

window.addEventListener("DOMContentLoaded", () => {
  updateOnlineStatusDisplay();

  // Tự động đăng nhập lại nếu còn phiên "Ghi nhớ đăng nhập" (30 ngày) hợp lệ,
  // kể cả khi đã đóng hẳn trình duyệt (sessionStorage của tab cũ đã mất).
  if (sessionStorage.getItem("itDashboardLogged") !== "true") {
    const remembered = JSON.parse(localStorage.getItem("rememberedSession"));
    if (remembered && remembered.expiresAt > Date.now()) {
      sessionStorage.setItem("itDashboardLogged", "true");
      sessionStorage.setItem("currentUser", remembered.user);
    } else if (remembered) {
      localStorage.removeItem("rememberedSession"); // hết hạn 30 ngày
    }
  }

  if (sessionStorage.getItem("itDashboardLogged") === "true") {
    document.getElementById("loginOverlay").style.display = "none";
    loginStartTime =
      parseInt(sessionStorage.getItem("loginStartTime")) || Date.now();
    updateAccountHeaderUI();
    startUsageTracking();
    loadUserSettings();
    loadUserHeaderProfile();
    loadMessengerConversations();
    renderTaskBoard();
    renderYtLists();
    renderSpotifyLists();
    initDashboardAndQuiz();
  } else {
    // "Ghi nhớ đăng nhập": điền sẵn tên tài khoản lần đăng nhập trước
    const remembered = localStorage.getItem("rememberedUsername");
    if (remembered) {
      document.getElementById("authUsername").value = remembered;
      document.getElementById("rememberMeCheckbox").checked = true;
    }
  }
});

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const authBtnText = document.getElementById("authBtnText");
  const switchBtn = document.getElementById("authSwitchBtn");
  const authTitle = document.getElementById("authTitle");
  const emailField = document.getElementById("authEmailWrapper");
  document.getElementById("authError").style.display = "none";

  if (!isLoginMode) {
    authTitle.textContent = "ĐĂNG KÝ TÀI KHOẢN MỚI";
    authTitle.style.display = "block";
    authBtnText.textContent = "Đăng Ký";
    switchBtn.textContent = "Đã có tài khoản? Đăng nhập ngay";
    if (emailField) emailField.style.display = "block";
  } else {
    authTitle.style.display = "none";
    authBtnText.textContent = "Đăng Nhập";
    switchBtn.textContent = "Đăng ký tài khoản mới";
    if (emailField) emailField.style.display = "none";
  }
  validateAuthForm();
}

// Kiểm tra hợp lệ theo thời gian thực khi người dùng đang gõ
function checkPasswordStrength(pass) {
  const missing = [];
  if (pass.length < 8) missing.push("ít nhất 8 ký tự");
  if (!/[A-Z]/.test(pass)) missing.push("1 chữ hoa");
  if (!/[a-z]/.test(pass)) missing.push("1 chữ thường");
  if (!/[0-9]/.test(pass)) missing.push("1 chữ số");
  if (!/[^A-Za-z0-9]/.test(pass)) missing.push("1 ký tự đặc biệt");
  return missing;
}

function validateAuthForm() {
  const user = document.getElementById("authUsername").value.trim();
  const pass = document.getElementById("authPassword").value.trim();
  const userErr = document.getElementById("usernameError");
  const passErr = document.getElementById("passwordError");
  const emailErr = document.getElementById("emailError");
  let valid = true;

  if (user.length > 0 && user.length < 3) {
    userErr.textContent = "Tên tài khoản cần ít nhất 3 ký tự";
    valid = false;
  } else {
    userErr.textContent = "";
  }

  if (!isLoginMode) {
    const emailInput = document.getElementById("authEmail");
    const email = emailInput ? emailInput.value.trim() : "";
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailErr.textContent = "Email không hợp lệ";
      valid = false;
    } else {
      emailErr.textContent = "";
    }

    if (pass.length > 0) {
      const missing = checkPasswordStrength(pass);
      if (missing.length > 0) {
        passErr.textContent = "Mật khẩu cần thêm: " + missing.join(", ");
        valid = false;
      } else {
        passErr.textContent = "";
      }
    }
  } else {
    if (pass.length > 0 && pass.length < 4) {
      passErr.textContent = "Mật khẩu cần ít nhất 4 ký tự";
      valid = false;
    } else {
      passErr.textContent = "";
    }
  }
  return valid;
}

function togglePasswordVisibility() {
  const pwInput = document.getElementById("authPassword");
  const icon = document.getElementById("pwToggleIcon");
  if (pwInput.type === "password") {
    pwInput.type = "text";
    icon.textContent = "🙈";
  } else {
    pwInput.type = "password";
    icon.textContent = "👁️";
  }
}

// Hiệu ứng Ripple khi bấm nút đăng nhập/đăng ký
function createRipple(event) {
  const button = event.currentTarget;
  const oldRipple = button.querySelector(".ripple");
  if (oldRipple) oldRipple.remove();

  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const rect = button.getBoundingClientRect();
  const circle = document.createElement("span");
  circle.className = "ripple";
  circle.style.width = circle.style.height = diameter + "px";
  circle.style.left = event.clientX - rect.left - diameter / 2 + "px";
  circle.style.top = event.clientY - rect.top - diameter / 2 + "px";
  button.appendChild(circle);
}

function setAuthLoading(isLoading) {
  const btn = document.getElementById("authBtn");
  const btnText = document.getElementById("authBtnText");
  const spinner = document.getElementById("authBtnSpinner");
  if (!btn) return;
  btn.disabled = isLoading;
  if (spinner) spinner.style.display = isLoading ? "inline-block" : "none";
  if (btnText) {
    btnText.style.opacity = isLoading ? "0.6" : "1";
  }
}

// Quên mật khẩu: vì ứng dụng không có backend/email, cho phép đặt lại
// mật khẩu trực tiếp ngay trên trình duyệt (dữ liệu vẫn chỉ lưu local).
function handleForgotPassword() {
  const user = prompt("Nhập tên tài khoản cần khôi phục mật khẩu:");
  if (!user) return;

  const userKey = "account_" + user.trim();
  if (!localStorage.getItem(userKey)) {
    alert("Không tìm thấy tài khoản này!");
    return;
  }

  const newPass = prompt("Nhập mật khẩu mới cho tài khoản '" + user + "':");
  if (!newPass || newPass.trim().length < 4) {
    alert("Mật khẩu mới cần ít nhất 4 ký tự!");
    return;
  }

  localStorage.setItem(userKey, newPass.trim());
  alert("Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.");
}

// ---- Mã hóa mật khẩu bằng SHA-256 thật (Web Crypto API, không phải giả lập) ----
async function sha256Hash(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function looksLikeSha256(str) {
  return /^[a-f0-9]{64}$/i.test(str || "");
}

// ---- Nhận diện thiết bị/trình duyệt cơ bản từ userAgent ----
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let os = "Không xác định";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Không xác định";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  return `${browser} trên ${os}`;
}

// ---- Lịch sử đăng nhập ----
function recordLoginHistory(user) {
  const key = "loginHistory_" + user;
  let history = JSON.parse(localStorage.getItem(key)) || [];
  history.unshift({ time: Date.now(), device: getDeviceInfo() });
  history = history.slice(0, 10);
  localStorage.setItem(key, JSON.stringify(history));
}
function getLoginHistory(user) {
  return JSON.parse(localStorage.getItem("loginHistory_" + user)) || [];
}

// Hoàn tất phiên đăng nhập: dùng chung cho đăng nhập thường và sau khi xác thực OTP đăng ký
function completeLoginSession(user, rememberMe) {
  sessionStorage.setItem("itDashboardLogged", "true");
  sessionStorage.setItem("currentUser", user);

  const dataKey = "accountData_" + user;
  if (!localStorage.getItem(dataKey)) {
    localStorage.setItem(
      dataKey,
      JSON.stringify({ avatar: "", cover: "", bio: "" }),
    );
  }

  // "Ghi nhớ đăng nhập 30 ngày" + tự động đăng nhập khi mở lại trình duyệt
  if (rememberMe) {
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem(
      "rememberedSession",
      JSON.stringify({ user, expiresAt }),
    );
    localStorage.setItem("rememberedUsername", user);
  } else {
    localStorage.removeItem("rememberedSession");
    localStorage.removeItem("rememberedUsername");
  }

  recordLoginHistory(user);

  loginStartTime = Date.now();
  sessionStorage.setItem("loginStartTime", loginStartTime);

  const overlay = document.getElementById("loginOverlay");
  overlay.classList.add("login-success-flash");
  setTimeout(() => {
    overlay.style.display = "none";
    overlay.classList.remove("login-success-flash");
  }, 400);

  updateAccountHeaderUI();
  startUsageTracking();
  loadUserSettings();
  loadUserHeaderProfile();
  loadMessengerConversations();
  renderTaskBoard();
  renderYtLists();
  renderSpotifyLists();
  initDashboardAndQuiz();
  updateOnlineStatusDisplay();
  showToast("Đăng nhập thành công! Chào mừng " + user, "success");
}

let pendingRegistration = null;

function handleAuth() {
  const user = document.getElementById("authUsername").value.trim();
  const pass = document.getElementById("authPassword").value.trim();
  const errorMsg = document.getElementById("authError");
  const rememberMe = document.getElementById("rememberMeCheckbox").checked;

  if (!user || !pass) {
    errorMsg.textContent = "Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!";
    errorMsg.style.display = "block";
    return;
  }

  if (!validateAuthForm()) {
    errorMsg.textContent = "Vui lòng kiểm tra lại thông tin nhập!";
    errorMsg.style.display = "block";
    return;
  }

  const userKey = "account_" + user;
  const dataKey = "accountData_" + user;
  const totalTimeKey = "totalUsageTime_" + user;

  setAuthLoading(true);

  // Giả lập thời gian xử lý để hiệu ứng loading hiển thị mượt mà
  setTimeout(async () => {
    if (isLoginMode) {
      const savedValue = localStorage.getItem(userKey);
      let passwordOk = false;

      if (savedValue) {
        if (looksLikeSha256(savedValue)) {
          const enteredHash = await sha256Hash(pass);
          passwordOk = enteredHash === savedValue;
        } else {
          // Tài khoản cũ còn lưu mật khẩu dạng plain-text (trước khi có SHA-256) —
          // vẫn cho đăng nhập được, đồng thời tự nâng cấp sang lưu hash ngay lập tức.
          passwordOk = savedValue === pass;
          if (passwordOk) {
            localStorage.setItem(userKey, await sha256Hash(pass));
          }
        }
      }

      if (passwordOk) {
        completeLoginSession(user, rememberMe);
      } else {
        errorMsg.textContent = "Tên tài khoản hoặc mật khẩu không chính xác!";
        errorMsg.style.display = "block";
      }
      setAuthLoading(false);
    } else {
      const email = document.getElementById("authEmail").value.trim();
      if (localStorage.getItem(userKey)) {
        errorMsg.textContent =
          "Tên tài khoản này đã được sử dụng bởi người khác. Vui lòng chọn tên khác!";
        errorMsg.style.display = "block";
        setAuthLoading(false);
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMsg.textContent = "Vui lòng nhập email hợp lệ!";
        errorMsg.style.display = "block";
        setAuthLoading(false);
        return;
      }

      // Lưu tạm thông tin đăng ký, chờ xác thực OTP giả lập trước khi tạo tài khoản thật
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      pendingRegistration = {
        user,
        email,
        pass,
        otpCode,
        totalTimeKey,
        dataKey,
      };

      document.getElementById("otpDisplayHint").textContent = otpCode;
      document.getElementById("otpInput").value = "";
      document.getElementById("otpError").textContent = "";
      document.getElementById("otpModalOverlay").classList.add("active");
      setAuthLoading(false);
    }
  }, 600);
}

function closeOtpModal() {
  document.getElementById("otpModalOverlay").classList.remove("active");
  pendingRegistration = null;
}

async function verifyOtpAndRegister() {
  if (!pendingRegistration) return;
  const entered = document.getElementById("otpInput").value.trim();
  const otpError = document.getElementById("otpError");

  if (entered !== pendingRegistration.otpCode) {
    otpError.textContent = "Mã OTP không đúng, vui lòng thử lại!";
    return;
  }

  const { user, email, pass, totalTimeKey, dataKey } = pendingRegistration;
  const userKey = "account_" + user;

  const hashedPass = await sha256Hash(pass);
  localStorage.setItem(userKey, hashedPass);
  localStorage.setItem(totalTimeKey, 0);
  localStorage.setItem(
    dataKey,
    JSON.stringify({ avatar: "", cover: "", bio: "", email }),
  );

  document.getElementById("otpModalOverlay").classList.remove("active");
  showToast("Đăng ký thành công! Đang đăng nhập...", "success");

  const rememberMe = document.getElementById("rememberMeCheckbox").checked;
  pendingRegistration = null;
  completeLoginSession(user, rememberMe);
  toggleAuthMode();
}

// ---- Trạng thái Online/Offline thật (dùng navigator.onLine + sự kiện trình duyệt) ----
function updateOnlineStatusDisplay() {
  const dot = document.getElementById("onlineStatusDot");
  if (!dot) return;
  if (navigator.onLine) {
    dot.classList.remove("offline");
    dot.title = "Đang hoạt động (online)";
  } else {
    dot.classList.add("offline");
    dot.title = "Mất kết nối mạng (offline)";
  }
}
window.addEventListener("online", updateOnlineStatusDisplay);
window.addEventListener("offline", updateOnlineStatusDisplay);

function saveCurrentSessionTime() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (currentUser && loginStartTime) {
    const sessionDurationSec = Math.floor((Date.now() - loginStartTime) / 1000);
    const totalTimeKey = "totalUsageTime_" + currentUser;
    const prevTotal = parseInt(localStorage.getItem(totalTimeKey)) || 0;

    localStorage.setItem(totalTimeKey, prevTotal + sessionDurationSec);
    loginStartTime = Date.now();
    sessionStorage.setItem("loginStartTime", loginStartTime);
  }
}

function updateAccountHeaderUI() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  const totalTimeKey = "totalUsageTime_" + currentUser;
  const totalSec = parseInt(localStorage.getItem(totalTimeKey)) || 0;
  const totalMins = Math.floor(totalSec / 60);

  const timeElem = document.getElementById("displayUsageTime");
  if (timeElem) timeElem.textContent = `⏱️ Tổng: ${totalMins} phút`;
}

function startUsageTracking() {
  if (usageTimerInterval) clearInterval(usageTimerInterval);
  usageTimerInterval = setInterval(() => {
    saveCurrentSessionTime();
    updateAccountHeaderUI();
  }, 30000);
}

function switchAccount() {
  saveCurrentSessionTime();
  if (usageTimerInterval) clearInterval(usageTimerInterval);
  sessionStorage.clear();
  // Đăng xuất chủ động luôn kết thúc phiên "Ghi nhớ đăng nhập", để tránh
  // tự động đăng nhập lại ngay sau khi người dùng đã cố ý đăng xuất.
  localStorage.removeItem("rememberedSession");
  document.getElementById("loginOverlay").style.display = "flex";
}

// Điều hướng Tab & Viên thuốc trượt 5 tab
const tabBtns = document.querySelectorAll(".tab-btn");
const pillIndicator = document.querySelector(".pill-indicator");

tabBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const targetTab = btn.dataset.tab;
    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-".concat(targetTab)).classList.add("active");

    // Tự động load lại cài đặt và avatar khi bấm vào tab cài đặt
    if (targetTab === "settings") {
      loadUserSettings();
    }

    if (pillIndicator) {
      pillIndicator.style.transform = `translateX(${index * 100}%)`;
    }
  });
});

// ==========================================
// IDE LẬP TRÌNH NHÚNG TRỰC TIẾP
// ==========================================
function switchCompilerLanguage() {
  const lang = document.getElementById("langSelect").value;
  const iframe = document.getElementById("compilerIframe");
  if (iframe) {
    iframe.src = `https://onecompiler.com/embed/${lang}?theme=dark`;
  }
}

// ==========================================
// TÍNH NĂNG SPOTIFY: TÌM KIẾM HOẶC DÁN LINK BÀI HÁT
// ==========================================
// ==========================================
// TÍNH NĂNG SPOTIFY: TÌM KIẾM/PHÁT + LỊCH SỬ + YÊU THÍCH (Section 4)
// ==========================================
// Ghi chú: Spotify Embed công khai không cho phép điều khiển volume/shuffle/
// repeat từ bên ngoài một cách ổn định (iFrame API chính thức của Spotify
// từng bị lỗi và bị cộng đồng report là không đáng tin cậy). Vì vậy phần
// dưới tập trung vào những gì Embed làm tốt và ổn định: phát nhạc, lưu lịch
// sử nghe gần đây và danh sách yêu thích ngay trên giao diện.
let currentSpotifyEntry = null;

function spotifyStorageKey(kind) {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return `spotify${kind}_${currentUser}`;
}
function getSpotifyList(kind) {
  return JSON.parse(localStorage.getItem(spotifyStorageKey(kind))) || [];
}
function saveSpotifyList(kind, list) {
  localStorage.setItem(spotifyStorageKey(kind), JSON.stringify(list));
}

function searchSpotifyMusic() {
  const input = document.getElementById("spotifySearchInput").value.trim();
  if (!input) return;

  let spotifyUri = "";
  let label = input;
  const match = input.match(/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    spotifyUri = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  } else {
    spotifyUri =
      "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0";
    label = "Lofi mặc định";
    alert(
      "Spotify yêu cầu dán chính xác link bài hát/playlist từ ứng dụng Spotify để phát trực tiếp!",
    );
  }

  currentSpotifyEntry = { uri: spotifyUri, label };
  renderSpotifyFrame(spotifyUri);

  let history = getSpotifyList("History").filter((h) => h.uri !== spotifyUri);
  history.unshift(currentSpotifyEntry);
  history = history.slice(0, 15);
  saveSpotifyList("History", history);
  renderSpotifyLists();
}

function renderSpotifyFrame(uri) {
  document.getElementById("spotifyFrameContainer").innerHTML = `
    <iframe id="spotifyIframe" style="border-radius:12px" src="${uri}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
  `;
}

function playSpotifyEntry(uri, label) {
  currentSpotifyEntry = { uri, label };
  renderSpotifyFrame(uri);
}

function toggleSpotifyFavorite() {
  if (!currentSpotifyEntry) {
    showToast(
      "Hãy phát một bài hát/playlist trước khi lưu yêu thích!",
      "warning",
    );
    return;
  }
  let favorites = getSpotifyList("Favorites");
  const exists = favorites.find((f) => f.uri === currentSpotifyEntry.uri);
  if (exists) {
    favorites = favorites.filter((f) => f.uri !== currentSpotifyEntry.uri);
    showToast("Đã bỏ yêu thích", "info");
  } else {
    favorites.unshift(currentSpotifyEntry);
    showToast("Đã lưu vào yêu thích", "success");
  }
  saveSpotifyList("Favorites", favorites);
  renderSpotifyLists();
}

function spotifyChipHtml(entry) {
  const safeLabel = (entry.label || "Spotify").slice(0, 28).replace(/'/g, "");
  const safeUri = entry.uri.replace(/'/g, "");
  return `<button class="spotify-chip" onclick="playSpotifyEntry('${safeUri}', '${safeLabel}')">🎵 ${safeLabel}</button>`;
}

function renderSpotifyLists() {
  const historyEl = document.getElementById("spotifyHistoryChips");
  const favEl = document.getElementById("spotifyFavoriteChips");
  if (!historyEl || !favEl) return;

  const history = getSpotifyList("History");
  historyEl.innerHTML = history.length
    ? history.map(spotifyChipHtml).join("")
    : `<span class="yt-empty" style="padding: 0;">Chưa có lịch sử nghe.</span>`;

  const favorites = getSpotifyList("Favorites");
  favEl.innerHTML = favorites.length
    ? favorites.map(spotifyChipHtml).join("")
    : `<span class="yt-empty" style="padding: 0;">Chưa có mục yêu thích.</span>`;
}

// ==========================================
// YOUTUBE: TÌM KIẾM, LỊCH SỬ, YÊU THÍCH, PLAYLIST CÁ NHÂN (Section 3)
// ==========================================
let currentPlaylist = [];
let currentPlaylistIndex = 0;
let videoMetaCache = {};

function loginGoogleAccount() {
  let isGoogleLogged = localStorage.getItem("googleLoggedIn") === "true";
  if (!isGoogleLogged) {
    let email = prompt("Nhập Gmail tài khoản Google để đồng bộ YouTube:");
    if (email && email.includes("@")) {
      localStorage.setItem("googleLoggedIn", "true");
      localStorage.setItem("googleEmail", email);
      document.getElementById("googleAuthBtn").textContent =
        `✅ Google: ${email}`;
      alert("Đăng nhập Google thành công: " + email);
    } else if (email) {
      alert("Email không hợp lệ!");
    }
  } else {
    if (confirm("Bạn muốn đăng xuất tài khoản Google khỏi YouTube không?")) {
      localStorage.removeItem("googleLoggedIn");
      localStorage.removeItem("googleEmail");
      document.getElementById("googleAuthBtn").textContent =
        "🌐 Đăng nhập Tài khoản Google";
      alert("Đã đăng xuất tài khoản Google.");
    }
  }
}

// ---------- Lưu trữ: lịch sử / yêu thích / playlist cá nhân ----------
function ytStorageKey(kind) {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return `yt${kind}_${currentUser}`;
}
function getYtList(kind) {
  return JSON.parse(localStorage.getItem(ytStorageKey(kind))) || [];
}
function saveYtList(kind, list) {
  localStorage.setItem(ytStorageKey(kind), JSON.stringify(list));
}
function cacheVideoMeta(video) {
  videoMetaCache[video.id] = video;
}
function getVideoMeta(id) {
  return (
    videoMetaCache[id] || {
      id,
      title: "Video đã lưu",
      channel: "",
      thumb: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    }
  );
}

function addToYtHistory(video) {
  let list = getYtList("History").filter((v) => v.id !== video.id);
  list.unshift({ ...video, viewedAt: Date.now() });
  list = list.slice(0, 30);
  saveYtList("History", list);
  renderYtLists();
}

function isYtFavorite(id) {
  return getYtList("Favorites").some((v) => v.id === id);
}
function toggleYtFavorite(id) {
  const video = getVideoMeta(id);
  let list = getYtList("Favorites");
  if (list.find((v) => v.id === id)) {
    list = list.filter((v) => v.id !== id);
    showToast("Đã bỏ yêu thích", "info");
  } else {
    list.unshift(video);
    showToast("Đã thêm vào yêu thích", "success");
  }
  saveYtList("Favorites", list);
  renderYtLists();
}

function isInYtPlaylist(id) {
  return getYtList("Playlist").some((v) => v.id === id);
}
function toggleYtPlaylist(id) {
  const video = getVideoMeta(id);
  let list = getYtList("Playlist");
  if (list.find((v) => v.id === id)) {
    list = list.filter((v) => v.id !== id);
    showToast("Đã xóa khỏi playlist", "info");
  } else {
    list.push(video);
    showToast("Đã thêm vào playlist cá nhân", "success");
  }
  saveYtList("Playlist", list);
  renderYtLists();
}

function removeFromYtHistory(id) {
  saveYtList(
    "History",
    getYtList("History").filter((v) => v.id !== id),
  );
  renderYtLists();
}

// ---------- Render: hàng video dùng chung cho lịch sử/yêu thích/playlist ----------
function renderYtVideoRow(video, kind) {
  const fav = isYtFavorite(video.id);
  const inPlaylist = isInYtPlaylist(video.id);
  return `
    <div class="yt-video-row">
      <img src="${video.thumb}" alt="thumb" onclick="playSearchedVideo('${video.id}')">
      <div class="yt-video-info" onclick="playSearchedVideo('${video.id}')">
        <div class="yt-video-title" title="${video.title}">${video.title}</div>
        <div class="yt-video-sub">${[video.channel, video.duration, video.views].filter(Boolean).join(" • ")}</div>
      </div>
      <div class="yt-video-actions">
        <span class="yt-icon-btn ${fav ? "active" : ""}" onclick="toggleYtFavorite('${video.id}')" title="Yêu thích">⭐</span>
        <span class="yt-icon-btn ${inPlaylist ? "active" : ""}" onclick="toggleYtPlaylist('${video.id}')" title="Thêm vào playlist">${inPlaylist ? "✅" : "➕"}</span>
        ${kind === "history" ? `<span class="yt-icon-btn" onclick="removeFromYtHistory('${video.id}')" title="Xóa khỏi lịch sử">🗑</span>` : ""}
      </div>
    </div>`;
}

function renderYtLists() {
  const historyEl = document.getElementById("ytHistoryList");
  const favEl = document.getElementById("ytFavoritesList");
  const playlistEl = document.getElementById("ytPlaylistList");
  if (!historyEl || !favEl || !playlistEl) return;

  const history = getYtList("History");
  historyEl.innerHTML = history.length
    ? history.map((v) => renderYtVideoRow(v, "history")).join("")
    : `<div class="yt-empty">Chưa có lịch sử xem nào.</div>`;

  const favorites = getYtList("Favorites");
  favEl.innerHTML = favorites.length
    ? favorites.map((v) => renderYtVideoRow(v, "favorites")).join("")
    : `<div class="yt-empty">Chưa có video yêu thích nào.</div>`;

  const playlist = getYtList("Playlist");
  playlistEl.innerHTML = playlist.length
    ? playlist.map((v) => renderYtVideoRow(v, "playlist")).join("")
    : `<div class="yt-empty">Playlist cá nhân trống.</div>`;
}

// ---------- Chuyển đổi giữa Tìm kiếm / Lịch sử / Yêu thích / Playlist ----------
function switchYtView(view) {
  document
    .querySelectorAll(".yt-subtab-btn")
    .forEach((b) => b.classList.remove("active"));
  const activeBtn = document.querySelector(
    `.yt-subtab-btn[data-ytview="${view}"]`,
  );
  if (activeBtn) activeBtn.classList.add("active");

  const searchResults = document.getElementById("searchResults");
  searchResults.style.display =
    view === "search" && searchResults.innerHTML.trim() ? "grid" : "none";
  document.getElementById("ytHistoryList").style.display =
    view === "history" ? "flex" : "none";
  document.getElementById("ytFavoritesList").style.display =
    view === "favorites" ? "flex" : "none";
  document.getElementById("ytPlaylistList").style.display =
    view === "playlist" ? "flex" : "none";

  if (view !== "search") renderYtLists();
}

// ---------- Định dạng thời lượng & lượt xem ----------
function formatISODuration(iso) {
  const match = (iso || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  const parts = [];
  if (h) parts.push(h);
  parts.push(h ? String(m).padStart(2, "0") : String(m));
  parts.push(String(s).padStart(2, "0"));
  return parts.join(":");
}
function formatViewCount(numStr) {
  const n = parseInt(numStr || "0");
  if (n >= 1000000)
    return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "Tr lượt xem";
  if (n >= 1000)
    return (n / 1000).toFixed(1).replace(/\.0$/, "") + "N lượt xem";
  return n + " lượt xem";
}

// ---------- Phát video + ghi lịch sử ----------
function playVideoId(id) {
  const placeholder = document.getElementById("playerPlaceholder");
  if (placeholder) placeholder.style.display = "none";

  const box = document.getElementById("playerBox");
  box.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>`;

  addToYtHistory(getVideoMeta(id));
}

function playSearchedVideo(id) {
  if (!currentPlaylist.includes(id)) {
    currentPlaylist.push(id);
  }
  currentPlaylistIndex = currentPlaylist.indexOf(id);
  playVideoId(id);
}

function nextTrack() {
  if (currentPlaylist.length === 0) {
    alert("Chưa có danh sách phát! Hãy tìm kiếm một video trước.");
    return;
  }
  currentPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
  playVideoId(currentPlaylist[currentPlaylistIndex]);
}

function prevTrack() {
  if (currentPlaylist.length === 0) {
    alert("Chưa có danh sách phát! Hãy tìm kiếm một video trước.");
    return;
  }
  currentPlaylistIndex =
    (currentPlaylistIndex - 1 + currentPlaylist.length) %
    currentPlaylist.length;
  playVideoId(currentPlaylist[currentPlaylistIndex]);
}

async function handleYouTubeAction() {
  const input = document.getElementById("ytInput").value.trim();
  const resultsDiv = document.getElementById("searchResults");
  if (!input) return;

  switchYtView("search");

  const m = input.match(
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  if (m) {
    resultsDiv.style.display = "none";
    playSearchedVideo(m[1]);
    return;
  }

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--accent);">Đang tìm kiếm: "${input}"...</div>`;

  const ytApiKey = getYtApiKey();
  if (!ytApiKey) {
    resultsDiv.innerHTML = `
      <div style="padding: 15px; text-align: center; color: #ff453a; border: 1px solid #ff453a; border-radius: 12px; margin-bottom: 10px;">
        <b>Lỗi: Thiếu YouTube API Key!</b><br>
        <span style="font-size: 12px; color: var(--text-muted);">Vào tab ⚙️ Cài Đặt và dán API Key cá nhân của bạn.</span>
      </div>`;
    return;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(input)}&type=video&key=${ytApiKey}`,
    );
    const data = await response.json();

    if (data.error) {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi API: ${data.error.message}</div>`;
      return;
    }

    if (data.items && data.items.length > 0) {
      const videoIds = data.items.map((item) => item.id.videoId);

      // Gọi thêm videos.list để lấy thời lượng & lượt xem cho từng video
      let detailsMap = {};
      try {
        const detailsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds.join(",")}&key=${ytApiKey}`,
        );
        const detailsData = await detailsRes.json();
        (detailsData.items || []).forEach((d) => {
          detailsMap[d.id] = {
            duration: formatISODuration(d.contentDetails.duration),
            views: formatViewCount(d.statistics.viewCount),
          };
        });
      } catch (e) {
        // Nếu lỗi khi lấy chi tiết, vẫn hiển thị kết quả tìm kiếm cơ bản
      }

      resultsDiv.style.display = "grid";
      resultsDiv.innerHTML = "";

      currentPlaylist = videoIds;
      currentPlaylistIndex = 0;

      data.items.forEach((item) => {
        const vid = item.id.videoId;
        const title = item.snippet.title;
        const channel = item.snippet.channelTitle;
        const thumb = item.snippet.thumbnails.medium.url;
        const details = detailsMap[vid] || {};

        const video = {
          id: vid,
          title,
          channel,
          thumb,
          duration: details.duration || "",
          views: details.views || "",
        };
        cacheVideoMeta(video);

        const fav = isYtFavorite(vid);
        const inPlaylist = isInYtPlaylist(vid);

        resultsDiv.innerHTML += `
          <div class="result-item-grid" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--apple-glass-border); border-radius: 14px; overflow: hidden; transition: transform 0.2s;">
            <div onclick="playSearchedVideo('${vid}')" style="cursor: pointer;">
              <img src="${thumb}" alt="thumb" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
              ${details.duration ? `<span class="yt-duration-badge">${details.duration}</span>` : ""}
              <div class="info" style="padding: 10px 10px 6px;">
                <div class="title" style="font-size: 13px; font-weight: 500; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${title}">${title}</div>
                <div class="channel" style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${[channel, details.views].filter(Boolean).join(" • ")}</div>
              </div>
            </div>
            <div class="yt-card-actions">
              <span class="yt-icon-btn ${fav ? "active" : ""}" onclick="toggleYtFavorite('${vid}')" title="Yêu thích">⭐</span>
              <span class="yt-icon-btn ${inPlaylist ? "active" : ""}" onclick="toggleYtPlaylist('${vid}')" title="Thêm vào playlist">${inPlaylist ? "✅" : "➕"}</span>
            </div>
          </div>
        `;
      });
    } else {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Không tìm thấy video nào.</div>`;
    }
  } catch (error) {
    resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi mạng hoặc không thể kết nối tới YouTube API.</div>`;
  }
}

// ==========================================
// TÍNH NĂNG TỪ ĐIỂN - DỊCH VÀ GIẢI THÍCH CHI TIẾT
// ==========================================
async function searchDict() {
  const q = document.getElementById("dictInput").value.trim();
  const resDiv = document.getElementById("dictResult");
  if (!q) return;
  resDiv.style.display = "block";
  resDiv.textContent = "Đang phân tích và giải nghĩa chi tiết...";
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();

    let htmlResult = `<b>Dịch nghĩa:</b> <span style="color: #30d158; font-size: 16px;">${data[0][0][0]}</span>`;

    if (data[1] && data[1].length > 0) {
      htmlResult += `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--apple-glass-border);"><b>Giải thích chi tiết (Từ loại & Đồng nghĩa):</b></div>`;

      data[1].forEach((part) => {
        const partOfSpeech = part[0];
        const synonyms = part[1].join(", ");

        htmlResult += `
          <div style="margin-top: 8px; padding-left: 10px; border-left: 2px solid var(--accent);">
            <i style="color: var(--accent); font-size: 13px; text-transform: capitalize;">${partOfSpeech}</i>: 
            <span style="color: var(--text-muted);">${synonyms}</span>
          </div>`;
      });
    } else {
      htmlResult += `<div style="margin-top: 10px; font-size: 12px; color: var(--text-muted);">Hệ thống chỉ giải nghĩa chi tiết cấu trúc cho từ vựng đơn hoặc cụm từ ngắn.</div>`;
    }

    resDiv.innerHTML = htmlResult;
  } catch {
    resDiv.textContent = "Lỗi kết nối dịch thuật.";
  }
}

// ==========================================
// CÁC TÍNH NĂNG TRA CỨU KHÁC (StackOverflow, Wiki)
// ==========================================
async function searchDev() {
  const q = document.getElementById("devInput").value.trim();
  const resDiv = document.getElementById("codeResult");
  if (!q) return;
  resDiv.style.display = "block";
  resDiv.textContent = "Đang tra cứu StackOverflow...";
  try {
    const res = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(q)}&site=stackoverflow`,
    );
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      resDiv.innerHTML = data.items
        .slice(0, 4)
        .map(
          (i) =>
            `<div style="margin-bottom:8px;"><a href="${i.link}" target="_blank" style="color:var(--accent);">${i.title}</a></div>`,
        )
        .join("");
    } else {
      resDiv.textContent = "Không tìm thấy kết quả.";
    }
  } catch {
    resDiv.textContent = "Lỗi kết nối API StackOverflow.";
  }
}

async function searchStudyInfo() {
  const q = document.getElementById("studyInput").value.trim();
  const resDiv = document.getElementById("studyResult");
  if (!q) return;
  resDiv.style.display = "block";
  resDiv.textContent = "Đang tra cứu Wikipedia...";
  try {
    const res = await fetch(
      `https://vi.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`,
    );
    const data = await res.json();
    if (data.query && data.query.search.length > 0) {
      resDiv.innerHTML = data.query.search
        .slice(0, 3)
        .map(
          (i) =>
            `<div style="margin-bottom:8px;"><b>${i.title}</b>: ${i.snippet.replace(/(<([^>]+)>)/gi, "")}...</div>`,
        )
        .join("");
    } else {
      resDiv.textContent = "Không tìm thấy thông tin.";
    }
  } catch {
    resDiv.textContent = "Lỗi Wikipedia.";
  }
}

// ==========================================
// POMODORO VÀ TO-DO LIST
// ==========================================
let pomoTimer = null;
let timeLeft = 1500;
function updatePomoDisplay() {
  const el = document.getElementById("pomoTime");
  if (!el) return;
  let m = Math.floor(timeLeft / 60);
  let s = timeLeft % 60;
  el.textContent = (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
}
function applyPomoTime() {
  const input = document.getElementById("pomoInput");
  let m = input ? parseInt(input.value) || 25 : 25;
  timeLeft = m * 60;
  updatePomoDisplay();
}
function startPomodoro() {
  if (pomoTimer) return;
  pomoTimer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updatePomoDisplay();
    } else {
      clearInterval(pomoTimer);
      pomoTimer = null;
      alert("Hết giờ làm việc!");
    }
  }, 1000);
}
function pausePomodoro() {
  clearInterval(pomoTimer);
  pomoTimer = null;
}
function resetPomodoro() {
  clearInterval(pomoTimer);
  pomoTimer = null;
  applyPomoTime();
}
applyPomoTime();

// ==========================================
// QUẢN LÝ TASK / ĐỒ ÁN - BẢNG KANBAN (Section 6-12)
// ==========================================
const todoInput = document.getElementById("todoInput");

const TASK_STATUSES = ["todo", "doing", "review", "done"];
const PRIORITY_COLORS = {
  Low: "#30d158",
  Medium: "#ffd60a",
  High: "#ff9f0a",
  Critical: "#ff453a",
};
const STATUS_LABELS = {
  todo: "Cần làm",
  doing: "Đang làm",
  review: "Review",
  done: "Hoàn thành",
};

let editingTaskId = null;
let taskFormChecklistItems = [];

function getTasksStorageKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "tasks_" + currentUser;
}
function getTasks() {
  return JSON.parse(localStorage.getItem(getTasksStorageKey())) || [];
}
function saveTasks(tasks) {
  localStorage.setItem(getTasksStorageKey(), JSON.stringify(tasks));
}
function generateTaskId() {
  return "t" + Date.now() + Math.floor(Math.random() * 10000);
}

// Tạo task nhanh từ ô input phía trên bảng Kanban
function quickAddTask() {
  if (!todoInput) return;
  const name = todoInput.value.trim();
  if (!name) return;

  const tasks = getTasks();
  tasks.unshift({
    id: generateTaskId(),
    name,
    description: "",
    subject: "",
    deadline: "",
    priority: "Medium",
    status: "todo",
    color: "#0a84ff",
    icon: "📌",
    tags: [],
    checklist: [],
    github: "",
    figma: "",
    docs: "",
    notes: "",
    createdAt: Date.now(),
  });
  saveTasks(tasks);
  todoInput.value = "";
  renderTaskBoard();
  showToast("Đã tạo task: " + name, "success");
}
if (todoInput) {
  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") quickAddTask();
  });
}

// ---------- MODAL TẠO / SỬA TASK ----------
function openTaskModal(taskId = null) {
  editingTaskId = taskId;
  const overlay = document.getElementById("taskModalOverlay");
  if (!overlay) return;
  overlay.classList.add("active");
  document.getElementById("taskFormId").value = taskId || "";

  if (taskId) {
    const task = getTasks().find((t) => t.id === taskId);
    if (!task) return;
    document.getElementById("taskModalTitle").textContent = "Sửa Task";
    document.getElementById("taskFormName").value = task.name || "";
    document.getElementById("taskFormSubject").value = task.subject || "";
    document.getElementById("taskFormDesc").value = task.description || "";
    document.getElementById("taskFormDeadline").value = task.deadline || "";
    document.getElementById("taskFormPriority").value =
      task.priority || "Medium";
    document.getElementById("taskFormColor").value = task.color || "#0a84ff";
    document.getElementById("taskFormIcon").value = task.icon || "📌";
    document.getElementById("taskFormGithub").value = task.github || "";
    document.getElementById("taskFormFigma").value = task.figma || "";
    document.getElementById("taskFormDocs").value = task.docs || "";
    document.getElementById("taskFormNotes").value = task.notes || "";
    taskFormChecklistItems = JSON.parse(JSON.stringify(task.checklist || []));
    document
      .querySelectorAll("#tagPicker input[type=checkbox]")
      .forEach((cb) => {
        cb.checked = (task.tags || []).includes(cb.value);
      });
  } else {
    document.getElementById("taskModalTitle").textContent = "Task Mới";
    [
      "taskFormName",
      "taskFormSubject",
      "taskFormDesc",
      "taskFormDeadline",
      "taskFormGithub",
      "taskFormFigma",
      "taskFormDocs",
      "taskFormNotes",
    ].forEach((id) => (document.getElementById(id).value = ""));
    document.getElementById("taskFormPriority").value = "Medium";
    document.getElementById("taskFormColor").value = "#0a84ff";
    document.getElementById("taskFormIcon").value = "📌";
    taskFormChecklistItems = [];
    document
      .querySelectorAll("#tagPicker input[type=checkbox]")
      .forEach((cb) => (cb.checked = false));
  }
  renderChecklistFormList();
}

function closeTaskModal() {
  const overlay = document.getElementById("taskModalOverlay");
  if (overlay) overlay.classList.remove("active");
  editingTaskId = null;
}

function addChecklistItemToForm() {
  const input = document.getElementById("checklistItemInput");
  const text = input.value.trim();
  if (!text) return;
  taskFormChecklistItems.push({ id: generateTaskId(), text, done: false });
  input.value = "";
  renderChecklistFormList();
}

function removeChecklistItemFromForm(itemId) {
  taskFormChecklistItems = taskFormChecklistItems.filter(
    (i) => i.id !== itemId,
  );
  renderChecklistFormList();
}

function renderChecklistFormList() {
  const ul = document.getElementById("taskFormChecklist");
  if (!ul) return;
  ul.innerHTML = taskFormChecklistItems
    .map(
      (item) => `
      <li>
        <span class="task-text">${item.text}</span>
        <span class="delete-btn" onclick="removeChecklistItemFromForm('${item.id}')">✕</span>
      </li>`,
    )
    .join("");
}

function saveTaskFromModal() {
  const name = document.getElementById("taskFormName").value.trim();
  if (!name) {
    showToast("Vui lòng nhập tên task!", "error");
    return;
  }

  const selectedTags = Array.from(
    document.querySelectorAll("#tagPicker input[type=checkbox]:checked"),
  ).map((cb) => cb.value);

  const tasks = getTasks();
  const taskData = {
    name,
    subject: document.getElementById("taskFormSubject").value.trim(),
    description: document.getElementById("taskFormDesc").value.trim(),
    deadline: document.getElementById("taskFormDeadline").value,
    priority: document.getElementById("taskFormPriority").value,
    color: document.getElementById("taskFormColor").value,
    icon: document.getElementById("taskFormIcon").value.trim() || "📌",
    tags: selectedTags,
    checklist: taskFormChecklistItems,
    github: document.getElementById("taskFormGithub").value.trim(),
    figma: document.getElementById("taskFormFigma").value.trim(),
    docs: document.getElementById("taskFormDocs").value.trim(),
    notes: document.getElementById("taskFormNotes").value.trim(),
  };

  if (editingTaskId) {
    const idx = tasks.findIndex((t) => t.id === editingTaskId);
    if (idx > -1) tasks[idx] = { ...tasks[idx], ...taskData };
    showToast("Đã cập nhật task!", "success");
  } else {
    tasks.unshift({
      id: generateTaskId(),
      status: "todo",
      createdAt: Date.now(),
      ...taskData,
    });
    showToast("Task đã được tạo!", "success");
  }

  saveTasks(tasks);
  closeTaskModal();
  renderTaskBoard();
}

// ---------- TIẾN ĐỘ & COUNTDOWN ----------
function computeTaskProgress(task) {
  if (task.checklist && task.checklist.length > 0) {
    const done = task.checklist.filter((i) => i.done).length;
    return Math.round((done / task.checklist.length) * 100);
  }
  return task.status === "done" ? 100 : 0;
}

function getCountdownInfo(deadlineStr) {
  if (!deadlineStr) {
    return { text: "Không có deadline", cssClass: "cd-none", blink: false };
  }
  const deadline = new Date(deadlineStr).getTime();
  const diffMs = deadline - Date.now();

  if (diffMs <= 0) {
    return { text: "⚠ Quá hạn", cssClass: "cd-overdue", blink: true };
  }

  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffDays > 7) {
    return {
      text: `🟢 Còn ${Math.ceil(diffDays)} ngày`,
      cssClass: "cd-green",
      blink: false,
    };
  }
  if (diffDays > 2) {
    return {
      text: `🟡 Còn ${Math.ceil(diffDays)} ngày`,
      cssClass: "cd-yellow",
      blink: false,
    };
  }
  if (diffDays >= 1) {
    return {
      text: `🔴 Còn ${Math.ceil(diffDays)} ngày`,
      cssClass: "cd-red",
      blink: false,
    };
  }
  return {
    text: `🔴 Còn ${Math.ceil(diffHours)} giờ`,
    cssClass: "cd-red",
    blink: false,
  };
}

// ---------- THẺ TASK (CARD) + DRAG & DROP ----------
function renderTaskCard(task) {
  const progress = computeTaskProgress(task);
  const countdown = getCountdownInfo(task.deadline);
  const priorityColor = PRIORITY_COLORS[task.priority] || "#0a84ff";
  const tagsHtml = (task.tags || [])
    .map((t) => `<span class="task-tag">${t}</span>`)
    .join("");

  const div = document.createElement("div");
  div.className = "task-card";
  div.draggable = true;
  div.dataset.taskId = task.id;
  div.style.borderLeft = `4px solid ${task.color || "#0a84ff"}`;

  div.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", task.id);
    div.classList.add("dragging");
  });
  div.addEventListener("dragend", () => div.classList.remove("dragging"));

  div.innerHTML = `
    <div class="task-card-top">
      <span class="task-icon">${task.icon || "📌"}</span>
      <span class="task-name">${task.name}</span>
    </div>
    ${task.description ? `<div class="task-desc">${task.description}</div>` : ""}
    <div class="task-tags">${tagsHtml}</div>
    <div class="task-meta-row">
      <span class="priority-badge" style="background:${priorityColor}22;color:${priorityColor};border:1px solid ${priorityColor};">${task.priority}</span>
      <span class="countdown-badge ${countdown.cssClass} ${countdown.blink ? "blink" : ""}">${countdown.text}</span>
    </div>
    <div class="progress-track"><div class="progress-fill" style="width:${progress}%;"></div></div>
    <div class="task-card-actions">
      <button class="task-action-btn" onclick="openTaskDetail('${task.id}')">Chi tiết</button>
      <button class="task-action-btn" onclick="openTaskModal('${task.id}')">Sửa</button>
      ${task.status !== "done" ? `<button class="task-action-btn complete" onclick="completeTask('${task.id}')">Hoàn thành</button>` : ""}
      <button class="task-action-btn delete" onclick="deleteTask('${task.id}')">Xóa</button>
    </div>
  `;
  return div;
}

function handleColDragOver(e) {
  e.preventDefault();
}

function handleColDrop(e, status) {
  e.preventDefault();
  const taskId = e.dataTransfer.getData("text/plain");
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  task.status = status;
  saveTasks(tasks);
  renderTaskBoard();
  showToast("Đã chuyển task sang " + STATUS_LABELS[status], "info");
}

function completeTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.status = "done";
  if (task.checklist && task.checklist.length) {
    task.checklist.forEach((i) => (i.done = true));
  }
  saveTasks(tasks);
  renderTaskBoard();
  awardXp(10);
  showToast("Task hoàn thành: " + task.name, "success");
}

function deleteTask(id) {
  if (!confirm("Bạn có chắc muốn xóa task này?")) return;
  let tasks = getTasks();
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  renderTaskBoard();
  closeTaskDetail();
  showToast("Đã xóa task", "error");
}

// ---------- POPUP CHI TIẾT TASK ----------
function openTaskDetail(id) {
  const task = getTasks().find((t) => t.id === id);
  if (!task) return;
  const progress = computeTaskProgress(task);
  const countdown = getCountdownInfo(task.deadline);
  const priorityColor = PRIORITY_COLORS[task.priority] || "#0a84ff";

  const checklistHtml =
    (task.checklist || [])
      .map(
        (item) => `
      <li class="${item.done ? "done" : ""}">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;">
          <input type="checkbox" ${item.done ? "checked" : ""} onchange="toggleChecklistItem('${task.id}','${item.id}')">
          <span class="task-text">${item.text}</span>
        </label>
      </li>`,
      )
      .join("") ||
    `<li style="color:var(--text-muted);">Chưa có checklist nào.</li>`;

  const links = [];
  if (task.github)
    links.push(
      `<div><a href="${task.github}" target="_blank">🔗 GitHub</a></div>`,
    );
  if (task.figma)
    links.push(
      `<div><a href="${task.figma}" target="_blank">🎨 Figma</a></div>`,
    );
  if (task.docs)
    links.push(`<div><a href="${task.docs}" target="_blank">📄 Docs</a></div>`);
  const linksHtml =
    links.join("") ||
    `<span style="color:var(--text-muted);">Không có liên kết nào.</span>`;

  document.getElementById("taskDetailBox").innerHTML = `
    <div class="modal-header">
      <h2>${task.icon || "📌"} ${task.name}</h2>
      <span class="modal-close" onclick="closeTaskDetail()">✕</span>
    </div>
    <div class="task-meta-row" style="margin-bottom:14px;">
      <span class="priority-badge" style="background:${priorityColor}22;color:${priorityColor};border:1px solid ${priorityColor};">${task.priority}</span>
      <span class="countdown-badge ${countdown.cssClass} ${countdown.blink ? "blink" : ""}">${countdown.text}</span>
      <span style="font-size:12px;color:var(--text-muted);">Môn: ${task.subject || "—"}</span>
    </div>
    <div class="progress-track" style="margin-bottom:16px;"><div class="progress-fill" style="width:${progress}%;"></div></div>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">${task.description || "Không có mô tả."}</p>

    <h3 style="font-size:14px;margin-bottom:8px;">✅ Checklist</h3>
    <ul class="checklist-list">${checklistHtml}</ul>

    <h3 style="font-size:14px;margin:16px 0 8px;">🔗 Liên kết</h3>
    <div style="font-size:13px;display:flex;flex-direction:column;gap:6px;">${linksHtml}</div>

    ${task.notes ? `<h3 style="font-size:14px;margin:16px 0 8px;">📝 Ghi chú</h3><p style="font-size:13px;color:var(--text-muted);">${task.notes}</p>` : ""}

    <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap;">
      <button class="btn-primary" onclick="closeTaskDetail(); openTaskModal('${task.id}');">Sửa Task</button>
      <button class="btn-secondary" onclick="deleteTask('${task.id}')">Xóa Task</button>
      <button class="btn-secondary" onclick="closeTaskDetail()">Đóng</button>
    </div>
  `;
  document.getElementById("taskDetailOverlay").classList.add("active");
}

function closeTaskDetail() {
  const overlay = document.getElementById("taskDetailOverlay");
  if (overlay) overlay.classList.remove("active");
}

function toggleChecklistItem(taskId, itemId) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  const item = (task.checklist || []).find((i) => i.id === itemId);
  if (!item) return;
  item.done = !item.done;

  const progress = computeTaskProgress(task);
  if (progress === 100 && task.status !== "done") {
    task.status = "done";
    showToast("Checklist hoàn tất, task đã chuyển sang Hoàn thành!", "success");
  }

  saveTasks(tasks);
  openTaskDetail(taskId);
  renderTaskBoard();
}

// ---------- DASHBOARD THỐNG KÊ + BIỂU ĐỒ (Section 11) ----------
function renderTaskBoard() {
  const boardEl = document.getElementById("kanbanBoard");
  if (!boardEl) return;

  const tasks = getTasks();

  TASK_STATUSES.forEach((status) => {
    const col = document.getElementById("col-" + status);
    if (col) col.innerHTML = "";
  });

  tasks.forEach((task) => {
    const col = document.getElementById("col-" + task.status);
    if (col) col.appendChild(renderTaskCard(task));
  });

  TASK_STATUSES.forEach((status) => {
    const countEl = document.getElementById("count-" + status);
    if (countEl) {
      countEl.textContent = tasks.filter((t) => t.status === status).length;
    }
  });

  renderTaskStats(tasks);
  renderStatusDonutChart(tasks);
  renderPriorityBarChart(tasks);
}

function renderTaskStats(tasks) {
  const row = document.getElementById("taskStatsRow");
  if (!row) return;

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const doing = tasks.filter((t) => t.status === "doing").length;
  const overdue = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline).getTime() < Date.now() &&
      t.status !== "done",
  ).length;

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const endOfToday = startOfToday + 24 * 60 * 60 * 1000;
  const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;

  const dueToday = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline).getTime() >= startOfToday &&
      new Date(t.deadline).getTime() < endOfToday,
  ).length;
  const dueThisWeek = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline).getTime() >= startOfToday &&
      new Date(t.deadline).getTime() < endOfWeek,
  ).length;

  const overallProgress =
    total > 0
      ? Math.round(
          tasks.reduce((sum, t) => sum + computeTaskProgress(t), 0) / total,
        )
      : 0;

  const stats = [
    { label: "Tổng Task", value: total },
    { label: "Đã hoàn thành", value: done },
    { label: "Đang làm", value: doing },
    { label: "Quá hạn", value: overdue },
    { label: "Deadline hôm nay", value: dueToday },
    { label: "Deadline tuần này", value: dueThisWeek },
  ];

  row.innerHTML =
    stats
      .map(
        (s) => `
      <div class="stat-chip">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`,
      )
      .join("") +
    `
      <div class="stat-chip" style="min-width:160px;">
        <div class="stat-value">${overallProgress}%</div>
        <div class="stat-label">Tiến độ tổng</div>
        <div class="progress-track" style="margin-top:6px;margin-bottom:0;"><div class="progress-fill" style="width:${overallProgress}%;"></div></div>
      </div>`;
}

function renderStatusDonutChart(tasks) {
  const svg = document.getElementById("statusDonutChart");
  const legend = document.getElementById("donutLegend");
  if (!svg) return;

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const colors = {
    todo: "#86868b",
    doing: "#0a84ff",
    review: "#bf5af2",
    done: "#30d158",
  };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const cx = 80,
    cy = 80,
    r = 60,
    strokeWidth = 24;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    svg.innerHTML = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="${strokeWidth}" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dy="5" fill="var(--text-muted)" font-size="11">Chưa có task</text>`;
    if (legend) legend.innerHTML = "";
    return;
  }

  let offset = 0;
  let circles = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />`;
  Object.keys(counts).forEach((key) => {
    const value = counts[key];
    if (value === 0) return;
    const dash = (value / total) * circumference;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[key]}" stroke-width="${strokeWidth}"
      stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
    offset += dash;
  });
  circles += `<text x="${cx}" y="${cy}" text-anchor="middle" dy="5" fill="var(--text-main)" font-size="18" font-weight="700">${total}</text>`;
  svg.innerHTML = circles;

  if (legend) {
    legend.innerHTML = Object.keys(counts)
      .map(
        (key) => `
        <div class="legend-item">
          <span class="legend-dot" style="background:${colors[key]};"></span>
          ${STATUS_LABELS[key]}: ${counts[key]}
        </div>`,
      )
      .join("");
  }
}

function renderPriorityBarChart(tasks) {
  const svg = document.getElementById("priorityBarChart");
  if (!svg) return;

  const priorities = ["Low", "Medium", "High", "Critical"];
  const counts = priorities.map(
    (p) => tasks.filter((t) => t.priority === p).length,
  );
  const max = Math.max(1, ...counts);
  const barWidth = 40,
    gap = 20,
    baseY = 130;

  let bars = "";
  priorities.forEach((p, i) => {
    const barHeight = (counts[i] / max) * 90;
    const x = 20 + i * (barWidth + gap);
    const y = baseY - barHeight;
    bars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 2)}" rx="6" fill="${PRIORITY_COLORS[p]}" />
      <text x="${x + barWidth / 2}" y="${baseY + 16}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${p}</text>
      <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="var(--text-main)" font-weight="600">${counts[i]}</text>
    `;
  });

  svg.innerHTML = `<line x1="10" y1="${baseY}" x2="250" y2="${baseY}" stroke="rgba(255,255,255,0.15)" />${bars}`;
}

// ---------- TOAST NOTIFICATION (Section 12) ----------
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Tự làm mới countdown/biểu đồ mỗi phút để hạn chót luôn cập nhật
setInterval(() => {
  if (sessionStorage.getItem("itDashboardLogged") === "true") {
    renderTaskBoard();
  }
}, 60000);

const noteInput = document.getElementById("scratchNote");
if (noteInput) {
  if (localStorage.getItem("savedNote"))
    noteInput.value = localStorage.getItem("savedNote");
  noteInput.addEventListener("input", () =>
    localStorage.setItem("savedNote", noteInput.value),
  );
}

// Đồng hồ thời gian thực
function updateClock() {
  const now = new Date();
  const t = document.getElementById("clockTime");
  const d = document.getElementById("clockDate");
  if (t) t.textContent = now.toLocaleTimeString("vi-VN", { hour12: false });
  if (d)
    d.textContent = now.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
}
updateClock();
setInterval(updateClock, 1000);

// ==========================================
// TAB HỌC TẬP CS - CHUYỂN MÔN HỌC (Section 2)
// ==========================================
function switchCsSubject(subject) {
  document
    .querySelectorAll(".cs-subject-card")
    .forEach((c) => c.classList.remove("active"));
  const card = document.querySelector(
    `.cs-subject-card[data-subject="${subject}"]`,
  );
  if (card) card.classList.add("active");

  document
    .querySelectorAll(".cs-subject-panel")
    .forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById("cs-" + subject);
  if (panel) panel.classList.add("active");
}

// ==========================================
// MÁY TÍNH ĐẠI SỐ TUYẾN TÍNH (Section 3 & 7)
// ==========================================
let currentLinalgOp = "add";

function switchLinalgOp(op) {
  currentLinalgOp = op;
  document
    .querySelectorAll(".linalg-op-btn")
    .forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(`.linalg-op-btn[data-op="${op}"]`);
  if (btn) btn.classList.add("active");

  const needsB = op === "add" || op === "sub" || op === "mul";
  const needsSolve = op === "solve";

  document.getElementById("matBWrapper").style.display = needsB
    ? "block"
    : "none";
  document.getElementById("vecBWrapper").style.display = needsSolve
    ? "block"
    : "none";

  if (needsSolve) renderVecBGrid();

  const resultBox = document.getElementById("linalgResult");
  if (resultBox) resultBox.style.display = "none";
}

function renderMatrixGrid(name) {
  const rows = parseInt(document.getElementById(`mat${name}Rows`).value) || 1;
  const cols = parseInt(document.getElementById(`mat${name}Cols`).value) || 1;
  const grid = document.getElementById(`mat${name}Grid`);
  if (!grid) return;
  grid.style.gridTemplateColumns = `repeat(${cols}, 60px)`;

  let html = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      html += `<input type="number" id="mat${name}_${r}_${c}" value="0" class="matrix-cell">`;
    }
  }
  grid.innerHTML = html;

  if (name === "A") renderVecBGrid();
}

function renderVecBGrid() {
  const grid = document.getElementById("vecBGrid");
  if (!grid) return;
  const rows = parseInt(document.getElementById("matARows").value) || 1;
  grid.style.gridTemplateColumns = `60px`;

  let html = "";
  for (let r = 0; r < rows; r++) {
    html += `<input type="number" id="vecB_${r}_0" value="0" class="matrix-cell">`;
  }
  grid.innerHTML = html;
}

function readMatrix(name, rows, cols) {
  const m = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const el = document.getElementById(`mat${name}_${r}_${c}`);
      row.push(parseFloat(el.value) || 0);
    }
    m.push(row);
  }
  return m;
}

function fmtNum(n) {
  const rounded = Math.round(n * 10000) / 10000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function renderMatrixTable(M) {
  return `<table style="border-collapse:collapse;margin-top:10px;">${M.map(
    (row) =>
      `<tr>${row
        .map(
          (v) =>
            `<td style="padding:6px 12px;border:1px solid var(--apple-glass-border);text-align:center;">${fmtNum(v)}</td>`,
        )
        .join("")}</tr>`,
  ).join("")}</table>`;
}

// ---------- Các phép toán ma trận cốt lõi ----------
function matAdd(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error("Hai ma trận phải cùng kích thước để cộng!");
  }
  return A.map((row, r) => row.map((v, c) => v + B[r][c]));
}

function matSub(A, B) {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error("Hai ma trận phải cùng kích thước để trừ!");
  }
  return A.map((row, r) => row.map((v, c) => v - B[r][c]));
}

function matMul(A, B) {
  if (A[0].length !== B.length) {
    throw new Error("Số cột của A phải bằng số dòng của B để nhân!");
  }
  const result = [];
  for (let r = 0; r < A.length; r++) {
    const row = [];
    for (let c = 0; c < B[0].length; c++) {
      let sum = 0;
      for (let k = 0; k < B.length; k++) sum += A[r][k] * B[k][c];
      row.push(sum);
    }
    result.push(row);
  }
  return result;
}

function matDeterminant(A) {
  const n = A.length;
  if (n !== A[0].length) {
    throw new Error("Chỉ tính được định thức của ma trận vuông!");
  }
  const M = A.map((row) => row.slice());
  let det = 1;
  for (let i = 0; i < n; i++) {
    let pivotRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[pivotRow][i])) pivotRow = k;
    }
    if (Math.abs(M[pivotRow][i]) < 1e-10) return 0;
    if (pivotRow !== i) {
      [M[i], M[pivotRow]] = [M[pivotRow], M[i]];
      det *= -1;
    }
    det *= M[i][i];
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j < n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  return det;
}

function matInverse(A) {
  const n = A.length;
  if (n !== A[0].length) {
    throw new Error("Chỉ tính được nghịch đảo của ma trận vuông!");
  }
  const M = A.map((row, r) => [
    ...row,
    ...Array.from({ length: n }, (_, c) => (c === r ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    let pivotRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[pivotRow][i])) pivotRow = k;
    }
    if (Math.abs(M[pivotRow][i]) < 1e-10) {
      throw new Error("Ma trận suy biến (định thức = 0), không có nghịch đảo!");
    }
    [M[i], M[pivotRow]] = [M[pivotRow], M[i]];

    const pivotVal = M[i][i];
    for (let j = 0; j < 2 * n; j++) M[i][j] /= pivotVal;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = 0; j < 2 * n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  return M.map((row) => row.slice(n));
}

function solveLinearSystem(A, b) {
  const n = A.length;
  if (n !== A[0].length) {
    throw new Error("Ma trận hệ số A phải là ma trận vuông!");
  }
  const M = A.map((row, r) => [...row, b[r][0]]);

  for (let i = 0; i < n; i++) {
    let pivotRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[pivotRow][i])) pivotRow = k;
    }
    if (Math.abs(M[pivotRow][i]) < 1e-10) {
      throw new Error(
        "Hệ phương trình vô nghiệm hoặc vô số nghiệm (ma trận hệ số suy biến)!",
      );
    }
    [M[i], M[pivotRow]] = [M[pivotRow], M[i]];

    const pivotVal = M[i][i];
    for (let j = i; j <= n; j++) M[i][j] /= pivotVal;

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = i; j <= n; j++) M[k][j] -= factor * M[i][j];
    }
  }
  return M.map((row) => [row[n]]);
}

function computeLinalg() {
  const resultBox = document.getElementById("linalgResult");
  resultBox.style.display = "block";

  try {
    const rowsA = parseInt(document.getElementById("matARows").value);
    const colsA = parseInt(document.getElementById("matACols").value);
    const A = readMatrix("A", rowsA, colsA);
    let output = "";

    if (
      currentLinalgOp === "add" ||
      currentLinalgOp === "sub" ||
      currentLinalgOp === "mul"
    ) {
      const rowsB = parseInt(document.getElementById("matBRows").value);
      const colsB = parseInt(document.getElementById("matBCols").value);
      const B = readMatrix("B", rowsB, colsB);

      let R;
      if (currentLinalgOp === "add") R = matAdd(A, B);
      if (currentLinalgOp === "sub") R = matSub(A, B);
      if (currentLinalgOp === "mul") R = matMul(A, B);
      output = `<b>Kết quả:</b>${renderMatrixTable(R)}`;
    } else if (currentLinalgOp === "det") {
      const d = matDeterminant(A);
      output = `<b>Định thức det(A) = </b><span style="font-size:20px;color:#30d158;font-weight:700;">${fmtNum(d)}</span>`;
    } else if (currentLinalgOp === "inv") {
      const inv = matInverse(A);
      output = `<b>Ma trận nghịch đảo A⁻¹:</b>${renderMatrixTable(inv)}`;
    } else if (currentLinalgOp === "solve") {
      const b = [];
      for (let r = 0; r < rowsA; r++) {
        const el = document.getElementById(`vecB_${r}_0`);
        b.push([parseFloat(el.value) || 0]);
      }
      const x = solveLinearSystem(A, b);
      output = `<b>Nghiệm x:</b>${renderMatrixTable(x)}`;
    }

    resultBox.innerHTML = output;
    showToast("Tính toán hoàn tất!", "success");
  } catch (err) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ ${err.message}</span>`;
  }
}

// Khởi tạo lưới ma trận mặc định khi trang tải xong (không phụ thuộc đăng nhập)
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("matAGrid")) {
    renderMatrixGrid("A");
    renderMatrixGrid("B");
    switchLinalgOp("add");
  }
});

// ==========================================
// CHUYỂN TAB CODE (C++/Java/Python) TRONG CẤU TRÚC DỮ LIỆU (Section 4)
// ==========================================
function switchCodeTab(btn, targetId) {
  const wrapper = btn.closest(".code-tabs");
  if (!wrapper) return;

  wrapper
    .querySelectorAll(".code-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  wrapper
    .querySelectorAll(".code-block")
    .forEach((c) => c.classList.remove("active"));
  const target = document.getElementById(targetId);
  if (target) target.classList.add("active");
}

// ==========================================
// ỨNG DỤNG WEB - DEMO TRỰC TIẾP (Section 5)
// ==========================================

// ---- HTML: Form validate realtime ----
function validateWebDemoForm() {
  const name = document.getElementById("webFormName").value.trim();
  const email = document.getElementById("webFormEmail").value.trim();
  const statusEl = document.getElementById("webFormStatus");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name && !email) {
    statusEl.textContent = "Nhập thông tin để xem validate realtime...";
    statusEl.style.color = "var(--text-muted)";
    return;
  }
  if (name && emailValid) {
    statusEl.textContent = "✅ Hợp lệ! Sẵn sàng submit.";
    statusEl.style.color = "#30d158";
  } else {
    statusEl.textContent =
      "⚠ " +
      (!name ? "Chưa nhập tên. " : "") +
      (!emailValid ? "Email chưa hợp lệ." : "");
    statusEl.style.color = "#ff453a";
  }
}

// ---- HTML: Table sort demo ----
let webDemoTableData = [
  { name: "An", score: 9 },
  { name: "Bình", score: 7 },
  { name: "Chi", score: 10 },
  { name: "Dũng", score: 6 },
];
let webDemoSortDir = { 0: 1, 1: 1 };

function renderWebDemoTable() {
  const table = document.getElementById("webDemoTable");
  if (!table) return;
  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });
  webDemoTableData.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.name}</td><td>${item.score}</td>`;
    table.appendChild(tr);
  });
}

function sortWebDemoTable(colIndex) {
  const key = colIndex === 0 ? "name" : "score";
  webDemoSortDir[colIndex] *= -1;
  const dir = webDemoSortDir[colIndex];
  webDemoTableData.sort((a, b) => {
    if (a[key] < b[key]) return -1 * dir;
    if (a[key] > b[key]) return 1 * dir;
    return 0;
  });
  renderWebDemoTable();
}

// ---- CSS: Flexbox / Grid / Animation / Responsive demo ----
function setFlexDemo(prop, value) {
  const el = document.getElementById("flexDemoContainer");
  if (el) el.style.setProperty(prop, value);
}

function setGridDemo(cols) {
  const el = document.getElementById("gridDemoContainer");
  if (el) el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
}

function triggerCssAnim(type) {
  const box = document.getElementById("animDemoBox");
  if (!box) return;
  box.classList.remove("anim-bounce", "anim-spin", "anim-fade");
  void box.offsetWidth; // buộc reflow để hoạt ảnh chạy lại từ đầu
  box.classList.add("anim-" + type);
}

function setResponsiveDemo(width) {
  const viewport = document.getElementById("responsiveDemoViewport");
  const content = document.getElementById("responsiveDemoContent");
  if (!viewport || !content) return;
  viewport.style.maxWidth = width;
  if (width === "260px") content.style.gridTemplateColumns = "1fr";
  else if (width === "420px")
    content.style.gridTemplateColumns = "repeat(2, 1fr)";
  else content.style.gridTemplateColumns = "repeat(3, 1fr)";
}

// ---- JavaScript: DOM / Events / Fetch / Async-Await / LocalStorage demo ----
let domDemoCounter = 0;
function domDemoChangeText() {
  const el = document.getElementById("domDemoTarget");
  if (el)
    el.textContent =
      "Nội dung đã được đổi lúc " + new Date().toLocaleTimeString("vi-VN");
}
function domDemoAddItem() {
  domDemoCounter++;
  const list = document.getElementById("domDemoList");
  if (!list) return;
  const li = document.createElement("li");
  li.innerHTML = `<span class="task-text">Item số ${domDemoCounter}</span><span class="delete-btn" onclick="this.parentElement.remove()">✕</span>`;
  list.appendChild(li);
}

function logWebEvent(msg) {
  const logEl = document.getElementById("eventLog");
  if (!logEl) return;
  const time = new Date().toLocaleTimeString("vi-VN");
  logEl.innerHTML += `<div>[${time}] ${msg}</div>`;
  logEl.scrollTop = logEl.scrollHeight;
}

async function fetchDemoCall() {
  const resultEl = document.getElementById("fetchDemoResult");
  resultEl.textContent = "⏳ Đang gọi API...";
  try {
    const res = await fetch("https://catfact.ninja/fact");
    const data = await res.json();
    resultEl.innerHTML = `<b>🐱 Cat Fact:</b> ${data.fact}`;
  } catch (err) {
    resultEl.innerHTML = `<span style="color:#ff453a;">⚠ Không thể gọi API (mất mạng hoặc bị chặn). Lỗi: ${err.message}</span>`;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function asyncAwaitDemo() {
  const resultEl = document.getElementById("asyncDemoResult");
  resultEl.textContent = "⏳ Đang tải dữ liệu...";
  await delay(2000);
  resultEl.innerHTML = `<span style="color:#30d158;">✅ Tải xong! Dữ liệu: {"name": "IT Workspace", "status": "success"}</span>`;
}

function lsDemoSave() {
  const val = document.getElementById("lsDemoInput").value;
  localStorage.setItem("webDemoLsKey", val);
  document.getElementById("lsDemoResult").textContent =
    "💾 Đã lưu vào LocalStorage: " + val;
}
function lsDemoLoad() {
  const val = localStorage.getItem("webDemoLsKey");
  document.getElementById("lsDemoResult").textContent =
    val !== null
      ? "📂 Giá trị đọc được: " + val
      : "⚠ Chưa có dữ liệu nào được lưu.";
}
function lsDemoClear() {
  localStorage.removeItem("webDemoLsKey");
  document.getElementById("lsDemoResult").textContent =
    "🗑 Đã xóa dữ liệu khỏi LocalStorage.";
}

// ---- NodeJS: JWT Decoder (chạy thật 100% ở client, không cần backend) ----
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return decodeURIComponent(
    atob(str)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
  );
}

function decodeJwtDemo() {
  const resultEl = document.getElementById("jwtDecodeResult");
  const token = document.getElementById("jwtDecodeInput").value.trim();
  const parts = token.split(".");

  if (parts.length !== 3) {
    resultEl.innerHTML = `<span style="color:#ff453a;">⚠ JWT không hợp lệ! Cần đúng 3 phần cách nhau bởi dấu chấm.</span>`;
    return;
  }
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    resultEl.innerHTML = `
      <p><b>Header:</b></p>
      <pre class="code-block active" style="display:block;">${JSON.stringify(header, null, 2)}</pre>
      <p><b>Payload:</b></p>
      <pre class="code-block active" style="display:block;">${JSON.stringify(payload, null, 2)}</pre>
      <p style="font-size:11px;color:var(--text-muted);">Signature (phần thứ 3) không giải mã được vì chỉ dùng để xác thực chữ ký, không chứa dữ liệu.</p>
    `;
    showToast("Đã giải mã JWT!", "success");
  } catch (err) {
    resultEl.innerHTML = `<span style="color:#ff453a;">⚠ Không thể giải mã — token không đúng định dạng JWT hợp lệ.</span>`;
  }
}

// ==========================================
// MẠNG MÁY TÍNH (Section 6)
// ==========================================

// ---- Công cụ IP / Subnet / CIDR Calculator ----
function ipToInt(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error("Địa chỉ IP không hợp lệ! Định dạng đúng: x.x.x.x (0-255)");
  }
  return (
    ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
  );
}
function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255,
  ].join(".");
}

function computeSubnetInfo(ip, prefixRaw) {
  const prefix = parseInt(prefixRaw);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Prefix (CIDR) phải từ 0 đến 32!");
  }
  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardInt = ~maskInt >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);

  let usableHosts, firstHost, lastHost;
  if (prefix >= 31) {
    usableHosts = prefix === 32 ? 1 : 2;
    firstHost = intToIp(networkInt);
    lastHost = intToIp(broadcastInt);
  } else {
    usableHosts = totalHosts - 2;
    firstHost = intToIp((networkInt + 1) >>> 0);
    lastHost = intToIp((broadcastInt - 1) >>> 0);
  }

  const firstOctet = (ipInt >>> 24) & 255;
  const secondOctet = (ipInt >>> 16) & 255;
  let ipClass = "E (Nghiên cứu)";
  if (firstOctet < 128) ipClass = "A";
  else if (firstOctet < 192) ipClass = "B";
  else if (firstOctet < 224) ipClass = "C";
  else if (firstOctet < 240) ipClass = "D (Multicast)";

  const isPrivate =
    firstOctet === 10 ||
    (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
    (firstOctet === 192 && secondOctet === 168);

  return {
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    subnetMask: intToIp(maskInt),
    wildcardMask: intToIp(wildcardInt),
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    cidr: `/${prefix}`,
    ipClass,
    isPrivate,
  };
}

function computeSubnetTool() {
  const resultBox = document.getElementById("subnetResult");
  resultBox.style.display = "block";
  try {
    const ip = document.getElementById("subnetIpInput").value.trim();
    const prefix = document.getElementById("subnetPrefixInput").value;
    const info = computeSubnetInfo(ip, prefix);
    resultBox.innerHTML = `
      <table class="bigo-table">
        <tr><td>Network Address</td><td>${info.networkAddress}${info.cidr}</td></tr>
        <tr><td>Subnet Mask</td><td>${info.subnetMask}</td></tr>
        <tr><td>Wildcard Mask</td><td>${info.wildcardMask}</td></tr>
        <tr><td>Broadcast Address</td><td>${info.broadcastAddress}</td></tr>
        <tr><td>Dải Host khả dụng</td><td>${info.firstHost} — ${info.lastHost}</td></tr>
        <tr><td>Số host khả dụng</td><td>${info.usableHosts.toLocaleString()}</td></tr>
        <tr><td>Lớp IP (Class)</td><td>${info.ipClass}</td></tr>
        <tr><td>Loại địa chỉ</td><td>${info.isPrivate ? "🔒 Private (mạng nội bộ)" : "🌐 Public (công cộng)"}</td></tr>
      </table>
    `;
    showToast("Tính toán Subnet hoàn tất!", "success");
  } catch (err) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ ${err.message}</span>`;
  }
}

// ---- Mô phỏng gửi gói tin qua 7 tầng OSI ----
const osiEncapSteps = [
  { layer: 7, text: "📨 Tầng Application: Tạo dữ liệu (HTTP request)" },
  { layer: 6, text: "🔐 Tầng Presentation: Mã hóa/nén dữ liệu" },
  { layer: 5, text: "🔗 Tầng Session: Thiết lập phiên làm việc" },
  {
    layer: 4,
    text: "📬 Tầng Transport: Thêm TCP/UDP header (port nguồn/đích)",
  },
  {
    layer: 3,
    text: "🌐 Tầng Network: Thêm IP header (địa chỉ IP nguồn/đích) → Packet",
  },
  { layer: 2, text: "🔌 Tầng Data Link: Thêm MAC header → Frame" },
  {
    layer: 1,
    text: "⚡ Tầng Physical: Chuyển thành tín hiệu điện/quang, truyền đi",
  },
];

function simulateOsiSend() {
  const logEl = document.getElementById("osiLog");
  if (!logEl) return;
  logEl.innerHTML = "";
  document
    .querySelectorAll(".osi-layer")
    .forEach((el) => el.classList.remove("active"));

  osiEncapSteps.forEach((step, idx) => {
    setTimeout(() => {
      document
        .querySelectorAll(".osi-layer")
        .forEach((el) => el.classList.remove("active"));
      const layerEl = document.querySelector(
        `.osi-layer[data-layer="${step.layer}"]`,
      );
      if (layerEl) layerEl.classList.add("active");
      logEl.innerHTML += `<div>${step.text}</div>`;
      logEl.scrollTop = logEl.scrollHeight;

      if (idx === osiEncapSteps.length - 1) {
        setTimeout(() => {
          document
            .querySelectorAll(".osi-layer")
            .forEach((el) => el.classList.remove("active"));
          logEl.innerHTML += `<div style="color:#30d158;">✅ Gói tin đã được gửi đi, phía nhận sẽ giải mã ngược lại (decapsulation) từ tầng 1 lên tầng 7!</div>`;
          showToast("Mô phỏng OSI hoàn tất!", "success");
        }, 700);
      }
    }, idx * 700);
  });
}

// ---- Mô phỏng Router & Switch ----
function runNetworkSteps(steps, onDone) {
  const logEl = document.getElementById("networkLog");
  if (!logEl) return;
  document
    .querySelectorAll(".net-node")
    .forEach((el) => el.classList.remove("active"));

  steps.forEach((step, idx) => {
    setTimeout(() => {
      document
        .querySelectorAll(".net-node")
        .forEach((el) => el.classList.remove("active"));
      const nodeEl = document.getElementById(step.node);
      if (nodeEl) nodeEl.classList.add("active");
      logEl.innerHTML += `<div>${step.text}</div>`;
      logEl.scrollTop = logEl.scrollHeight;

      if (idx === steps.length - 1) {
        setTimeout(() => {
          document
            .querySelectorAll(".net-node")
            .forEach((el) => el.classList.remove("active"));
          onDone();
          showToast("Mô phỏng hoàn tất!", "success");
        }, 700);
      }
    }, idx * 700);
  });
}

function simulateSwitchSend() {
  const logEl = document.getElementById("networkLog");
  logEl.innerHTML = "";
  const steps = [
    {
      node: "net-pc1",
      text: "💻 PC1 muốn gửi dữ liệu tới PC2 (192.168.1.20 — cùng mạng LAN 192.168.1.0/24)",
    },
    {
      node: "net-switch",
      text: "🔀 Switch nhận Frame, tra bảng MAC Address Table để tìm cổng của PC2",
    },
    {
      node: "net-pc2",
      text: "💻 Switch chuyển tiếp Frame trực tiếp đến đúng cổng của PC2 — không cần qua Router!",
    },
  ];
  runNetworkSteps(steps, () => {
    logEl.innerHTML += `<div style="color:#30d158;">✅ Vì PC1 và PC2 cùng mạng, Switch chỉ cần dựa vào địa chỉ MAC (Lớp 2) để chuyển tiếp — rất nhanh!</div>`;
  });
}

function simulateRouterSend() {
  const logEl = document.getElementById("networkLog");
  logEl.innerHTML = "";
  const steps = [
    {
      node: "net-pc1",
      text: "💻 PC1 muốn truy cập Internet (ví dụ: google.com — khác mạng)",
    },
    {
      node: "net-switch",
      text: "🔀 Switch chuyển Frame đến Router vì đích không nằm trong mạng LAN",
    },
    {
      node: "net-router",
      text: "📡 Router đọc địa chỉ IP đích, tra bảng định tuyến (Routing Table) để chọn đường đi",
    },
    {
      node: "net-internet",
      text: "☁️ Router chuyển gói tin ra Internet qua cổng WAN",
    },
  ];
  runNetworkSteps(steps, () => {
    logEl.innerHTML += `<div style="color:#30d158;">✅ Vì đích khác mạng, cần Router (Lớp 3) định tuyến dựa vào địa chỉ IP — đây là điểm khác biệt cốt lõi với Switch!</div>`;
  });
}

// Khởi tạo bảng demo Web khi trang tải xong (không phụ thuộc đăng nhập)
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("webDemoTable")) {
    renderWebDemoTable();
  }
});

// ==========================================
// CS CALCULATOR TAB (Section 7)
// ==========================================

// ---- Máy tính thường (không dùng eval, tự viết parser an toàn) ----
function tokenizeExpr(expr) {
  const tokens = [];
  let i = 0;
  expr = expr.replace(/×/g, "*").replace(/÷/g, "/");
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === " ") {
      i++;
    } else if ("+-*/()".includes(ch)) {
      tokens.push(ch);
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push(parseFloat(num));
    } else {
      throw new Error(`Ký tự không hợp lệ: "${ch}"`);
    }
  }
  return tokens;
}

// Parser đệ quy theo văn phạm: expr -> term (+|- term)*; term -> factor (*|/ factor)*; factor -> number | ( expr )
function parseExpr(tokens) {
  let pos = 0;

  function parseFactor() {
    const tok = tokens[pos];
    if (tok === "(") {
      pos++;
      const val = parseAddSub();
      if (tokens[pos] !== ")") throw new Error("Thiếu dấu ngoặc đóng )");
      pos++;
      return val;
    }
    if (typeof tok === "number") {
      pos++;
      return tok;
    }
    if (tok === "-") {
      pos++;
      return -parseFactor();
    }
    throw new Error("Biểu thức không hợp lệ");
  }

  function parseMulDiv() {
    let val = parseFactor();
    while (tokens[pos] === "*" || tokens[pos] === "/") {
      const op = tokens[pos];
      pos++;
      const rhs = parseFactor();
      val = op === "*" ? val * rhs : val / rhs;
    }
    return val;
  }

  function parseAddSub() {
    let val = parseMulDiv();
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos];
      pos++;
      const rhs = parseMulDiv();
      val = op === "+" ? val + rhs : val - rhs;
    }
    return val;
  }

  const result = parseAddSub();
  if (pos !== tokens.length) throw new Error("Biểu thức thừa ký tự ở cuối");
  return result;
}

function computeBasicCalc() {
  const resultBox = document.getElementById("basicCalcResult");
  resultBox.style.display = "block";
  const expr = document.getElementById("basicCalcInput").value.trim();
  if (!expr) return;
  try {
    const tokens = tokenizeExpr(expr);
    const result = parseExpr(tokens);
    resultBox.innerHTML = `<b>Kết quả:</b> <span style="font-size:20px;color:#30d158;font-weight:700;">${fmtNum(result)}</span>`;
  } catch (err) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ ${err.message}</span>`;
  }
}

// ---- Chuyển đổi cơ số ----
function computeBaseConvert() {
  const resultBox = document.getElementById("baseConvertResult");
  resultBox.style.display = "block";
  const input = document.getElementById("baseConvertInput").value.trim();
  const fromBase = parseInt(document.getElementById("baseConvertFrom").value);

  if (!input) return;
  try {
    const decimalValue = parseInt(input, fromBase);
    if (isNaN(decimalValue)) {
      throw new Error("Số không hợp lệ với hệ cơ số đã chọn!");
    }
    resultBox.innerHTML = `
      <table class="bigo-table">
        <tr><td>Thập phân (Decimal)</td><td>${decimalValue}</td></tr>
        <tr><td>Nhị phân (Binary)</td><td>${decimalValue.toString(2)}</td></tr>
        <tr><td>Hex</td><td>${decimalValue.toString(16).toUpperCase()}</td></tr>
        <tr><td>Octal</td><td>${decimalValue.toString(8)}</td></tr>
      </table>
    `;
    showToast("Chuyển đổi hoàn tất!", "success");
  } catch (err) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ ${err.message}</span>`;
  }
}

// ---- Số học nhị phân ----
function computeBinaryOp(op) {
  const resultBox = document.getElementById("binOpResult");
  resultBox.style.display = "block";
  const aStr = document.getElementById("binOpA").value.trim();
  const bStr = document.getElementById("binOpB").value.trim();

  if (!/^[01]+$/.test(aStr) || !/^[01]+$/.test(bStr)) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ Cả A và B phải là số nhị phân hợp lệ (chỉ gồm 0 và 1)!</span>`;
    return;
  }

  const a = parseInt(aStr, 2);
  const b = parseInt(bStr, 2);
  let result, label;

  if (op === "add") {
    result = a + b;
    label = "A + B";
  } else if (op === "sub") {
    result = a - b;
    label = "A − B";
  } else if (op === "and") {
    result = a & b;
    label = "A AND B";
  } else if (op === "or") {
    result = a | b;
    label = "A OR B";
  } else if (op === "xor") {
    result = a ^ b;
    label = "A XOR B";
  }

  resultBox.innerHTML = `
    <table class="bigo-table">
      <tr><td>${label} (nhị phân)</td><td>${result < 0 ? "-" + Math.abs(result).toString(2) : result.toString(2)}</td></tr>
      <tr><td>${label} (thập phân)</td><td>${result}</td></tr>
    </table>
  `;
  showToast("Tính toán hoàn tất!", "success");
}

// ---- So sánh Big O ----
function computeBigOCompare() {
  const n = parseInt(document.getElementById("bigOInput").value);
  const resultBox = document.getElementById("bigOResult");
  if (isNaN(n) || n < 1) return;

  const values = [
    { label: "O(1)", value: 1 },
    { label: "O(log n)", value: Math.log2(n) },
    { label: "O(n)", value: n },
    { label: "O(n log n)", value: n * Math.log2(n) },
    { label: "O(n²)", value: n * n },
    { label: "O(2ⁿ)", value: n <= 60 ? Math.pow(2, n) : Infinity },
  ];

  resultBox.innerHTML = `
    <table class="bigo-table">
      <tr><th>Độ phức tạp</th><th>Giá trị ước lượng tại n=${n}</th></tr>
      ${values
        .map(
          (v) => `
        <tr><td>${v.label}</td><td>${v.value === Infinity ? "Quá lớn để hiển thị (tràn số)" : fmtNum(v.value).toLocaleString()}</td></tr>
      `,
        )
        .join("")}
    </table>
    <p style="font-size:11px;color:var(--text-muted);margin-top:10px;">Nhận xét: với n càng lớn, O(2ⁿ) tăng nhanh khủng khiếp hơn hẳn các độ phức tạp còn lại — đây là lý do vì sao thuật toán mũ (exponential) gần như không dùng được với dữ liệu lớn.</p>
  `;
}

// ---- Tính số node / chiều cao cây nhị phân ----
function switchTreeCalcMode(mode) {
  document
    .querySelectorAll(".treecalc-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector(`.treecalc-btn[data-mode="${mode}"]`)
    .classList.add("active");
  document.getElementById("treeCalcFromHeight").style.display =
    mode === "fromHeight" ? "block" : "none";
  document.getElementById("treeCalcFromNodes").style.display =
    mode === "fromNodes" ? "block" : "none";
  document.getElementById("treeCalcResult").style.display = "none";
}

function computeTreeCalc() {
  const resultBox = document.getElementById("treeCalcResult");
  resultBox.style.display = "block";
  const mode = document.querySelector(".treecalc-btn.active").dataset.mode;

  if (mode === "fromHeight") {
    const h = parseInt(document.getElementById("treeHeightInput").value);
    if (isNaN(h) || h < 0) return;
    const minNodes = h + 1;
    const maxNodes = Math.pow(2, h + 1) - 1;
    resultBox.innerHTML = `
      <table class="bigo-table">
        <tr><td>Số node tối thiểu (cây lệch/skewed)</td><td>${minNodes}</td></tr>
        <tr><td>Số node tối đa (cây đầy đủ/full binary tree)</td><td>${maxNodes}</td></tr>
      </table>
    `;
  } else {
    const n = parseInt(document.getElementById("treeNodesInput").value);
    if (isNaN(n) || n < 1) return;
    const minHeight = Math.ceil(Math.log2(n + 1)) - 1;
    const maxHeight = n - 1;
    resultBox.innerHTML = `
      <table class="bigo-table">
        <tr><td>Chiều cao tối thiểu (cây cân bằng)</td><td>${minHeight}</td></tr>
        <tr><td>Chiều cao tối đa (cây lệch/skewed)</td><td>${maxHeight}</td></tr>
      </table>
    `;
  }
  showToast("Tính toán hoàn tất!", "success");
}

// ---- Điều hướng nhanh tới công cụ đã có ở môn khác ----
function jumpToCsTool(subject) {
  document.querySelector('.tab-btn[data-tab="cs"]').click();
  setTimeout(() => switchCsSubject(subject), 150);
}

// ==========================================
// BÀI KIỂM TRA - QUIZ ENGINE (Section 8)
// ==========================================
// Ghi chú: đây là ngân hàng câu hỏi khởi đầu (~10 câu/môn) để có hệ thống
// dùng thử ngay; kiến trúc dữ liệu dạng mảng object giúp dễ dàng bổ sung
// thêm câu hỏi sau này mà không cần sửa code hiển thị.
const quizSubjects = [
  { slug: "linalg", icon: "📐", name: "Đại số tuyến tính" },
  { slug: "dsa", icon: "🌳", name: "Cấu trúc dữ liệu & Giải thuật" },
  { slug: "web", icon: "🌐", name: "Ứng dụng Web" },
  { slug: "network", icon: "📡", name: "Mạng máy tính" },
  { slug: "database", icon: "🗄️", name: "Cơ sở dữ liệu" },
  { slug: "oop", icon: "🧩", name: "Lập trình hướng đối tượng" },
  { slug: "discrete", icon: "🔢", name: "Toán rời rạc" },
  { slug: "os", icon: "🖥️", name: "Hệ điều hành" },
  { slug: "architecture", icon: "⚙️", name: "Kiến trúc máy tính" },
  { slug: "ai", icon: "🤖", name: "Trí tuệ nhân tạo" },
];

const quizBank = {
  linalg: [
    {
      q: "det([[2,1],[3,4]]) bằng bao nhiêu?",
      options: ["7", "5", "-5", "11"],
      correct: 1,
    },
    {
      q: "Ma trận vuông A có nghịch đảo khi nào?",
      options: [
        "det(A) = 0",
        "A là ma trận không",
        "det(A) ≠ 0",
        "A có số dòng lẻ",
      ],
      correct: 2,
    },
    {
      q: "Ma trận A kích thước 3×5 thì Aᵀ có kích thước bao nhiêu?",
      options: ["3×5", "5×3", "3×3", "5×5"],
      correct: 1,
    },
    {
      q: "Độ dài (norm) của vector (3,4) là bao nhiêu?",
      options: ["7", "3", "5", "4"],
      correct: 2,
    },
    {
      q: "Hệ 2 phương trình tuyến tính vô nghiệm khi nào?",
      options: [
        "Khi ma trận hệ số là ma trận đơn vị",
        "Không bao giờ vô nghiệm",
        "Khi hai đường thẳng trùng nhau",
        "Khi hai đường thẳng song song không cắt nhau",
      ],
      correct: 3,
    },
    {
      q: "Trị riêng của ma trận đường chéo [[2,0],[0,5]] là gì?",
      options: ["0 và 7", "2 và 5", "10", "2.5"],
      correct: 1,
    },
    {
      q: "Số chiều (dimension) của không gian R³ là bao nhiêu?",
      options: ["2", "4", "1", "3"],
      correct: 3,
    },
    {
      q: "Tích vô hướng của (1,0) và (0,1) là bao nhiêu?",
      options: ["1", "-1", "2", "0"],
      correct: 3,
    },
    {
      q: "Cơ sở chuẩn của R² gồm bao nhiêu vector?",
      options: ["1", "3", "2", "4"],
      correct: 2,
    },
    {
      q: "Ma trận đơn vị I nhân với ma trận A cho kết quả gì?",
      options: ["I", "Ma trận không", "Aᵀ", "A"],
      correct: 3,
    },
  ],
  dsa: [
    {
      q: "Độ phức tạp truy cập phần tử trong mảng theo chỉ số?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      correct: 2,
    },
    {
      q: "Cấu trúc dữ liệu nào hoạt động theo nguyên tắc LIFO?",
      options: ["Queue", "Array", "Stack", "Tree"],
      correct: 2,
    },
    {
      q: "Cấu trúc dữ liệu nào hoạt động theo nguyên tắc FIFO?",
      options: ["Stack", "Queue", "Heap", "Graph"],
      correct: 1,
    },
    {
      q: "Độ phức tạp trung bình tìm kiếm trong BST cân bằng?",
      options: ["O(n)", "O(1)", "O(n²)", "O(log n)"],
      correct: 3,
    },
    {
      q: "Thuật toán sắp xếp nào có độ phức tạp trung bình O(n log n)?",
      options: [
        "Bubble Sort",
        "Merge Sort",
        "Selection Sort",
        "Insertion Sort",
      ],
      correct: 1,
    },
    {
      q: "BFS sử dụng cấu trúc dữ liệu nào để duyệt?",
      options: ["Stack", "Heap", "Queue", "Hash Table"],
      correct: 2,
    },
    {
      q: "Min-Heap có tính chất gì?",
      options: [
        "Node cha luôn lớn hơn node con",
        "Cây luôn cân bằng hoàn hảo",
        "Node cha luôn nhỏ hơn hoặc bằng node con",
        "Không có node lá",
      ],
      correct: 2,
    },
    {
      q: "Binary Search yêu cầu điều kiện gì trên mảng đầu vào?",
      options: [
        "Không trùng lặp",
        "Có số chẵn phần tử",
        "Toàn số dương",
        "Đã được sắp xếp",
      ],
      correct: 3,
    },
    {
      q: "Độ phức tạp không gian của biểu diễn đồ thị bằng ma trận kề?",
      options: ["O(V+E)", "O(1)", "O(V²)", "O(E)"],
      correct: 2,
    },
    {
      q: 'Trong Hash Table, "collision" (đụng độ) xảy ra khi nào?',
      options: [
        "Bảng băm bị đầy",
        "Key không tồn tại",
        "Hai key khác nhau băm ra cùng 1 chỉ số",
        "Hàm băm trả về số âm",
      ],
      correct: 2,
    },
  ],
  web: [
    {
      q: "Thẻ nào dùng để tạo bảng trong HTML?",
      options: ["<div>", "<list>", "<table>", "<grid>"],
      correct: 2,
    },
    {
      q: "Thuộc tính nào giúp validate email tự động trên form?",
      options: [
        'type="email"',
        'type="text"',
        'pattern="email"',
        'type="string"',
      ],
      correct: 0,
    },
    {
      q: "CSS Flexbox dùng thuộc tính nào để canh giữa theo trục chính?",
      options: ["align-items", "flex-wrap", "text-align", "justify-content"],
      correct: 3,
    },
    {
      q: "fetch() trả về loại dữ liệu gì?",
      options: ["String", "Promise", "Number", "Boolean"],
      correct: 1,
    },
    {
      q: "LocalStorage lưu dữ liệu dưới dạng kiểu gì?",
      options: ["Object", "Array", "String", "Number"],
      correct: 2,
    },
    {
      q: "Từ khóa nào bắt buộc phải có để dùng await trong hàm?",
      options: ["function", "const", "async", "let"],
      correct: 2,
    },
    {
      q: "Trong REST API, method nào dùng để xóa 1 tài nguyên?",
      options: ["GET", "POST", "PUT", "DELETE"],
      correct: 3,
    },
    { q: "JWT gồm mấy phần?", options: ["2", "4", "1", "3"], correct: 3 },
    {
      q: "Thẻ semantic nào đại diện cho phần header của trang?",
      options: ['<div class="header">', "<head>", "<header>", "<top>"],
      correct: 2,
    },
    {
      q: "CSS Grid dùng thuộc tính nào để chia cột?",
      options: [
        "flex-direction",
        "column-count",
        "grid-template-columns",
        "display:table",
      ],
      correct: 2,
    },
  ],
  network: [
    {
      q: "Mô hình OSI có bao nhiêu tầng?",
      options: ["4", "5", "7", "6"],
      correct: 2,
    },
    {
      q: "Giao thức nào đảm bảo truyền tin cậy?",
      options: ["UDP", "IP", "TCP", "ARP"],
      correct: 2,
    },
    {
      q: "HTTPS dùng cổng mặc định nào?",
      options: ["80", "21", "443", "25"],
      correct: 2,
    },
    {
      q: "DNS dùng để làm gì?",
      options: [
        "Mã hóa dữ liệu",
        "Cấp phát IP tự động",
        "Định tuyến gói tin",
        "Dịch tên miền sang IP",
      ],
      correct: 3,
    },
    {
      q: "DHCP dùng để làm gì?",
      options: [
        "Dịch tên miền",
        "Tự động cấp IP cho thiết bị",
        "Mã hóa dữ liệu",
        "Truyền file",
      ],
      correct: 1,
    },
    {
      q: "Subnet mask /24 tương ứng với bao nhiêu host khả dụng?",
      options: ["256", "255", "254", "128"],
      correct: 2,
    },
    {
      q: "Switch hoạt động chủ yếu ở tầng nào?",
      options: [
        "Tầng 3 (Network)",
        "Tầng 4 (Transport)",
        "Tầng 7 (Application)",
        "Tầng 2 (Data Link)",
      ],
      correct: 3,
    },
    {
      q: "Router dùng thông tin gì để định tuyến gói tin?",
      options: ["Địa chỉ MAC", "Tên miền", "Địa chỉ IP đích", "Cổng TCP"],
      correct: 2,
    },
    {
      q: "FTP thường dùng cổng nào để điều khiển?",
      options: ["80", "443", "25", "21"],
      correct: 3,
    },
    {
      q: "Địa chỉ 192.168.1.1 thuộc loại nào?",
      options: ["Public", "Multicast", "Loopback", "Private"],
      correct: 3,
    },
  ],
  database: [
    {
      q: "Khóa chính (Primary Key) dùng để làm gì?",
      options: [
        "Liên kết 2 bảng",
        "Sắp xếp dữ liệu",
        "Định danh duy nhất mỗi dòng",
        "Mã hóa dữ liệu",
      ],
      correct: 2,
    },
    {
      q: "Lệnh SQL nào dùng để lấy dữ liệu?",
      options: ["INSERT", "SELECT", "UPDATE", "DELETE"],
      correct: 1,
    },
    {
      q: "INNER JOIN trả về kết quả gì?",
      options: [
        "Toàn bộ 2 bảng",
        "Chỉ bảng bên trái",
        "Chỉ các dòng khớp ở cả 2 bảng",
        "Chỉ bảng bên phải",
      ],
      correct: 2,
    },
    {
      q: "Chuẩn 1NF yêu cầu điều gì?",
      options: [
        "Không có khóa ngoại",
        "Mỗi ô chỉ chứa 1 giá trị",
        "Không có khóa chính",
        "Chỉ có 1 cột",
      ],
      correct: 1,
    },
    {
      q: "Index giúp ích gì?",
      options: [
        "Tăng tốc INSERT",
        "Giảm dung lượng ổ đĩa",
        "Tăng tốc truy vấn SELECT",
        "Mã hóa dữ liệu",
      ],
      correct: 2,
    },
    {
      q: "ACID là viết tắt của?",
      options: [
        "Access, Control, Index, Data",
        "Add, Change, Insert, Delete",
        "Atomicity, Consistency, Isolation, Durability",
        "Atomic, Class, Index, Data",
      ],
      correct: 2,
    },
    {
      q: "Khóa ngoại (Foreign Key) dùng để làm gì?",
      options: [
        "Định danh duy nhất trong bảng",
        "Tăng tốc truy vấn",
        "Liên kết đến khóa chính của bảng khác",
        "Mã hóa dữ liệu",
      ],
      correct: 2,
    },
    {
      q: "LEFT JOIN khác INNER JOIN ở điểm nào?",
      options: [
        "Chỉ lấy dòng khớp",
        "Không trả về kết quả nào",
        "Chỉ dùng được với 1 bảng",
        "Lấy toàn bộ bảng trái dù có khớp hay không",
      ],
      correct: 3,
    },
    {
      q: "Transaction dùng để làm gì?",
      options: [
        "Tăng tốc truy vấn",
        "Mã hóa mật khẩu",
        "Đảm bảo nhóm thao tác thực hiện như 1 đơn vị",
        "Sao lưu dữ liệu",
      ],
      correct: 2,
    },
    {
      q: "Cần chuẩn hóa dữ liệu (Normalization) để làm gì?",
      options: [
        "Tăng tốc độ mạng",
        "Mã hóa dữ liệu",
        "Giảm số lượng bảng",
        "Giảm dư thừa dữ liệu",
      ],
      correct: 3,
    },
  ],
  oop: [
    {
      q: "Class là gì?",
      options: [
        "Một object cụ thể",
        "Bản thiết kế/khuôn mẫu cho object",
        "Một hàm",
        "Một biến",
      ],
      correct: 1,
    },
    {
      q: "Encapsulation (đóng gói) có mục đích gì?",
      options: [
        "Tạo nhiều object cùng lúc",
        "Tăng tốc chương trình",
        "Ẩn dữ liệu, kiểm soát truy cập qua getter/setter",
        "Xóa dữ liệu không dùng",
      ],
      correct: 2,
    },
    {
      q: "Inheritance (kế thừa) giúp ích gì?",
      options: [
        "Ẩn dữ liệu",
        "Tái sử dụng code từ class cha",
        "Tạo nhiều luồng",
        "Mã hóa dữ liệu",
      ],
      correct: 1,
    },
    {
      q: "Overriding khác Overloading ở điểm gì?",
      options: [
        "Cả 2 giống hệt nhau",
        "Overloading chỉ dùng được 1 lần",
        "Overriding ghi đè phương thức cha, Overloading nhiều phương thức cùng tên khác tham số",
        "Overriding không tồn tại trong OOP",
      ],
      correct: 2,
    },
    {
      q: "Abstract class khác gì so với class thường?",
      options: [
        "Luôn nhanh hơn",
        "Không thể tạo object trực tiếp, có thể chứa phương thức chưa cài đặt",
        "Không có thuộc tính",
        "Chỉ dùng được 1 lần",
      ],
      correct: 1,
    },
    {
      q: "Một class có thể implements bao nhiêu interface?",
      options: [
        "Chỉ 1",
        "Không interface nào",
        "Nhiều interface cùng lúc",
        "Tối đa 2",
      ],
      correct: 2,
    },
    {
      q: "Polymorphism (đa hình) nghĩa là gì?",
      options: [
        "Ẩn dữ liệu",
        "Kế thừa nhiều lớp",
        "Tạo interface",
        "Cùng phương thức nhưng hành vi khác nhau tùy object",
      ],
      correct: 3,
    },
    {
      q: "Từ khóa nào dùng để kế thừa trong Java?",
      options: ["implements", "inherits", "super", "extends"],
      correct: 3,
    },
    {
      q: "Từ khóa nào dùng để implement interface trong Java?",
      options: ["extends", "interface", "abstract", "implements"],
      correct: 3,
    },
    {
      q: "Vì sao nên khai báo thuộc tính là private?",
      options: [
        "Để chương trình chạy nhanh hơn",
        "Ngăn code ngoài sửa trực tiếp, kiểm soát qua phương thức",
        "Để tiết kiệm bộ nhớ",
        "Không có lý do cụ thể",
      ],
      correct: 1,
    },
  ],
  discrete: [
    {
      q: "Mệnh đề kéo theo P→Q chỉ sai khi nào?",
      options: ["P sai, Q đúng", "Cả 2 đúng", "P đúng, Q sai", "Cả 2 sai"],
      correct: 2,
    },
    {
      q: "A∩B nghĩa là gì?",
      options: [
        "Hợp của 2 tập hợp",
        "Hiệu của 2 tập hợp",
        "Phần bù",
        "Giao của 2 tập hợp (phần tử chung)",
      ],
      correct: 3,
    },
    {
      q: "Quan hệ tương đương cần có tính chất gì?",
      options: [
        "Chỉ cần phản xạ",
        "Phản xạ, đối xứng, bắc cầu",
        "Chỉ cần đối xứng",
        "Không cần tính chất nào",
      ],
      correct: 1,
    },
    {
      q: "Hàm song ánh (bijective) là gì?",
      options: [
        "Chỉ đơn ánh",
        "Chỉ toàn ánh",
        "Vừa đơn ánh vừa toàn ánh",
        "Không đơn ánh cũng không toàn ánh",
      ],
      correct: 2,
    },
    {
      q: "Công thức tổ hợp chập k của n là gì?",
      options: ["n!/(n-k)!", "n!/k!", "n!/(k!(n-k)!)", "n × k"],
      correct: 2,
    },
    {
      q: "Có bao nhiêu cách sắp xếp 4 vật khác nhau theo thứ tự?",
      options: ["16", "8", "4", "24"],
      correct: 3,
    },
    {
      q: "Đường đi Euler yêu cầu đồ thị có bao nhiêu đỉnh bậc lẻ?",
      options: ["Luôn bằng 2", "Luôn bằng 0", "0 hoặc 2", "Không giới hạn"],
      correct: 2,
    },
    {
      q: "Phép AND (∧) cho kết quả True khi nào?",
      options: [
        "Chỉ cần 1 mệnh đề True",
        "Cả 2 đều False",
        "Không bao giờ True",
        "Cả 2 mệnh đề đều True",
      ],
      correct: 3,
    },
    {
      q: "Tập rỗng (∅) có phải tập con của mọi tập hợp không?",
      options: [
        "Sai",
        "Chỉ đúng với tập hữu hạn",
        "Chỉ đúng với tập vô hạn",
        "Đúng",
      ],
      correct: 3,
    },
    {
      q: "Chỉnh hợp (chọn k từ n, có thứ tự) ký hiệu là gì?",
      options: ["C(n,k)", "P(n)", "n^k", "A(n,k)"],
      correct: 3,
    },
  ],
  os: [
    {
      q: "Process và Thread khác nhau ở điểm gì?",
      options: [
        "Process luôn nhanh hơn Thread",
        "Thread chia sẻ bộ nhớ cùng Process, Process có vùng nhớ riêng",
        "Thread không thể chạy song song",
        "Không có sự khác biệt",
      ],
      correct: 1,
    },
    {
      q: "Thuật toán lập lịch CPU nào ưu tiên tiến trình có thời gian xử lý ngắn nhất?",
      options: ["FCFS", "Round Robin", "SJF", "Random"],
      correct: 2,
    },
    {
      q: "Deadlock xảy ra khi nào?",
      options: [
        "CPU quá tải",
        "Bộ nhớ đầy",
        "Các tiến trình chờ lẫn nhau vô thời hạn",
        "Ổ cứng hỏng",
      ],
      correct: 2,
    },
    {
      q: "Mutex dùng để làm gì?",
      options: [
        "Tăng tốc độ CPU",
        "Quản lý file",
        "Định tuyến mạng",
        "Đảm bảo chỉ 1 luồng truy cập vùng dữ liệu chung tại 1 thời điểm",
      ],
      correct: 3,
    },
    {
      q: "Phân trang (Paging) giúp tránh loại phân mảnh nào?",
      options: [
        "Phân mảnh trong",
        "Phân mảnh ngoài (external)",
        "Không tránh được loại nào",
        "Cả 2 loại",
      ],
      correct: 1,
    },
    {
      q: "Race condition là gì?",
      options: [
        "Lỗi tràn bộ nhớ",
        "Lỗi mạng",
        "Lỗi khi kết quả phụ thuộc thứ tự thực thi không kiểm soát của nhiều luồng",
        "Lỗi ổ đĩa",
      ],
      correct: 2,
    },
    {
      q: "Round Robin phù hợp nhất cho loại hệ thống nào?",
      options: [
        "Hệ thống nhúng đơn nhiệm",
        "Hệ thống chia sẻ thời gian (time-sharing)",
        "Hệ thống không có CPU",
        "Hệ thống chỉ chạy 1 tiến trình",
      ],
      correct: 1,
    },
    {
      q: "4 điều kiện gây Deadlock gồm: Loại trừ lẫn nhau, Giữ và chờ, Không thu hồi, Chờ vòng tròn — đúng hay sai?",
      options: ["Sai", "Chỉ đúng 1 phần", "Đúng", "Không có điều kiện nào"],
      correct: 2,
    },
    {
      q: "Semaphore khác Mutex ở điểm nào?",
      options: [
        "Semaphore giống hệt Mutex",
        "Semaphore chỉ dùng cho file",
        "Semaphore không liên quan đồng bộ hóa",
        "Semaphore cho phép N luồng truy cập đồng thời",
      ],
      correct: 3,
    },
    {
      q: "Metadata của file KHÔNG bao gồm thông tin nào?",
      options: [
        "Kích thước file",
        "Quyền truy cập",
        "Thời gian sửa đổi",
        "Nội dung thực của file",
      ],
      correct: 3,
    },
  ],
  architecture: [
    {
      q: "Kiến trúc Von Neumann có đặc điểm gì?",
      options: [
        "Chương trình và dữ liệu tách biệt hoàn toàn",
        "Không có CPU",
        "Chương trình và dữ liệu dùng chung 1 bộ nhớ",
        "Không có bộ nhớ",
      ],
      correct: 2,
    },
    {
      q: "ALU chịu trách nhiệm cho việc gì?",
      options: [
        "Điều khiển giải mã lệnh",
        "Lưu trữ dữ liệu dài hạn",
        "Kết nối mạng",
        "Thực hiện phép toán số học/logic",
      ],
      correct: 3,
    },
    {
      q: "Thành phần nào trong bộ nhớ phân cấp nhanh nhất?",
      options: ["RAM", "SSD", "HDD", "Register"],
      correct: 3,
    },
    {
      q: "Chu kỳ lệnh CPU gồm các bước nào theo đúng thứ tự?",
      options: [
        "Execute → Fetch → Decode",
        "Decode → Execute → Fetch",
        "Fetch → Decode → Execute",
        "Fetch → Execute → Decode",
      ],
      correct: 2,
    },
    {
      q: "Số 13 trong hệ nhị phân là gì?",
      options: ["1110", "1011", "1100", "1101"],
      correct: 3,
    },
    {
      q: "Pipeline trong CPU giúp cải thiện điều gì?",
      options: [
        "Dung lượng bộ nhớ",
        "Tốc độ mạng",
        "Độ phân giải màn hình",
        "Thông lượng xử lý lệnh",
      ],
      correct: 3,
    },
    {
      q: "Thanh ghi PC (Program Counter) lưu trữ gì?",
      options: [
        "Giá trị phép tính hiện tại",
        "Địa chỉ RAM trống",
        "Tên chương trình đang chạy",
        "Địa chỉ lệnh tiếp theo sẽ thực thi",
      ],
      correct: 3,
    },
    {
      q: "Cache dùng để làm gì?",
      options: [
        "Lưu trữ dữ liệu vĩnh viễn",
        "Kết nối Internet",
        "Hiển thị màn hình",
        "Lưu tạm dữ liệu hay dùng để truy cập nhanh hơn RAM",
      ],
      correct: 3,
    },
    {
      q: "Biểu diễn số âm phổ biến nhất trong máy tính là gì?",
      options: [
        "Dấu và độ lớn",
        "Chỉ dùng số dương",
        "Mã ASCII",
        "Bù 2 (Two's complement)",
      ],
      correct: 3,
    },
    {
      q: '"Von Neumann bottleneck" là gì?',
      options: [
        "Lỗi phần cứng CPU",
        "Virus máy tính",
        "Lỗi hệ điều hành",
        "Điểm nghẽn vì lệnh và dữ liệu chung 1 bus",
      ],
      correct: 3,
    },
  ],
  ai: [
    {
      q: "Machine Learning là gì so với AI?",
      options: [
        "Là toàn bộ AI",
        "Không liên quan đến AI",
        "Là tập con của AI, máy tự học từ dữ liệu",
        "Chỉ là 1 thuật toán duy nhất",
      ],
      correct: 2,
    },
    {
      q: "Supervised Learning cần dữ liệu như thế nào?",
      options: [
        "Không có nhãn",
        "Không cần dữ liệu",
        "Chỉ cần hình ảnh",
        "Có nhãn (label) sẵn",
      ],
      correct: 3,
    },
    {
      q: "Unsupervised Learning phổ biến nhất dùng kỹ thuật gì?",
      options: [
        "Classification",
        "Regression",
        "Backpropagation",
        "Clustering (phân cụm)",
      ],
      correct: 3,
    },
    {
      q: "Hàm kích hoạt (activation function) trong Neural Network dùng để làm gì?",
      options: [
        "Tăng tốc độ mạng",
        "Giảm dung lượng model",
        "Không có tác dụng gì",
        "Thêm tính phi tuyến giúp học quan hệ phức tạp",
      ],
      correct: 3,
    },
    {
      q: "Decision Tree có ưu điểm gì nổi bật?",
      options: [
        "Luôn chính xác 100%",
        "Không cần dữ liệu huấn luyện",
        "Chạy nhanh hơn mọi thuật toán khác",
        "Dễ diễn giải, con người hiểu được logic quyết định",
      ],
      correct: 3,
    },
    {
      q: "Thuật toán A* khác BFS ở điểm nào?",
      options: [
        "A* không cần tìm đường đi",
        "BFS luôn nhanh hơn A*",
        "Không có gì khác biệt",
        "A* dùng heuristic để ưu tiên hướng gần đích hơn",
      ],
      correct: 3,
    },
    {
      q: "Trong Minimax, người chơi Max muốn gì?",
      options: [
        "Tối thiểu hóa điểm số một cách ngẫu nhiên",
        "Không quan tâm kết quả",
        "Luôn thua",
        "Tối đa hóa điểm số của mình",
      ],
      correct: 3,
    },
    {
      q: "Deep Learning khác ML truyền thống ở điểm nào?",
      options: [
        "Không cần dữ liệu",
        "Luôn nhanh hơn",
        "Không liên quan tới ML",
        "Dùng mạng nơ-ron nhiều lớp, cần nhiều dữ liệu và tính toán hơn",
      ],
      correct: 3,
    },
    {
      q: "Classification khác Regression ở điểm nào?",
      options: [
        "Regression luôn chính xác hơn",
        "Classification không dùng được cho ML",
        "Không có sự khác biệt",
        "Output là nhãn rời rạc thay vì số liên tục",
      ],
      correct: 3,
    },
    {
      q: "Heuristic trong tìm kiếm AI dùng để làm gì?",
      options: [
        "Tăng tốc độ CPU",
        "Mã hóa dữ liệu",
        "Không có tác dụng gì",
        "Ước lượng khoảng cách còn lại tới đích để ưu tiên hướng đi",
      ],
      correct: 3,
    },
  ],
};

let currentQuizSubject = null;
let currentQuizAnswers = {};

function renderQuizSubjectGrid() {
  const grid = document.getElementById("quizSubjectGrid");
  if (!grid) return;
  grid.innerHTML = quizSubjects
    .map((s) => {
      const best = getBestQuizScore(s.slug);
      return `
      <div class="cs-subject-card" onclick="startQuiz('${s.slug}')">
        <div class="cs-subject-icon">${s.icon}</div>
        <div class="cs-subject-name">${s.name}</div>
        <div class="cs-subject-status ${best !== null ? "ready" : ""}">${best !== null ? `✅ Điểm cao nhất: ${best}/10` : `${quizBank[s.slug].length} câu hỏi`}</div>
      </div>`;
    })
    .join("");
}

function quizScoreStorageKey(subject) {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return `quizScore_${subject}_${currentUser}`;
}

function getBestQuizScore(subject) {
  const raw = localStorage.getItem(quizScoreStorageKey(subject));
  if (!raw) return null;
  const data = JSON.parse(raw);
  return data.best;
}

function startQuiz(subject) {
  currentQuizSubject = subject;
  currentQuizAnswers = {};
  const subjectInfo = quizSubjects.find((s) => s.slug === subject);
  document.getElementById("quizAreaTitle").textContent =
    `${subjectInfo.icon} Kiểm tra: ${subjectInfo.name}`;
  document.getElementById("quizAreaCard").style.display = "block";
  document.getElementById("quizResultBox").style.display = "none";
  document.getElementById("quizSubmitBtn").style.display = "inline-block";

  const questions = quizBank[subject];
  const container = document.getElementById("quizQuestionsContainer");
  container.innerHTML = questions
    .map(
      (q, qIdx) => `
    <div class="quiz-question-block" id="quizQ${qIdx}">
      <div class="quiz-question-title">Câu ${qIdx + 1}: ${q.q}</div>
      ${q.options
        .map(
          (opt, optIdx) => `
        <label class="quiz-option-label" id="quizQ${qIdx}_opt${optIdx}">
          <input type="radio" name="quizQ${qIdx}" value="${optIdx}" onchange="currentQuizAnswers[${qIdx}] = ${optIdx}">
          ${opt}
        </label>`,
        )
        .join("")}
    </div>`,
    )
    .join("");

  document
    .getElementById("quizAreaCard")
    .scrollIntoView({ behavior: "smooth" });
}

function closeQuizArea() {
  document.getElementById("quizAreaCard").style.display = "none";
  currentQuizSubject = null;
  currentQuizAnswers = {};
}

function submitQuiz() {
  const questions = quizBank[currentQuizSubject];
  let score = 0;

  questions.forEach((q, qIdx) => {
    const chosen = currentQuizAnswers[qIdx];
    const correctLabel = document.getElementById(
      `quizQ${qIdx}_opt${q.correct}`,
    );
    if (correctLabel) correctLabel.classList.add("correct");
    if (chosen === q.correct) {
      score++;
    } else if (chosen !== undefined) {
      const wrongLabel = document.getElementById(`quizQ${qIdx}_opt${chosen}`);
      if (wrongLabel) wrongLabel.classList.add("wrong");
    }
  });

  const total = questions.length;
  const key = quizScoreStorageKey(currentQuizSubject);
  const prevData = JSON.parse(localStorage.getItem(key)) || {
    best: 0,
    attempts: 0,
  };
  const newBest = Math.max(prevData.best, score);
  localStorage.setItem(
    key,
    JSON.stringify({
      best: newBest,
      attempts: prevData.attempts + 1,
      lastScore: score,
      lastAt: Date.now(),
    }),
  );

  awardXp(score * 5);

  const resultBox = document.getElementById("quizResultBox");
  resultBox.style.display = "block";
  resultBox.innerHTML = `
    <div class="quiz-score-chip">Điểm của bạn: ${score}/${total}</div>
    <p style="font-size:12px;color:var(--text-muted);margin-top:10px;">Đáp án đúng đã được tô xanh, đáp án bạn chọn sai (nếu có) tô đỏ. Cuộn lên để xem chi tiết từng câu.</p>
  `;
  document.getElementById("quizSubmitBtn").style.display = "none";
  showToast(
    `Nộp bài xong! Điểm: ${score}/${total}`,
    score >= total * 0.7 ? "success" : "info",
  );

  renderQuizSubjectGrid();
  renderQuizStats();
  renderDashboardSubjectProgress();
}

// ---- Thống kê & "Xếp hạng" trong phạm vi các tài khoản trên trình duyệt này ----
function renderQuizStats() {
  const box = document.getElementById("quizStatsBox");
  if (!box) return;

  const rows = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("quizScore_")) {
      const parts = key.replace("quizScore_", "").split("_");
      const user = parts.pop();
      const subject = parts.join("_");
      const data = JSON.parse(localStorage.getItem(key));
      const subjectInfo = quizSubjects.find((s) => s.slug === subject);
      rows.push({
        user,
        subject: subjectInfo ? subjectInfo.name : subject,
        best: data.best,
        attempts: data.attempts,
      });
    }
  }

  if (rows.length === 0) {
    box.innerHTML = `<p style="font-size:12px;color:var(--text-muted);">Chưa có ai làm bài kiểm tra nào trên trình duyệt này.</p>`;
    return;
  }

  rows.sort((a, b) => b.best - a.best);
  box.innerHTML = `
    <table class="bigo-table">
      <tr><th>Hạng</th><th>Tài khoản</th><th>Môn</th><th>Điểm cao nhất</th><th>Số lần làm</th></tr>
      ${rows
        .map(
          (r, idx) => `
        <tr><td>#${idx + 1}</td><td>${r.user}</td><td>${r.subject}</td><td>${r.best}/10</td><td>${r.attempts}</td></tr>`,
        )
        .join("")}
    </table>
  `;
}

// ==========================================
// DASHBOARD SINH VIÊN (Section 9)
// ==========================================

// ---- GPA Calculator ----
function gpaStorageKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "gpaCourses_" + currentUser;
}
function getGpaCourses() {
  return (
    JSON.parse(localStorage.getItem(gpaStorageKey())) || [
      { name: "", credits: 3, grade: 8 },
    ]
  );
}
function saveGpaCourses(courses) {
  localStorage.setItem(gpaStorageKey(), JSON.stringify(courses));
}

function renderGpaTable() {
  const table = document.getElementById("gpaTable");
  if (!table) return;
  const courses = getGpaCourses();

  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });

  courses.forEach((c, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="text" value="${c.name}" placeholder="Tên môn học" onchange="updateGpaCourse(${idx}, 'name', this.value)"></td>
      <td><input type="number" value="${c.credits}" min="1" max="10" style="width:70px;" onchange="updateGpaCourse(${idx}, 'credits', this.value)"></td>
      <td><input type="number" value="${c.grade}" min="0" max="10" step="0.1" style="width:70px;" onchange="updateGpaCourse(${idx}, 'grade', this.value)"></td>
      <td><span class="delete-btn" onclick="removeGpaRow(${idx})">✕</span></td>
    `;
    table.appendChild(tr);
  });
}

function updateGpaCourse(idx, field, value) {
  const courses = getGpaCourses();
  courses[idx][field] = field === "name" ? value : parseFloat(value) || 0;
  saveGpaCourses(courses);
}

function addGpaRow() {
  const courses = getGpaCourses();
  courses.push({ name: "", credits: 3, grade: 8 });
  saveGpaCourses(courses);
  renderGpaTable();
}

function removeGpaRow(idx) {
  const courses = getGpaCourses();
  courses.splice(idx, 1);
  saveGpaCourses(courses);
  renderGpaTable();
}

function computeGpa() {
  const courses = getGpaCourses();
  const resultBox = document.getElementById("gpaResult");
  resultBox.style.display = "block";

  const validCourses = courses.filter((c) => c.name.trim() && c.credits > 0);
  if (validCourses.length === 0) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ Vui lòng nhập ít nhất 1 môn học có tên và số tín chỉ hợp lệ!</span>`;
    return;
  }

  const totalCredits = validCourses.reduce((sum, c) => sum + c.credits, 0);
  const weightedSum = validCourses.reduce(
    (sum, c) => sum + c.credits * c.grade,
    0,
  );
  const gpa = weightedSum / totalCredits;

  let classification;
  if (gpa >= 9) classification = "Xuất sắc";
  else if (gpa >= 8) classification = "Giỏi";
  else if (gpa >= 7) classification = "Khá";
  else if (gpa >= 5) classification = "Trung bình";
  else classification = "Yếu";

  resultBox.innerHTML = `
    <table class="bigo-table">
      <tr><td>GPA (thang 10)</td><td style="font-weight:700;color:var(--accent);">${fmtNum(gpa)}</td></tr>
      <tr><td>Tổng tín chỉ đã nhập</td><td>${totalCredits}</td></tr>
      <tr><td>Xếp loại học lực</td><td>${classification}</td></tr>
    </table>
  `;
  showToast("Tính GPA hoàn tất!", "success");
  renderDashboardOverview();
}

// ---- Tín chỉ tích lũy ----
function creditTargetKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "creditTarget_" + currentUser;
}
function saveCreditTarget() {
  const val =
    parseInt(document.getElementById("creditTargetInput").value) || 130;
  localStorage.setItem(creditTargetKey(), val);
  renderCreditProgress();
}
function renderCreditProgress() {
  const box = document.getElementById("creditProgressBox");
  const targetInput = document.getElementById("creditTargetInput");
  if (!box || !targetInput) return;

  const savedTarget = localStorage.getItem(creditTargetKey());
  if (savedTarget) targetInput.value = savedTarget;
  const target = parseInt(targetInput.value) || 130;

  const courses = getGpaCourses().filter((c) => c.name.trim() && c.credits > 0);
  const accumulated = courses.reduce((sum, c) => sum + c.credits, 0);
  const percent = Math.min(100, Math.round((accumulated / target) * 100));

  box.innerHTML = `
    <p style="font-size:13px;color:var(--text-main);margin-bottom:8px;">${accumulated} / ${target} tín chỉ (${percent}%)</p>
    <div class="progress-track"><div class="progress-fill" style="width:${percent}%;"></div></div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:8px;">Tính dựa trên các môn đã nhập ở bảng GPA Calculator phía trên.</p>
  `;
}

// ---- Lịch học trong tuần ----
function scheduleStorageKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "schedule_" + currentUser;
}
function getScheduleItems() {
  return JSON.parse(localStorage.getItem(scheduleStorageKey())) || [];
}
function saveScheduleItems(items) {
  localStorage.setItem(scheduleStorageKey(), JSON.stringify(items));
}

function addScheduleItem() {
  const name = document.getElementById("scheduleClassName").value.trim();
  const day = document.getElementById("scheduleDay").value;
  const time = document.getElementById("scheduleTime").value.trim();
  const room = document.getElementById("scheduleRoom").value.trim();

  if (!name || !time) {
    showToast("Vui lòng nhập tên môn học và giờ học!", "error");
    return;
  }

  const items = getScheduleItems();
  items.push({ id: generateTaskId(), name, day, time, room });
  saveScheduleItems(items);

  document.getElementById("scheduleClassName").value = "";
  document.getElementById("scheduleTime").value = "";
  document.getElementById("scheduleRoom").value = "";

  renderScheduleList();
  showToast("Đã thêm vào lịch học!", "success");
}

function removeScheduleItem(id) {
  const items = getScheduleItems().filter((i) => i.id !== id);
  saveScheduleItems(items);
  renderScheduleList();
}

const dayOrder = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

function renderScheduleList() {
  const list = document.getElementById("scheduleList");
  if (!list) return;
  const items = getScheduleItems()
    .slice()
    .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
      <li>
        <span class="task-text"><b>${item.day}</b> — ${item.name} (${item.time}${item.room ? ", " + item.room : ""})</span>
        <span class="delete-btn" onclick="removeScheduleItem('${item.id}')">✕</span>
      </li>`,
        )
        .join("")
    : `<li style="color:var(--text-muted);">Chưa có lịch học nào được thêm.</li>`;
}

// ---- Deadline đồ án sắp tới (lấy từ Task Kanban đã có sẵn) ----
function renderDashboardUpcomingTasks() {
  const box = document.getElementById("dashboardUpcomingTasks");
  if (!box) return;

  const tasks = getTasks().filter((t) => t.deadline && t.status !== "done");
  const now = Date.now();
  const upcoming = tasks
    .filter(
      (t) => new Date(t.deadline).getTime() - now < 7 * 24 * 60 * 60 * 1000,
    )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (upcoming.length === 0) {
    box.innerHTML = `<p style="font-size:12px;color:var(--text-muted);">Không có deadline nào trong 7 ngày tới. 🎉</p>`;
    return;
  }

  box.innerHTML = upcoming
    .map((t) => {
      const countdown = getCountdownInfo(t.deadline);
      return `
      <div class="upcoming-task-row">
        <span>${t.icon || "📌"} ${t.name}</span>
        <span class="countdown-badge ${countdown.cssClass} ${countdown.blink ? "blink" : ""}">${countdown.text}</span>
      </div>`;
    })
    .join("");
}

// ---- Tiến độ học từng môn (lấy từ dữ liệu Quiz đã có sẵn) ----
function renderDashboardSubjectProgress() {
  const table = document.getElementById("dashboardSubjectProgress");
  if (!table) return;

  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });

  quizSubjects.forEach((s) => {
    const best = getBestQuizScore(s.slug);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.icon} ${s.name}</td>
      <td>${best !== null ? "✅ Đã làm bài" : "⬜ Chưa làm bài"}</td>
      <td>${best !== null ? best + "/10" : "—"}</td>
    `;
    table.appendChild(tr);
  });
}

// ---- Tổng quan học tập ----
function renderDashboardOverview() {
  const box = document.getElementById("dashboardOverviewStats");
  if (!box) return;

  const tasks = getTasks();
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const courses = getGpaCourses().filter((c) => c.name.trim());
  const gpa =
    courses.length > 0
      ? fmtNum(
          courses.reduce((sum, c) => sum + c.credits * c.grade, 0) /
            courses.reduce((sum, c) => sum + c.credits, 0),
        )
      : "—";

  let quizAttempted = 0;
  quizSubjects.forEach((s) => {
    if (getBestQuizScore(s.slug) !== null) quizAttempted++;
  });

  const rank = getCurrentRank();

  const stats = [
    { label: "GPA hiện tại", value: gpa },
    { label: "Task hoàn thành", value: doneTasks + "/" + tasks.length },
    { label: "Môn đã kiểm tra", value: quizAttempted + "/10" },
    { label: "Cấp bậc", value: rank.name },
  ];

  box.innerHTML = stats
    .map(
      (s) => `
    <div class="stat-chip">
      <div class="stat-value" style="font-size:16px;">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>`,
    )
    .join("");
}

// Khởi tạo Dashboard + Quiz khi trang tải xong (nếu đã đăng nhập)
function initDashboardAndQuiz() {
  if (document.getElementById("gpaTable")) {
    renderGpaTable();
    renderCreditProgress();
    renderScheduleList();
    renderDashboardUpcomingTasks();
    renderDashboardSubjectProgress();
    renderDashboardOverview();
  }
  if (document.getElementById("quizSubjectGrid")) {
    renderQuizSubjectGrid();
    renderQuizStats();
  }
}

// ==========================================
// HỆ THỐNG CẤP BẬC (XP & Rank) - Section 1
// ==========================================
const RANK_THRESHOLDS = [
  { min: 0, name: "🌱 Newbie" },
  { min: 100, name: "📘 Student" },
  { min: 300, name: "📗 Advanced Student" },
  { min: 600, name: "💻 Developer" },
  { min: 1000, name: "🏆 Senior Developer" },
];

function xpStorageKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "userXp_" + currentUser;
}

function getXp() {
  return parseInt(localStorage.getItem(xpStorageKey())) || 0;
}

function awardXp(amount) {
  const newXp = getXp() + amount;
  localStorage.setItem(xpStorageKey(), newXp);

  const oldRank = getCurrentRank(newXp - amount);
  const newRank = getCurrentRank(newXp);
  if (newRank.name !== oldRank.name) {
    showToast(`🎉 Chúc mừng! Bạn đã lên cấp bậc: ${newRank.name}`, "success");
  }
}

function getCurrentRank(xp) {
  if (xp === undefined) xp = getXp();
  let rank = RANK_THRESHOLDS[0];
  for (const r of RANK_THRESHOLDS) {
    if (xp >= r.min) rank = r;
  }
  return rank;
}

function getNextRank(xp) {
  if (xp === undefined) xp = getXp();
  return RANK_THRESHOLDS.find((r) => r.min > xp) || null;
}

// ==========================================
// HỒ SƠ CÁ NHÂN GIỐNG FACEBOOK + ẢNH BÌA (Section 1 nâng cấp)
// ==========================================
function handleCoverFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const targetW = 1200,
        targetH = 400;
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      const scale = Math.max(targetW / img.width, targetH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      ctx.drawImage(
        img,
        (targetW - drawW) / 2,
        (targetH - drawH) / 2,
        drawW,
        drawH,
      );
      persistUserCover(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function persistUserCover(dataUrl) {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;
  const dataKey = "accountData_" + currentUser;
  let accData = JSON.parse(localStorage.getItem(dataKey)) || {};
  accData.cover = dataUrl;
  localStorage.setItem(dataKey, JSON.stringify(accData));
  showToast("Đã cập nhật ảnh bìa!", "success");
  loadProfileModalData();
}

function openProfileModal() {
  closeAccountDropdown();
  loadProfileModalData();
  document.getElementById("profileModalOverlay").classList.add("active");
}
function closeProfileModal() {
  document.getElementById("profileModalOverlay").classList.remove("active");
}

function loadProfileModalData() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  const accData =
    JSON.parse(localStorage.getItem("accountData_" + currentUser)) || {};

  document.getElementById("profileNameDisplay").textContent = currentUser;

  const coverEl = document.getElementById("profileCoverDisplay");
  coverEl.style.backgroundImage = accData.cover ? `url(${accData.cover})` : "";

  const avatarEl = document.getElementById("profileAvatarDisplay");
  avatarEl.innerHTML = accData.avatar
    ? `<img src="${accData.avatar}" alt="Avatar">`
    : currentUser.charAt(0).toUpperCase();

  const xp = getXp();
  const rank = getCurrentRank(xp);
  const nextRank = getNextRank(xp);
  document.getElementById("profileRankBadge").textContent = rank.name;

  const totalTimeKey = "totalUsageTime_" + currentUser;
  const totalSeconds = parseInt(localStorage.getItem(totalTimeKey)) || 0;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const tasksDone = getTasks().filter((t) => t.status === "done").length;

  document.getElementById("profileStatsRow").innerHTML = `
    <div class="stat-chip"><div class="stat-value" style="font-size:16px;">${xp} XP</div><div class="stat-label">Điểm kinh nghiệm</div></div>
    <div class="stat-chip"><div class="stat-value" style="font-size:16px;">${totalMinutes} phút</div><div class="stat-label">Thời gian sử dụng</div></div>
    <div class="stat-chip"><div class="stat-value" style="font-size:16px;">${tasksDone}</div><div class="stat-label">Task hoàn thành</div></div>
  `;

  const xpProgressBox = document.getElementById("profileXpProgress");
  if (nextRank) {
    const rangeStart = rank.min;
    const rangeEnd = nextRank.min;
    const percent = Math.round(
      ((xp - rangeStart) / (rangeEnd - rangeStart)) * 100,
    );
    xpProgressBox.innerHTML = `
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${xp} / ${rangeEnd} XP để lên ${nextRank.name}</p>
      <div class="progress-track"><div class="progress-fill" style="width:${percent}%;"></div></div>
    `;
  } else {
    xpProgressBox.innerHTML = `<p style="font-size:12px;color:#30d158;">🏆 Đã đạt cấp bậc cao nhất!</p>`;
  }

  document.getElementById("profileDeviceInfo").textContent = getDeviceInfo();

  const history = getLoginHistory(currentUser);
  document.getElementById("profileLoginHistory").innerHTML = history.length
    ? history
        .map(
          (h) => `
      <div class="yt-video-row" style="cursor:default;">
        <div class="yt-video-info">
          <div class="yt-video-title">${new Date(h.time).toLocaleString("vi-VN")}</div>
          <div class="yt-video-sub">${h.device}</div>
        </div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa có lịch sử đăng nhập.</div>`;
}
