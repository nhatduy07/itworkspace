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

// ==========================================
// TMDb API KEY - CÙNG CƠ CHẾ VỚI YOUTUBE (dùng cho mục 🎬 Phim)
// ==========================================
function getTmdbApiKey() {
  return localStorage.getItem("userTmdbApiKey") || "";
}
function saveTmdbApiKey() {
  const input = document.getElementById("settingTmdbApiKey");
  if (!input) return;
  localStorage.setItem("userTmdbApiKey", input.value.trim());
}
function loadTmdbApiKey() {
  const input = document.getElementById("settingTmdbApiKey");
  if (input) input.value = localStorage.getItem("userTmdbApiKey") || "";
}

// ==========================================
// THESPORTSDB API KEY - CÙNG CƠ CHẾ VỚI YOUTUBE/TMDb (dùng cho mục ⚡ Tỷ số trực tiếp MU)
// ==========================================
function getSportsDbApiKey() {
  // "3" là key dùng thử công khai chính thức của TheSportsDB, luôn miễn phí
  // cho dữ liệu cơ bản — dùng làm mặc định để tính năng chạy được ngay mà
  // không cần cấu hình, người dùng có thể đổi bằng key riêng nếu cần.
  return localStorage.getItem("userSportsDbApiKey") || "3";
}
function saveSportsDbApiKey() {
  const input = document.getElementById("settingSportsDbApiKey");
  if (!input) return;
  localStorage.setItem("userSportsDbApiKey", input.value.trim());
}
function loadSportsDbApiKey() {
  const input = document.getElementById("settingSportsDbApiKey");
  if (input) input.value = localStorage.getItem("userSportsDbApiKey") || "";
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
  loadTmdbApiKey();
  loadSportsDbApiKey();
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
// PHIÊN LÀM VIỆC CỤC BỘ (ĐÃ BỎ ĐĂNG NHẬP/ĐĂNG KÝ)
// ==========================================
// Toàn bộ dữ liệu (task, avatar, cài đặt, điểm quiz, tiến độ học...) giờ chỉ
// lưu bằng LocalStorage ngay trên trình duyệt này — không cần tài khoản,
// không cần mật khẩu, không cần đăng nhập. Mọi hàm cũ vẫn dùng
// sessionStorage.getItem("currentUser") để tạo key lưu trữ, nên ta chỉ cần
// gán sẵn 1 "hồ sơ cục bộ" cố định ngay khi mở trang là toàn bộ phần còn lại
// của app hoạt động y như cũ, không cần sửa hàng chục hàm khác.
let loginStartTime = null;
let usageTimerInterval = null;
const LOCAL_USER = "Bạn";

window.addEventListener("DOMContentLoaded", () => {
  updateOnlineStatusDisplay();

  sessionStorage.setItem("itDashboardLogged", "true");
  sessionStorage.setItem("currentUser", LOCAL_USER);

  const dataKey = "accountData_" + LOCAL_USER;
  if (!localStorage.getItem(dataKey)) {
    localStorage.setItem(
      dataKey,
      JSON.stringify({ avatar: "", cover: "", bio: "" }),
    );
  }

  loginStartTime =
    parseInt(sessionStorage.getItem("loginStartTime")) || Date.now();
  sessionStorage.setItem("loginStartTime", loginStartTime);

  updateAccountHeaderUI();
  startUsageTracking();
  loadUserSettings();
  loadUserHeaderProfile();
  loadMessengerConversations();
  renderTaskBoard();
  renderYtLists();
  renderSpotifyLists();
  initDashboardAndQuiz();
  initMuTab();
  initAnalyticsTab();
  initNewsHub();
  initDevHub();
  initWeatherTab();
  renderGasPriceChart();
});

// ---- Nhận diện thiết bị/trình duyệt cơ bản từ userAgent (dùng ở tab Analytics) ----
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

// Thay cho "Đăng xuất" cũ — vì không còn tài khoản để đăng xuất, nút này cho
// phép xóa sạch toàn bộ dữ liệu cục bộ (task, avatar, cài đặt, điểm số...) để
// bắt đầu lại từ đầu, có xác nhận trước khi xóa để tránh bấm nhầm.
function resetAllLocalData() {
  if (
    !confirm(
      "Xóa TOÀN BỘ dữ liệu đã lưu trên trình duyệt này (task, avatar, cài đặt, điểm số...)? Hành động này không thể hoàn tác!",
    )
  ) {
    return;
  }
  saveCurrentSessionTime();
  if (usageTimerInterval) clearInterval(usageTimerInterval);
  localStorage.clear();
  sessionStorage.clear();
  location.reload();
}

// Điều hướng Tab & Viên chỉ báo trượt theo chiều dọc (sidebar)
const tabBtns = document.querySelectorAll(".tab-btn");
const pillIndicator = document.querySelector(".pill-indicator");

function positionSidebarPill(btn) {
  if (!pillIndicator || !btn) return;
  pillIndicator.style.transform = `translateY(${btn.offsetTop}px)`;
  pillIndicator.style.height = `${btn.offsetHeight}px`;
}

tabBtns.forEach((btn) => {
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
    if (targetTab === "analytics") {
      initAnalyticsTab();
    }

    positionSidebarPill(btn);
  });
});

// Đặt vị trí viên chỉ báo đúng ngay khi tải trang (khớp với tab đang active)
window.addEventListener("DOMContentLoaded", () => {
  const activeBtn = document.querySelector(".tab-btn.active") || tabBtns[0];
  positionSidebarPill(activeBtn);
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
}

// ==========================================
// TRUNG TÂM GIẢI TRÍ NÂNG CẤP - CHUYỂN SUBTAB
// ==========================================
function switchEntView(view) {
  document
    .querySelectorAll("#entSubtabs .yt-subtab-btn")
    .forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(
    `#entSubtabs .yt-subtab-btn[data-entview="${view}"]`,
  );
  if (btn) btn.classList.add("active");

  document
    .querySelectorAll(".entertainment-subpanel")
    .forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById("ent-" + view);
  if (panel) panel.classList.add("active");

  // Khởi tạo nội dung lần đầu mở từng mục
  if (view === "fun" && !document.getElementById("dailyQuoteBox").innerHTML)
    renderDailyQuote();
  if (view === "widgets") renderWorldClock();
  if (view === "gaming") renderGameList();
  if (view === "anime") renderAnimeFavorites();
  if (view === "manga") renderMangaProgress();
}

// ==========================================
// 🎬 PHIM (TMDb API)
// ==========================================
async function searchMovies() {
  const query = document.getElementById("movieSearchInput").value.trim();
  if (!query) return;
  await tmdbFetchAndRender(
    `https://api.themoviedb.org/3/search/movie?api_key=${getTmdbApiKey()}&query=${encodeURIComponent(query)}&language=vi-VN`,
  );
}
async function loadPopularMovies() {
  await tmdbFetchAndRender(
    `https://api.themoviedb.org/3/movie/popular?api_key=${getTmdbApiKey()}&language=vi-VN`,
  );
}

async function tmdbFetchAndRender(url) {
  const resultsDiv = document.getElementById("movieResults");
  resultsDiv.style.display = "block";

  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    resultsDiv.innerHTML = `
      <div style="padding: 15px; text-align: center; color: #ff453a; border: 1px solid #ff453a; border-radius: 12px;">
        <b>Lỗi: Thiếu TMDb API Key!</b><br>
        <span style="font-size: 12px; color: var(--text-muted);">Vào tab ⚙️ Cài Đặt và dán API Key cá nhân của bạn.</span>
      </div>`;
    return;
  }

  resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--accent);">Đang tải phim...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status_message) {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi API: ${data.status_message}</div>`;
      return;
    }
    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Không tìm thấy phim nào.</div>`;
      return;
    }

    resultsDiv.style.display = "grid";
    resultsDiv.innerHTML = data.results
      .slice(0, 12)
      .map((m) => {
        const poster = m.poster_path
          ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
          : "";
        const year = (m.release_date || "").slice(0, 4);
        return `
        <div class="result-item-grid" onclick="searchMovieTrailer('${(m.title || "").replace(/'/g, "")}')" style="cursor: pointer;">
          ${poster ? `<img src="${poster}" alt="${m.title}">` : `<div style="aspect-ratio:16/9;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:12px;">Không có poster</div>`}
          <div class="info">
            <div class="title">${m.title}</div>
            <div class="channel">${year || "—"} • ⭐ ${m.vote_average ? m.vote_average.toFixed(1) : "—"} (TMDb)</div>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi mạng hoặc không thể kết nối tới TMDb API.</div>`;
  }
}

// Xem trailer: điều hướng sang mục Video, tìm sẵn "{tên phim} official trailer"
function searchMovieTrailer(title) {
  document.querySelector('.tab-btn[data-tab="entertainment"]').click();
  setTimeout(() => {
    switchEntView("video");
    document.getElementById("ytInput").value = title + " official trailer";
    handleYouTubeAction();
  }, 150);
}

// ==========================================
// 📺 ANIME (Jikan / MyAnimeList API — MIỄN PHÍ, KHÔNG CẦN KEY)
// ==========================================
async function searchAnime() {
  const query = document.getElementById("animeSearchInput").value.trim();
  if (!query) return;
  await jikanFetchAndRender(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`,
    "animeResults",
    "anime",
  );
}
async function loadTopAnime() {
  await jikanFetchAndRender(
    `https://api.jikan.moe/v4/top/anime?filter=airing&limit=12`,
    "animeResults",
    "anime",
  );
}
async function searchManga() {
  const query = document.getElementById("mangaSearchInput").value.trim();
  if (!query) return;
  await jikanFetchAndRender(
    `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=12`,
    "mangaResults",
    "manga",
  );
}
async function loadTopManga() {
  await jikanFetchAndRender(
    `https://api.jikan.moe/v4/top/manga?limit=12`,
    "mangaResults",
    "manga",
  );
}

async function jikanFetchAndRender(url, containerId, kind) {
  const resultsDiv = document.getElementById(containerId);
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--accent);">Đang tải...</div>`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data || data.data.length === 0) {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Không tìm thấy kết quả nào.</div>`;
      return;
    }

    resultsDiv.style.display = "grid";
    resultsDiv.innerHTML = data.data
      .map((item) => {
        const title = item.title;
        const image =
          item.images && item.images.jpg ? item.images.jpg.image_url : "";
        const score = item.score ? `⭐ ${item.score}` : "Chưa có điểm";
        const idAttr = item.mal_id;
        const actionFn =
          kind === "anime"
            ? `toggleAnimeFavorite(${idAttr}, '${title.replace(/'/g, "")}', '${image}')`
            : `addMangaProgress(${idAttr}, '${title.replace(/'/g, "")}', '${image}')`;
        return `
        <div class="result-item-grid" style="cursor: default;">
          ${image ? `<img src="${image}" alt="${title}">` : ""}
          <div class="info">
            <div class="title" title="${title}">${title}</div>
            <div class="channel">${score}</div>
          </div>
          <div class="yt-card-actions">
            <button class="task-action-btn" onclick="${actionFn}">${kind === "anime" ? "⭐ Yêu thích" : "🔖 Theo dõi"}</button>
          </div>
        </div>`;
      })
      .join("");
  } catch (err) {
    resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi mạng hoặc Jikan API đang giới hạn tốc độ (rate limit) — thử lại sau vài giây.</div>`;
  }
}

// ---- Anime yêu thích ----
function animeFavKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "animeFavorites_" + currentUser;
}
function getAnimeFavorites() {
  return JSON.parse(localStorage.getItem(animeFavKey())) || [];
}
function toggleAnimeFavorite(id, title, image) {
  let list = getAnimeFavorites();
  if (list.find((a) => a.id === id)) {
    list = list.filter((a) => a.id !== id);
    showToast("Đã bỏ khỏi yêu thích", "info");
  } else {
    list.unshift({ id, title, image });
    showToast("Đã thêm vào anime yêu thích!", "success");
  }
  localStorage.setItem(animeFavKey(), JSON.stringify(list));
  renderAnimeFavorites();
}
function renderAnimeFavorites() {
  const box = document.getElementById("animeFavoritesList");
  if (!box) return;
  const list = getAnimeFavorites();
  box.innerHTML = list.length
    ? list
        .map(
          (a) => `
      <div class="yt-video-row" style="cursor: default;">
        <img src="${a.image}" alt="${a.title}">
        <div class="yt-video-info"><div class="yt-video-title">${a.title}</div></div>
        <div class="yt-video-actions">
          <span class="yt-icon-btn" onclick="toggleAnimeFavorite(${a.id}, '${a.title.replace(/'/g, "")}', '${a.image}')">🗑</span>
        </div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa có anime yêu thích nào.</div>`;
}

// ---- Manga: tiến độ đọc + bookmark chương ----
function mangaProgressKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "mangaProgress_" + currentUser;
}
function getMangaProgress() {
  return JSON.parse(localStorage.getItem(mangaProgressKey())) || [];
}
function addMangaProgress(id, title, image) {
  let list = getMangaProgress();
  if (!list.find((m) => m.id === id)) {
    list.unshift({ id, title, image, chapter: 0 });
    localStorage.setItem(mangaProgressKey(), JSON.stringify(list));
    showToast("Đã thêm vào danh sách theo dõi!", "success");
    renderMangaProgress();
  } else {
    showToast("Manga này đã có trong danh sách theo dõi rồi", "info");
  }
}
function updateMangaChapter(id, chapter) {
  const list = getMangaProgress();
  const item = list.find((m) => m.id === id);
  if (item) item.chapter = parseInt(chapter) || 0;
  localStorage.setItem(mangaProgressKey(), JSON.stringify(list));
}
function removeMangaProgress(id) {
  const list = getMangaProgress().filter((m) => m.id !== id);
  localStorage.setItem(mangaProgressKey(), JSON.stringify(list));
  renderMangaProgress();
}
function renderMangaProgress() {
  const box = document.getElementById("mangaProgressList");
  if (!box) return;
  const list = getMangaProgress();
  box.innerHTML = list.length
    ? list
        .map(
          (m) => `
      <div class="yt-video-row" style="cursor: default;">
        <img src="${m.image}" alt="${m.title}">
        <div class="yt-video-info">
          <div class="yt-video-title">${m.title}</div>
          <div class="yt-video-sub">Đang đọc chương:
            <input type="number" value="${m.chapter}" min="0" style="width:60px;display:inline-block;" onchange="updateMangaChapter(${m.id}, this.value)">
          </div>
        </div>
        <div class="yt-video-actions">
          <span class="yt-icon-btn" onclick="removeMangaProgress(${m.id})">🗑</span>
        </div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa theo dõi manga nào.</div>`;
}

// ==========================================
// 🎮 GAMING (Sổ theo dõi cá nhân — LocalStorage)
// ==========================================
function gameListKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "gameList_" + currentUser;
}
function getGameList() {
  return JSON.parse(localStorage.getItem(gameListKey())) || [];
}
function saveGameList(list) {
  localStorage.setItem(gameListKey(), JSON.stringify(list));
}

let currentGameFilter = "all";

function addGameEntry() {
  const name = document.getElementById("gameNameInput").value.trim();
  const platform = document.getElementById("gamePlatformInput").value;
  const status = document.getElementById("gameStatusInput").value;
  if (!name) {
    showToast("Vui lòng nhập tên game!", "error");
    return;
  }
  const list = getGameList();
  list.unshift({ id: generateTaskId(), name, platform, status });
  saveGameList(list);
  document.getElementById("gameNameInput").value = "";
  renderGameList();
  showToast("Đã thêm game: " + name, "success");
}

function removeGameEntry(id) {
  saveGameList(getGameList().filter((g) => g.id !== id));
  renderGameList();
}

function filterGameList(filter) {
  currentGameFilter = filter;
  document
    .querySelectorAll("[data-gamefilter]")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector(`[data-gamefilter="${filter}"]`)
    .classList.add("active");
  renderGameList();
}

function renderGameList() {
  const box = document.getElementById("gameListBox");
  if (!box) return;
  let list = getGameList();
  if (currentGameFilter !== "all") {
    list = list.filter((g) => g.status === currentGameFilter);
  }
  box.innerHTML = list.length
    ? list
        .map(
          (g) => `
      <div class="yt-video-row" style="cursor: default;">
        <div class="yt-video-info">
          <div class="yt-video-title">${g.name}</div>
          <div class="yt-video-sub">${g.platform} • ${g.status === "playing" ? "🎮 Đang chơi" : "⭐ Wishlist"}</div>
        </div>
        <div class="yt-video-actions">
          <span class="yt-icon-btn" onclick="removeGameEntry('${g.id}')">🗑</span>
        </div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa có game nào trong danh sách.</div>`;
}

// ==========================================
// 😂 GIẢI TRÍ NHANH (Meme / Joke / Fact / Ảnh thú cưng — API thật, miễn phí)
// ==========================================
async function fetchRandomMeme() {
  const box = document.getElementById("funContentBox");
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải meme...</p>`;
  try {
    const res = await fetch("https://meme-api.com/gimme");
    const data = await res.json();
    box.innerHTML = `
      <img src="${data.url}" alt="meme" class="fun-content-img">
      <p style="font-size: 13px; color: var(--text-main);">${data.title}</p>
      <p style="font-size: 11px; color: var(--text-muted);">Nguồn: r/${data.subreddit}</p>
    `;
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không thể tải meme lúc này, thử lại sau.</p>`;
  }
}

async function fetchRandomJoke() {
  const box = document.getElementById("funContentBox");
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải joke...</p>`;
  try {
    const res = await fetch(
      "https://official-joke-api.appspot.com/random_joke",
    );
    const data = await res.json();
    box.innerHTML = `
      <p style="font-size: 15px; color: var(--text-main); margin-bottom: 8px;">${data.setup}</p>
      <p style="font-size: 15px; color: var(--accent); font-weight: 600;">${data.punchline}</p>
    `;
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không thể tải joke lúc này, thử lại sau.</p>`;
  }
}

async function fetchRandomFact() {
  const box = document.getElementById("funContentBox");
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải fact...</p>`;
  try {
    const res = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
    );
    const data = await res.json();
    box.innerHTML = `<p style="font-size: 15px; color: var(--text-main);">💡 ${data.text}</p>`;
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không thể tải fact lúc này, thử lại sau.</p>`;
  }
}

async function fetchRandomPet(kind) {
  const box = document.getElementById("funContentBox");
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải ảnh...</p>`;
  try {
    if (kind === "cat") {
      const res = await fetch("https://api.thecatapi.com/v1/images/search");
      const data = await res.json();
      box.innerHTML = `<img src="${data[0].url}" alt="cat" class="fun-content-img">`;
    } else {
      const res = await fetch("https://dog.ceo/api/breeds/image/random");
      const data = await res.json();
      box.innerHTML = `<img src="${data.message}" alt="dog" class="fun-content-img">`;
    }
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không thể tải ảnh lúc này, thử lại sau.</p>`;
  }
}

// Quote trong ngày: dùng danh sách quote cục bộ (ổn định, không phụ thuộc API
// bên ngoài hay bị sập), chọn theo ngày trong năm để mỗi ngày ra 1 câu khác nhau.
const dailyQuotes = [
  {
    text: "Cách tốt nhất để dự đoán tương lai là tự tạo ra nó.",
    author: "Peter Drucker",
  },
  {
    text: "Code sạch luôn trông như được viết bởi người quan tâm đến nó.",
    author: "Robert C. Martin",
  },
  {
    text: "Đừng sợ hoàn hảo, bạn sẽ không bao giờ đạt được nó.",
    author: "Salvador Dalí",
  },
  {
    text: "Học một ngôn ngữ lập trình mới không dạy bạn cách suy nghĩ khác, chỉ mở rộng vốn từ vựng của bạn.",
    author: "Alan Perlis",
  },
  {
    text: "Thành công là đi từ thất bại này đến thất bại khác mà không mất đi nhiệt huyết.",
    author: "Winston Churchill",
  },
  {
    text: "Chương trình tốt là bằng chứng của một tư duy có tổ chức tốt.",
    author: "Khuyết danh",
  },
  {
    text: "Ước mơ lớn và dám thất bại một cách ngoạn mục.",
    author: "Norman Vaughan",
  },
  { text: "Bí quyết để tiến về phía trước là bắt đầu.", author: "Mark Twain" },
  {
    text: "Không có gì là không thể, chính từ 'không thể' cũng nói rằng 'tôi có thể'.",
    author: "Audrey Hepburn",
  },
  {
    text: "Hãy làm hôm nay những gì người khác không làm, để ngày mai bạn có thể làm những gì người khác không thể.",
    author: "Jerry Rice",
  },
];
function renderDailyQuote() {
  const box = document.getElementById("dailyQuoteBox");
  if (!box) return;
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000,
  );
  const quote = dailyQuotes[dayOfYear % dailyQuotes.length];
  box.innerHTML = `"${quote.text}"<br><span style="font-size: 12px; color: var(--text-muted); font-style: normal;">— ${quote.author}</span>`;
}

// ==========================================
// 🌦 WIDGET: THỜI TIẾT + CHẤT LƯỢNG KHÔNG KHÍ + ĐỒNG HỒ THẾ GIỚI (Open-Meteo, miễn phí không cần key)
// ==========================================
async function searchWeatherWidget() {
  const city = document.getElementById("weatherCityInput").value.trim();
  const resultBox = document.getElementById("weatherWidgetResult");
  if (!city) return;
  resultBox.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tìm...</p>`;

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=vi`,
    );
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      resultBox.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không tìm thấy thành phố "${city}".</p>`;
      return;
    }
    const { latitude, longitude, name, country } = geoData.results[0];

    const [weatherRes, airRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`,
      ),
    ]);
    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    const temp = weatherData.current_weather.temperature;
    const wind = weatherData.current_weather.windspeed;
    const aqi = airData.current ? airData.current.us_aqi : "—";
    const aqiLabel =
      aqi <= 50
        ? "Tốt 🟢"
        : aqi <= 100
          ? "Trung bình 🟡"
          : aqi <= 150
            ? "Kém với nhóm nhạy cảm 🟠"
            : "Xấu 🔴";

    resultBox.innerHTML = `
      <table class="bigo-table">
        <tr><td>📍 Địa điểm</td><td>${name}, ${country}</td></tr>
        <tr><td>🌡️ Nhiệt độ</td><td>${temp}°C</td></tr>
        <tr><td>💨 Tốc độ gió</td><td>${wind} km/h</td></tr>
        <tr><td>🫁 Chỉ số AQI (chất lượng không khí)</td><td>${aqi} — ${aqiLabel}</td></tr>
      </table>
    `;
  } catch (err) {
    resultBox.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không thể tải dữ liệu thời tiết lúc này.</p>`;
  }
}

const worldClockZones = [
  { label: "🇻🇳 Hà Nội", tz: "Asia/Ho_Chi_Minh" },
  { label: "🇯🇵 Tokyo", tz: "Asia/Tokyo" },
  { label: "🇬🇧 London", tz: "Europe/London" },
  { label: "🇺🇸 New York", tz: "America/New_York" },
  { label: "🇦🇺 Sydney", tz: "Australia/Sydney" },
];

function renderWorldClock() {
  const box = document.getElementById("worldClockBox");
  if (!box) return;
  box.innerHTML = worldClockZones
    .map(
      (z) => `
    <div class="stat-chip">
      <div class="stat-value" id="clock-${z.tz.replace(/\//g, "-")}" style="font-size: 16px;">--:--:--</div>
      <div class="stat-label">${z.label}</div>
    </div>`,
    )
    .join("");
  updateWorldClockTimes();
}

function updateWorldClockTimes() {
  worldClockZones.forEach((z) => {
    const el = document.getElementById("clock-" + z.tz.replace(/\//g, "-"));
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString("vi-VN", { timeZone: z.tz });
  });
}
setInterval(updateWorldClockTimes, 1000);

// ==========================================
// 🔴 LIVESTREAM: TWITCH / YOUTUBE LIVE / KICK / FACEBOOK GAMING
// ==========================================
function loadTwitchEmbed() {
  const channel = document.getElementById("twitchChannelInput").value.trim();
  const box = document.getElementById("twitchEmbedBox");
  if (!channel) return;
  const parentDomain = location.hostname || "localhost";
  box.innerHTML = `
    <iframe
      src="https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${parentDomain}"
      height="400"
      width="100%"
      allowfullscreen
      style="border-radius: 14px; border: 1px solid var(--apple-glass-border);"
    ></iframe>
  `;
}

function loadYtLiveEmbed() {
  const input = document.getElementById("ytLiveInput").value.trim();
  const box = document.getElementById("ytLiveEmbedBox");
  if (!input) return;
  const match = input.match(
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  const videoId = match ? match[1] : input;
  box.innerHTML = `
    <div class="player" style="height: 400px;">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  `;
}

function loadKickEmbed() {
  const channel = document.getElementById("kickChannelInput").value.trim();
  const box = document.getElementById("kickEmbedBox");
  if (!channel) return;
  box.innerHTML = `
    <iframe
      src="https://player.kick.com/${encodeURIComponent(channel)}"
      height="400"
      width="100%"
      frameborder="0"
      scrolling="no"
      allowfullscreen="true"
      style="border-radius: 14px; border: 1px solid var(--apple-glass-border);"
    ></iframe>
  `;
}

function openFacebookGaming() {
  const input = document.getElementById("fbGamingInput").value.trim();
  if (!input) return;
  const url = input.startsWith("http")
    ? input
    : `https://www.facebook.com/gaming/${encodeURIComponent(input)}`;
  window.open(url, "_blank");
}

// ==========================================
// TAB MANCHESTER UNITED
// ==========================================
function muKey(name) {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return `mu_${name}_${currentUser}`;
}

// ---- Điều hướng subtab nội bộ ----
function switchMuView(view) {
  document
    .querySelectorAll("#muSubtabs .yt-subtab-btn")
    .forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(
    `#muSubtabs .yt-subtab-btn[data-muview="${view}"]`,
  );
  if (btn) btn.classList.add("active");

  document
    .querySelectorAll(".mu-subpanel")
    .forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById("mu-" + view);
  if (panel) panel.classList.add("active");

  if (view === "squad") {
    renderMuFormationPitch();
    renderPlayerRoster();
  }
  if (view === "schedule") {
    renderMuFixtureList();
    renderMuNewsSources();
    renderTransferList();
  }
  if (view === "stats") {
    renderClubStatsChart();
    renderTrophyRoom();
  }
  if (view === "fanzone") {
    populateMotmSelect();
    renderMotmResults();
    renderScorePredictions();
    renderMuQuiz();
    renderPolls();
    renderFanComments();
  }
  if (view === "notify") {
    renderMuNotificationHistory();
  }
}

// ---- Bảng xếp hạng Premier League (thủ công) ----
function getStandings() {
  return JSON.parse(localStorage.getItem(muKey("standings"))) || [];
}
function saveStandings(list) {
  localStorage.setItem(muKey("standings"), JSON.stringify(list));
}
function addStandingRow() {
  const team = document.getElementById("standingTeamInput").value.trim();
  const points = parseInt(document.getElementById("standingPointsInput").value);
  const gd = document.getElementById("standingGdInput").value.trim();
  if (!team || isNaN(points)) {
    showToast("Vui lòng nhập tên đội và điểm số!", "error");
    return;
  }
  const list = getStandings();
  list.push({ team, points, gd });
  list.sort((a, b) => b.points - a.points);
  saveStandings(list);
  document.getElementById("standingTeamInput").value = "";
  document.getElementById("standingPointsInput").value = "";
  document.getElementById("standingGdInput").value = "";
  renderStandingsTable();
}
function removeStandingRow(idx) {
  const list = getStandings();
  list.splice(idx, 1);
  saveStandings(list);
  renderStandingsTable();
}
function renderStandingsTable() {
  const table = document.getElementById("standingsTable");
  if (!table) return;
  const list = getStandings();

  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });

  list.forEach((s, idx) => {
    const isMu = /manchester united|^mu$/i.test(s.team);
    const tr = document.createElement("tr");
    if (isMu) tr.className = "standing-row-highlight";
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${s.team}</td>
      <td>${s.points}</td>
      <td>${s.gd || "—"}</td>
      <td><span class="delete-btn" onclick="removeStandingRow(${idx})">✕</span></td>
    `;
    table.appendChild(tr);
  });
}

// ---- Lịch thi đấu ----
function getMuFixtures() {
  return JSON.parse(localStorage.getItem(muKey("fixtures"))) || [];
}
function saveMuFixtures(list) {
  localStorage.setItem(muKey("fixtures"), JSON.stringify(list));
}
function addMuFixture() {
  const opponent = document.getElementById("muFixtureOpponent").value.trim();
  const competition = document.getElementById("muFixtureCompetition").value;
  const datetime = document.getElementById("muFixtureDateTime").value;
  if (!opponent || !datetime) {
    showToast("Vui lòng nhập đối thủ và thời gian!", "error");
    return;
  }
  const list = getMuFixtures();
  list.push({ id: generateTaskId(), opponent, competition, datetime });
  list.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  saveMuFixtures(list);
  document.getElementById("muFixtureOpponent").value = "";
  document.getElementById("muFixtureDateTime").value = "";
  renderMuFixtureList();
  showToast("Đã thêm trận đấu vào lịch!", "success");
}
function removeMuFixture(id) {
  saveMuFixtures(getMuFixtures().filter((f) => f.id !== id));
  renderMuFixtureList();
}
let currentFixtureFilter = "all";
function filterMuFixtures(filter) {
  currentFixtureFilter = filter;
  document
    .querySelectorAll("[data-fixturefilter]")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelector(`[data-fixturefilter="${filter}"]`)
    .classList.add("active");
  renderMuFixtureList();
}
function renderMuFixtureList() {
  const list = document.getElementById("muFixtureList");
  if (!list) return;
  let fixtures = getMuFixtures();
  if (currentFixtureFilter !== "all") {
    fixtures = fixtures.filter((f) => f.competition === currentFixtureFilter);
  }
  list.innerHTML = fixtures.length
    ? fixtures
        .map(
          (f) => `
      <li>
        <span class="task-text"><b>${new Date(f.datetime).toLocaleString("vi-VN")}</b> — vs ${f.opponent} (${f.competition})</span>
        <span class="delete-btn" onclick="removeMuFixture('${f.id}')">✕</span>
      </li>`,
        )
        .join("")
    : `<li style="color: var(--text-muted);">Chưa có trận đấu nào trong lịch.</li>`;
}

// ---- Tin tức nhanh (link-out tới nguồn thật, không nhúng do CORS) ----
const muNewsSources = [
  {
    name: "BBC Sport",
    icon: "📰",
    url: "https://www.bbc.com/sport/football/teams/manchester-united",
  },
  {
    name: "Sky Sports",
    icon: "📺",
    url: "https://www.skysports.com/manchester-united",
  },
  {
    name: "The Athletic",
    icon: "🗞️",
    url: "https://www.nytimes.com/athletic/team/manchester-united/",
  },
  {
    name: "ESPN",
    icon: "🌐",
    url: "https://www.espn.com/soccer/team/_/id/360/manchester-united",
  },
  {
    name: "Man Utd Official",
    icon: "🔴",
    url: "https://www.manutd.com/en/news",
  },
  {
    name: "Goal.com",
    icon: "⚽",
    url: "https://www.goal.com/en/manchester-united/6f5s5o1itc491ne9tzhitswlz",
  },
];
function renderMuNewsSources() {
  const grid = document.getElementById("muNewsSourcesGrid");
  if (!grid) return;
  grid.innerHTML = muNewsSources
    .map(
      (s) => `
    <div class="cs-subject-card" onclick="window.open('${s.url}', '_blank')">
      <div class="cs-subject-icon">${s.icon}</div>
      <div class="cs-subject-name">${s.name}</div>
      <div class="cs-subject-status">🔗 Đọc tiếp</div>
    </div>`,
    )
    .join("");
}

// ---- Chuyển nhượng ----
function getTransfers() {
  return JSON.parse(localStorage.getItem(muKey("transfers"))) || [];
}
function saveTransfers(list) {
  localStorage.setItem(muKey("transfers"), JSON.stringify(list));
}
function addTransferEntry() {
  const player = document.getElementById("transferPlayerInput").value.trim();
  const type = document.getElementById("transferTypeInput").value;
  const status = document.getElementById("transferStatusInput").value;
  const confidence = parseInt(
    document.getElementById("transferConfidenceInput").value,
  );
  if (!player) {
    showToast("Vui lòng nhập tên cầu thủ!", "error");
    return;
  }
  const list = getTransfers();
  list.unshift({ id: generateTaskId(), player, type, status, confidence });
  saveTransfers(list);
  document.getElementById("transferPlayerInput").value = "";
  renderTransferList();
  showToast("Đã thêm tin chuyển nhượng!", "success");
}
function removeTransferEntry(id) {
  saveTransfers(getTransfers().filter((t) => t.id !== id));
  renderTransferList();
}
function renderTransferList() {
  const box = document.getElementById("transferList");
  if (!box) return;
  const list = getTransfers();
  box.innerHTML = list.length
    ? list
        .map(
          (t) => `
      <div class="upcoming-task-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${t.type === "in" ? "🟢 IN" : "🔴 OUT"} — <b>${t.player}</b> ${t.status === "confirmed" ? "✅ Confirmed" : "🗣️ Rumour"}</span>
          <span class="delete-btn" onclick="removeTransferEntry('${t.id}')">✕</span>
        </div>
        <div class="progress-track" style="margin-bottom: 0;"><div class="progress-fill" style="width: ${t.confidence}%;"></div></div>
        <span style="font-size: 11px; color: var(--text-muted);">Độ tin cậy: ${t.confidence}%</span>
      </div>`,
        )
        .join("")
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có tin chuyển nhượng nào.</p>`;
}

// ---- Đội hình / Sơ đồ chiến thuật ----
const muFormations = {
  "4-2-3-1": [
    ["GK"],
    ["LB", "CB", "CB", "RB"],
    ["CDM", "CDM"],
    ["LW", "CAM", "RW"],
    ["ST"],
  ],
  "4-3-3": [
    ["GK"],
    ["LB", "CB", "CB", "RB"],
    ["CM", "CM", "CM"],
    ["LW", "ST", "RW"],
  ],
  "3-4-2-1": [
    ["GK"],
    ["CB", "CB", "CB"],
    ["LM", "CM", "CM", "RM"],
    ["CAM", "CAM"],
    ["ST"],
  ],
};

function getFormationSlots() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  const formation = document.getElementById("muFormationSelect").value;
  const key = muKey("formationSlots_" + formation);
  return { key, data: JSON.parse(localStorage.getItem(key)) || {} };
}

function renderMuFormationPitch() {
  const container = document.getElementById("muPitchContainer");
  if (!container) return;
  const formation = document.getElementById("muFormationSelect").value;
  const rows = muFormations[formation];
  const { key, data: slotNames } = getFormationSlots();

  container.innerHTML = rows
    .map((row, rowIdx) => {
      const slots = row
        .map((pos, colIdx) => {
          const slotId = `${rowIdx}_${colIdx}`;
          const name = slotNames[slotId] || pos;
          return `<div class="mu-player-slot" onclick="editFormationSlot('${slotId}', '${pos}')">${name}</div>`;
        })
        .join("");
      return `<div class="mu-pitch-row">${slots}</div>`;
    })
    .join("");
}

function editFormationSlot(slotId, position) {
  const name = prompt(`Nhập tên cầu thủ cho vị trí ${position}:`);
  if (name === null) return;
  const { key, data } = getFormationSlots();
  data[slotId] = name.trim() || position;
  localStorage.setItem(key, JSON.stringify(data));
  renderMuFormationPitch();
}

// ---- Danh sách cầu thủ (Player Hub) ----
function getPlayers() {
  const existing = localStorage.getItem(muKey("players"));
  if (existing) return JSON.parse(existing);
  // Dữ liệu mẫu ban đầu — chỉ mang tính minh họa, hãy tự cập nhật đội hình thật
  const seed = [
    {
      id: generateTaskId(),
      name: "(Mẫu) Thủ môn số 1",
      number: 1,
      position: "GK",
      age: 27,
      nationality: "—",
      height: "",
      weight: "",
      foot: "",
      contract: "",
      marketValue: "",
      appearances: 0,
      goals: 0,
      assists: 0,
      minutes: 0,
      cards: "",
      passAccuracy: "",
      injured: false,
    },
  ];
  localStorage.setItem(muKey("players"), JSON.stringify(seed));
  return seed;
}
function savePlayers(list) {
  localStorage.setItem(muKey("players"), JSON.stringify(list));
}

function addPlayerEntry() {
  const name = document.getElementById("playerNameInput").value.trim();
  const number = parseInt(document.getElementById("playerNumberInput").value);
  const position = document.getElementById("playerPositionInput").value;
  const age = parseInt(document.getElementById("playerAgeInput").value) || null;
  const nationality = document
    .getElementById("playerNationalityInput")
    .value.trim();

  if (!name) {
    showToast("Vui lòng nhập tên cầu thủ!", "error");
    return;
  }

  const list = getPlayers();
  list.push({
    id: generateTaskId(),
    name,
    number: isNaN(number) ? null : number,
    position,
    age,
    nationality,
    height: "",
    weight: "",
    foot: "",
    contract: "",
    marketValue: "",
    appearances: 0,
    goals: 0,
    assists: 0,
    minutes: 0,
    cards: "",
    passAccuracy: "",
    injured: false,
  });
  savePlayers(list);

  [
    "playerNameInput",
    "playerNumberInput",
    "playerAgeInput",
    "playerNationalityInput",
  ].forEach((id) => (document.getElementById(id).value = ""));
  renderPlayerRoster();
  showToast("Đã thêm cầu thủ: " + name, "success");
}

function removePlayerEntry(id) {
  savePlayers(getPlayers().filter((p) => p.id !== id));
  renderPlayerRoster();
}

function renderPlayerRoster() {
  const box = document.getElementById("playerRosterList");
  if (!box) return;
  const searchInput = document.getElementById("playerSearchInput");
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  let players = getPlayers();
  if (query)
    players = players.filter((p) => p.name.toLowerCase().includes(query));

  box.innerHTML = players.length
    ? players
        .map(
          (p) => `
      <div class="yt-video-row" onclick="openPlayerHubModal('${p.id}')">
        <div class="yt-video-info">
          <div class="yt-video-title">#${p.number || "-"} ${p.name} ${p.injured ? "🤕" : ""}</div>
          <div class="yt-video-sub">${p.position} • ${p.nationality || "—"} • ${p.age ? p.age + " tuổi" : "—"}</div>
        </div>
        <div class="yt-video-actions">
          <span class="yt-icon-btn" onclick="event.stopPropagation(); removePlayerEntry('${p.id}')">🗑</span>
        </div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa có cầu thủ nào, hoặc không tìm thấy kết quả.</div>`;
}

function openPlayerHubModal(id) {
  const player = getPlayers().find((p) => p.id === id);
  if (!player) return;

  document.getElementById("playerHubModalBox").innerHTML = `
    <div class="modal-header">
      <h2>#${player.number || "-"} ${player.name}</h2>
      <span class="modal-close" onclick="closePlayerHubModal()">✕</span>
    </div>
    <div class="task-stats-row">
      <div class="stat-chip"><div class="stat-value" style="font-size:15px;">${player.position}</div><div class="stat-label">Vị trí</div></div>
      <div class="stat-chip"><div class="stat-value" style="font-size:15px;">${player.age || "—"}</div><div class="stat-label">Tuổi</div></div>
      <div class="stat-chip"><div class="stat-value" style="font-size:15px;">${player.nationality || "—"}</div><div class="stat-label">Quốc tịch</div></div>
    </div>
    <div class="grid-2" style="margin-top: 16px;">
      <div><label class="field-label">Chiều cao</label><input type="text" value="${player.height || ""}" onchange="updatePlayerField('${id}','height',this.value)"></div>
      <div><label class="field-label">Cân nặng</label><input type="text" value="${player.weight || ""}" onchange="updatePlayerField('${id}','weight',this.value)"></div>
    </div>
    <div class="grid-2" style="margin-top: 14px;">
      <div><label class="field-label">Chân thuận</label><input type="text" value="${player.foot || ""}" onchange="updatePlayerField('${id}','foot',this.value)"></div>
      <div><label class="field-label">Hợp đồng đến</label><input type="text" value="${player.contract || ""}" onchange="updatePlayerField('${id}','contract',this.value)"></div>
    </div>
    <div class="grid-2" style="margin-top: 14px;">
      <div><label class="field-label">Giá trị chuyển nhượng</label><input type="text" value="${player.marketValue || ""}" onchange="updatePlayerField('${id}','marketValue',this.value)"></div>
      <div><label class="field-label">Độ chính xác chuyền (%)</label><input type="text" value="${player.passAccuracy || ""}" onchange="updatePlayerField('${id}','passAccuracy',this.value)"></div>
    </div>
    <h3 style="font-size: 14px; margin: 16px 0 8px;">📊 Thống kê mùa giải</h3>
    <div class="grid-2">
      <div><label class="field-label">Ra sân</label><input type="number" value="${player.appearances || 0}" onchange="updatePlayerField('${id}','appearances',this.value)"></div>
      <div><label class="field-label">Bàn thắng</label><input type="number" value="${player.goals || 0}" onchange="updatePlayerField('${id}','goals',this.value)"></div>
    </div>
    <div class="grid-2" style="margin-top: 14px;">
      <div><label class="field-label">Kiến tạo</label><input type="number" value="${player.assists || 0}" onchange="updatePlayerField('${id}','assists',this.value)"></div>
      <div><label class="field-label">Số phút thi đấu</label><input type="number" value="${player.minutes || 0}" onchange="updatePlayerField('${id}','minutes',this.value)"></div>
    </div>
    <svg viewBox="0 0 200 200" style="width: 180px; margin: 16px auto; display: block;" id="playerRadarChart"></svg>
    <label style="display: flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 12px; color: var(--text-muted); cursor: pointer;">
      <input type="checkbox" style="width: auto;" ${player.injured ? "checked" : ""} onchange="updatePlayerField('${id}','injured',this.checked)"> Đang chấn thương / treo giò
    </label>
    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button class="btn-secondary" onclick="closePlayerHubModal()">Đóng</button>
    </div>
  `;
  document.getElementById("playerHubModalOverlay").classList.add("active");
  renderPlayerRadarChart(player);
}
function closePlayerHubModal() {
  document.getElementById("playerHubModalOverlay").classList.remove("active");
}
function updatePlayerField(id, field, value) {
  const list = getPlayers();
  const player = list.find((p) => p.id === id);
  if (!player) return;
  if (["appearances", "goals", "assists", "minutes"].includes(field)) {
    player[field] = parseInt(value) || 0;
  } else if (field === "injured") {
    player[field] = value;
  } else {
    player[field] = value;
  }
  savePlayers(list);
  renderPlayerRoster();
}

function renderPlayerRadarChart(player) {
  const svg = document.getElementById("playerRadarChart");
  if (!svg) return;
  const stats = [
    { label: "Bàn thắng", value: Math.min(100, player.goals * 5) },
    { label: "Kiến tạo", value: Math.min(100, player.assists * 5) },
    { label: "Ra sân", value: Math.min(100, player.appearances * 2.5) },
    { label: "Chuyền bóng", value: parseFloat(player.passAccuracy) || 0 },
  ];
  const cx = 100,
    cy = 100,
    r = 70;
  const n = stats.length;
  const points = stats.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (s.value / 100) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  });
  const axisLines = stats
    .map((s, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" style="stroke: rgba(255,255,255,0.15);" />`;
    })
    .join("");
  const polygon = points.map((p) => p.join(",")).join(" ");
  svg.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke: rgba(255,255,255,0.1);" />
    ${axisLines}
    <polygon points="${polygon}" style="fill: rgba(10,132,255,0.35); stroke: var(--accent); stroke-width: 2;" />
  `;
}

// ---- Thống kê mùa giải ----
function saveSeasonStats() {
  const data = {
    topScorer: document.getElementById("statTopScorer").value.trim(),
    topAssist: document.getElementById("statTopAssist").value.trim(),
    cleanSheets: document.getElementById("statCleanSheets").value.trim(),
    appearances: document.getElementById("statAppearances").value.trim(),
  };
  localStorage.setItem(muKey("seasonStats"), JSON.stringify(data));
}
function loadSeasonStats() {
  const data = JSON.parse(localStorage.getItem(muKey("seasonStats")));
  if (!data || !document.getElementById("statTopScorer")) return;
  document.getElementById("statTopScorer").value = data.topScorer || "";
  document.getElementById("statTopAssist").value = data.topAssist || "";
  document.getElementById("statCleanSheets").value = data.cleanSheets || "";
  document.getElementById("statAppearances").value = data.appearances || "";
}

// ---- Club Statistics + biểu đồ ----
function saveClubStats() {
  const data = {
    winPercent: parseInt(document.getElementById("clubWinPercent").value) || 0,
    goalsForAgainst: document
      .getElementById("clubGoalsForAgainst")
      .value.trim(),
    possessionAvg:
      parseInt(document.getElementById("clubPossessionAvg").value) || 0,
    passAccuracy:
      parseInt(document.getElementById("clubPassAccuracy").value) || 0,
    xg: parseFloat(document.getElementById("clubXg").value) || 0,
    avgRating: parseFloat(document.getElementById("clubAvgRating").value) || 0,
  };
  localStorage.setItem(muKey("clubStats"), JSON.stringify(data));
  renderClubStatsChart();
}
function loadClubStats() {
  const data = JSON.parse(localStorage.getItem(muKey("clubStats")));
  if (!data || !document.getElementById("clubWinPercent")) return;
  document.getElementById("clubWinPercent").value = data.winPercent;
  document.getElementById("clubGoalsForAgainst").value = data.goalsForAgainst;
  document.getElementById("clubPossessionAvg").value = data.possessionAvg;
  document.getElementById("clubPassAccuracy").value = data.passAccuracy;
  document.getElementById("clubXg").value = data.xg;
  document.getElementById("clubAvgRating").value = data.avgRating;
}
function renderClubStatsChart() {
  const svg = document.getElementById("clubStatsChart");
  if (!svg) return;
  const data = JSON.parse(localStorage.getItem(muKey("clubStats"))) || {
    winPercent: 50,
    possessionAvg: 55,
    passAccuracy: 85,
    avgRating: 7,
  };
  const bars = [
    { label: "Thắng %", value: data.winPercent, color: "#30d158" },
    { label: "Possession %", value: data.possessionAvg, color: "#0a84ff" },
    { label: "Chuyền %", value: data.passAccuracy, color: "#bf5af2" },
    { label: "Rating x10", value: data.avgRating * 10, color: "#ffd60a" },
  ];
  const barWidth = 50,
    gap = 20,
    baseY = 130;
  let barsHtml = "";
  bars.forEach((b, i) => {
    const barHeight = Math.min(100, b.value) * 0.9;
    const x = 15 + i * (barWidth + gap);
    const y = baseY - barHeight;
    barsHtml += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(barHeight, 2)}" rx="6" fill="${b.color}" />
      <text x="${x + barWidth / 2}" y="${baseY + 16}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${b.label}</text>
      <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="var(--text-main)" font-weight="600">${fmtNum(b.value)}</text>
    `;
  });
  svg.innerHTML = `<line x1="10" y1="${baseY}" x2="290" y2="${baseY}" stroke="rgba(255,255,255,0.15)" />${barsHtml}`;
}

// ---- Match Prediction (công thức ước lượng đơn giản, KHÔNG phải AI thật) ----
function computeMatchPrediction() {
  const form = document
    .getElementById("predictionFormInput")
    .value.trim()
    .toUpperCase();
  const resultBox = document.getElementById("predictionResult");
  resultBox.style.display = "block";

  if (!/^[TWHB]{1,5}$/.test(form.replace(/W/g, "T"))) {
    resultBox.innerHTML = `<span style="color:#ff453a;">⚠ Vui lòng nhập phong độ hợp lệ, chỉ gồm T (thắng), H (hòa), B (bại). Ví dụ: TTHTB</span>`;
    return;
  }

  const wins = (form.match(/T/g) || []).length;
  const draws = (form.match(/H/g) || []).length;
  const losses = (form.match(/B/g) || []).length;
  const total = form.length || 1;

  // Công thức đơn giản: trọng số phong độ + hệ số sân nhà, chuẩn hóa về 100%
  const homeAdvantage = 10;
  let winScore = (wins / total) * 100 + homeAdvantage;
  let drawScore = (draws / total) * 100;
  let loseScore = (losses / total) * 100;

  const sum = winScore + drawScore + loseScore || 1;
  const winPct = Math.round((winScore / sum) * 100);
  const drawPct = Math.round((drawScore / sum) * 100);
  const losePct = 100 - winPct - drawPct;

  const predictedGoalsFor = Math.max(
    0,
    Math.round(((wins * 1.5 + draws * 1) / total) * 3),
  );
  const predictedGoalsAgainst = Math.max(
    0,
    Math.round(((losses * 1.5 + draws * 0.5) / total) * 2),
  );

  resultBox.innerHTML = `
    <table class="bigo-table">
      <tr><th>Thắng</th><th>Hòa</th><th>Thua</th></tr>
      <tr><td style="color:#30d158;font-weight:700;">${winPct}%</td><td style="color:#ffd60a;font-weight:700;">${drawPct}%</td><td style="color:#ff453a;font-weight:700;">${losePct}%</td></tr>
    </table>
    <p style="margin-top: 12px; font-size: 14px;"><b>Tỷ số dự đoán:</b> Manchester United ${predictedGoalsFor} - ${predictedGoalsAgainst} Đối thủ</p>
    <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">* Chỉ mang tính tham khảo vui, tính theo công thức đơn giản dựa trên phong độ bạn nhập, không phải mô hình machine learning thật.</p>
  `;
}

// ---- Trophy Room ----
function getTrophies() {
  return JSON.parse(localStorage.getItem(muKey("trophies"))) || [];
}
function saveTrophiesList(list) {
  localStorage.setItem(muKey("trophies"), JSON.stringify(list));
}
function addTrophyEntry() {
  const type = document.getElementById("trophyTypeInput").value;
  const year = parseInt(document.getElementById("trophyYearInput").value);
  if (isNaN(year)) {
    showToast("Vui lòng nhập năm vô địch!", "error");
    return;
  }
  const list = getTrophies();
  list.push({ type, year });
  list.sort((a, b) => b.year - a.year);
  saveTrophiesList(list);
  document.getElementById("trophyYearInput").value = "";
  renderTrophyRoom();
  showToast("Đã thêm danh hiệu!", "success");
}
function renderTrophyRoom() {
  const summaryBox = document.getElementById("trophySummaryRow");
  const timelineBox = document.getElementById("trophyTimeline");
  if (!summaryBox || !timelineBox) return;

  const list = getTrophies();
  const grouped = {};
  list.forEach((t) => {
    grouped[t.type] = (grouped[t.type] || 0) + 1;
  });

  summaryBox.innerHTML = Object.keys(grouped).length
    ? Object.keys(grouped)
        .map(
          (type) => `
      <div class="stat-chip"><div class="stat-value" style="font-size:20px;">${grouped[type]}</div><div class="stat-label">${type}</div></div>`,
        )
        .join("")
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có danh hiệu nào được thêm.</p>`;

  timelineBox.innerHTML = list.length
    ? list.map((t) => `<div>🏆 ${t.year} — ${t.type}</div>`).join("")
    : `<div style="color: var(--text-muted);">Chưa có danh hiệu nào.</div>`;
}

// ---- Fan Zone: Vote MOTM ----
function populateMotmSelect() {
  const select = document.getElementById("motmPlayerSelect");
  if (!select) return;
  const players = getPlayers();
  select.innerHTML = players
    .map(
      (p) => `<option value="${p.id}">#${p.number || "-"} ${p.name}</option>`,
    )
    .join("");
}
function voteMotm() {
  const select = document.getElementById("motmPlayerSelect");
  const playerId = select.value;
  const player = getPlayers().find((p) => p.id === playerId);
  if (!player) return;

  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  localStorage.setItem(
    `muMotmVote_${currentUser}`,
    JSON.stringify({ playerId, playerName: player.name }),
  );
  showToast("Đã bình chọn: " + player.name, "success");
  renderMotmResults();
}
function renderMotmResults() {
  const box = document.getElementById("motmResultBox");
  if (!box) return;
  const tally = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("muMotmVote_")) {
      const vote = JSON.parse(localStorage.getItem(key));
      tally[vote.playerName] = (tally[vote.playerName] || 0) + 1;
    }
  }
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  box.innerHTML = entries.length
    ? `<table class="bigo-table"><tr><th>Cầu thủ</th><th>Số phiếu</th></tr>${entries.map(([name, votes]) => `<tr><td>${name}</td><td>${votes}</td></tr>`).join("")}</table>`
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có ai bình chọn.</p>`;
}

// ---- Fan Zone: Dự đoán tỷ số ----
function submitScorePrediction() {
  const home = document.getElementById("predictScoreHome").value;
  const away = document.getElementById("predictScoreAway").value;
  if (home === "" || away === "") {
    showToast("Vui lòng nhập đủ tỷ số dự đoán!", "error");
    return;
  }
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  localStorage.setItem(
    `muScorePrediction_${currentUser}`,
    JSON.stringify({ home, away, user: currentUser }),
  );
  showToast("Đã gửi dự đoán!", "success");
  renderScorePredictions();
}
function renderScorePredictions() {
  const box = document.getElementById("scorePredictionList");
  if (!box) return;
  const predictions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("muScorePrediction_")) {
      predictions.push(JSON.parse(localStorage.getItem(key)));
    }
  }
  box.innerHTML = predictions.length
    ? `<table class="bigo-table"><tr><th>Người dự đoán</th><th>Tỷ số dự đoán</th></tr>${predictions.map((p) => `<tr><td>${p.user}</td><td>MU ${p.home} - ${p.away}</td></tr>`).join("")}</table>`
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có ai dự đoán.</p>`;
}

// ---- Fan Zone: Mini Quiz MU (sự kiện lịch sử ổn định, không phụ thuộc mùa giải hiện tại) ----
const muQuizBank = [
  {
    q: "Manchester United được thành lập năm nào?",
    options: ["1878", "1902", "1920", "1950"],
    correct: 0,
  },
  {
    q: "Sân nhà của Manchester United tên là gì?",
    options: ["Anfield", "Etihad Stadium", "Old Trafford", "Emirates Stadium"],
    correct: 2,
  },
  {
    q: "Manchester United đã vô địch UEFA Champions League / Cúp C1 châu Âu bao nhiêu lần?",
    options: ["1 lần", "2 lần", "3 lần", "5 lần"],
    correct: 2,
  },
  {
    q: 'HLV nào dẫn dắt Manchester United giành "cú ăn ba" (Treble) lịch sử năm 1999?',
    options: [
      "José Mourinho",
      "Sir Alex Ferguson",
      "David Moyes",
      "Louis van Gaal",
    ],
    correct: 1,
  },
  {
    q: "Biệt danh của Manchester United là gì?",
    options: ["The Reds", "Quỷ Đỏ (Red Devils)", "The Gunners", "The Citizens"],
    correct: 1,
  },
];
let currentMuQuizAnswers = {};
function renderMuQuiz() {
  const container = document.getElementById("muQuizContainer");
  if (!container) return;
  currentMuQuizAnswers = {};
  container.innerHTML = muQuizBank
    .map(
      (q, qIdx) => `
    <div class="quiz-question-block" id="muQuizQ${qIdx}">
      <div class="quiz-question-title">Câu ${qIdx + 1}: ${q.q}</div>
      ${q.options
        .map(
          (opt, optIdx) => `
        <label class="quiz-option-label" id="muQuizQ${qIdx}_opt${optIdx}">
          <input type="radio" name="muQuizQ${qIdx}" value="${optIdx}" onchange="currentMuQuizAnswers[${qIdx}] = ${optIdx}">
          ${opt}
        </label>`,
        )
        .join("")}
    </div>`,
    )
    .join("");
  document.getElementById("muQuizResult").style.display = "none";
}
function submitMuQuiz() {
  let score = 0;
  muQuizBank.forEach((q, qIdx) => {
    const chosen = currentMuQuizAnswers[qIdx];
    const correctLabel = document.getElementById(
      `muQuizQ${qIdx}_opt${q.correct}`,
    );
    if (correctLabel) correctLabel.classList.add("correct");
    if (chosen === q.correct) score++;
    else if (chosen !== undefined) {
      const wrongLabel = document.getElementById(`muQuizQ${qIdx}_opt${chosen}`);
      if (wrongLabel) wrongLabel.classList.add("wrong");
    }
  });
  const resultBox = document.getElementById("muQuizResult");
  resultBox.style.display = "block";
  resultBox.innerHTML = `<div class="quiz-score-chip">Điểm của bạn: ${score}/${muQuizBank.length}</div>`;
  showToast(
    `Hoàn thành Mini Quiz MU! Điểm: ${score}/${muQuizBank.length}`,
    "success",
  );
  awardXp(score * 5);
}

// ---- Fan Zone: Poll ----
function getPolls() {
  return JSON.parse(localStorage.getItem(muKey("polls"))) || [];
}
function savePolls(list) {
  localStorage.setItem(muKey("polls"), JSON.stringify(list));
}
function createPoll() {
  const question = document.getElementById("pollQuestionInput").value.trim();
  const optionsRaw = document.getElementById("pollOptionsInput").value.trim();
  if (!question || !optionsRaw) {
    showToast("Vui lòng nhập câu hỏi và các lựa chọn!", "error");
    return;
  }
  const options = optionsRaw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  if (options.length < 2) {
    showToast("Cần ít nhất 2 lựa chọn!", "error");
    return;
  }
  const list = getPolls();
  list.unshift({
    id: generateTaskId(),
    question,
    options,
    votes: options.map(() => 0),
  });
  savePolls(list);
  document.getElementById("pollQuestionInput").value = "";
  document.getElementById("pollOptionsInput").value = "";
  renderPolls();
  showToast("Đã tạo poll mới!", "success");
}
function votePollOption(pollId, optIdx) {
  const list = getPolls();
  const poll = list.find((p) => p.id === pollId);
  if (!poll) return;
  poll.votes[optIdx]++;
  savePolls(list);
  renderPolls();
}
function renderPolls() {
  const box = document.getElementById("pollListBox");
  if (!box) return;
  const list = getPolls();
  box.innerHTML = list.length
    ? list
        .map((poll) => {
          const total = poll.votes.reduce((a, b) => a + b, 0) || 1;
          return `
        <div class="quiz-question-block">
          <div class="quiz-question-title">${poll.question}</div>
          ${poll.options
            .map(
              (opt, idx) => `
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; cursor: pointer;" onclick="votePollOption('${poll.id}', ${idx})">
                <span>${opt}</span><span>${poll.votes[idx]} phiếu (${Math.round((poll.votes[idx] / total) * 100)}%)</span>
              </div>
              <div class="progress-track" style="margin-bottom: 0;"><div class="progress-fill" style="width: ${(poll.votes[idx] / total) * 100}%;"></div></div>
            </div>`,
            )
            .join("")}
        </div>`;
        })
        .join("")
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có poll nào, hãy tạo poll đầu tiên!</p>`;
}

// ---- Fan Zone: Fan Community (bình luận) ----
function getFanComments() {
  return JSON.parse(localStorage.getItem(muKey("comments"))) || [];
}
function saveFanComments(list) {
  localStorage.setItem(muKey("comments"), JSON.stringify(list));
}
function postFanComment() {
  const input = document.getElementById("fanCommentInput");
  const text = input.value.trim();
  if (!text) return;
  const currentUser = sessionStorage.getItem("currentUser") || "Khách";
  const list = getFanComments();
  list.unshift({
    id: generateTaskId(),
    user: currentUser,
    text,
    likes: 0,
    time: Date.now(),
  });
  saveFanComments(list);
  input.value = "";
  renderFanComments();
}
function likeFanComment(id) {
  const list = getFanComments();
  const comment = list.find((c) => c.id === id);
  if (comment) comment.likes++;
  saveFanComments(list);
  renderFanComments();
}
function renderFanComments() {
  const box = document.getElementById("fanCommentsList");
  if (!box) return;
  const list = getFanComments();
  box.innerHTML = list.length
    ? list
        .map(
          (c) => `
      <div class="quiz-question-block">
        <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">${c.user} • ${new Date(c.time).toLocaleString("vi-VN")}</div>
        <div style="font-size: 13px; color: var(--text-main);">${c.text}</div>
        <button class="task-action-btn" style="margin-top: 8px;" onclick="likeFanComment('${c.id}')">👍 ${c.likes}</button>
      </div>`,
        )
        .join("")
    : `<p style="font-size: 12px; color: var(--text-muted);">Chưa có bình luận nào, hãy là người đầu tiên!</p>`;
}

// ---- Media: tái sử dụng tính năng tìm kiếm YouTube đã có ----
function muSearchYoutube(query) {
  document.querySelector('.tab-btn[data-tab="entertainment"]').click();
  setTimeout(() => {
    switchEntView("video");
    document.getElementById("ytInput").value = query;
    handleYouTubeAction();
  }, 150);
}

// ---- Bộ sưu tập cá nhân (không chứa ảnh có bản quyền, chỉ link người dùng tự thêm) ----
function getGalleryImages() {
  return JSON.parse(localStorage.getItem(muKey("gallery"))) || [];
}
function saveGalleryImages(list) {
  localStorage.setItem(muKey("gallery"), JSON.stringify(list));
}
function addGalleryImage() {
  const url = document.getElementById("galleryImgUrl").value.trim();
  const category = document.getElementById("galleryCategory").value;
  if (!url) {
    showToast("Vui lòng dán link ảnh!", "error");
    return;
  }
  const list = getGalleryImages();
  list.unshift({ id: generateTaskId(), url, category });
  saveGalleryImages(list);
  document.getElementById("galleryImgUrl").value = "";
  renderGallery();
  showToast("Đã thêm ảnh vào bộ sưu tập!", "success");
}
function removeGalleryImage(id) {
  saveGalleryImages(getGalleryImages().filter((g) => g.id !== id));
  renderGallery();
}
function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;
  const list = getGalleryImages();
  grid.style.display = list.length ? "grid" : "none";
  grid.innerHTML = list
    .map(
      (g) => `
    <div class="result-item-grid">
      <img src="${g.url}" alt="${g.category}" onerror="this.style.display='none'">
      <div class="info">
        <div class="title">${g.category}</div>
      </div>
      <div class="yt-card-actions">
        <span class="yt-icon-btn" onclick="removeGalleryImage('${g.id}')">🗑 Xóa</span>
      </div>
    </div>`,
    )
    .join("");
}

// ---- Notification Center ----
function requestMuNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Trình duyệt của bạn không hỗ trợ Web Notification!", "error");
    return;
  }
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      showToast("Đã bật thông báo trình duyệt!", "success");
    } else {
      showToast("Bạn đã từ chối quyền thông báo.", "info");
    }
  });
}

const muNotificationMessages = {
  goal: "⚽ MU vừa ghi bàn!",
  lineup: "📋 Đội hình ra sân đã được công bố!",
  halftime: "⏸️ Hết hiệp 1!",
  fulltime: "🏁 Trận đấu đã kết thúc!",
  redcard: "🟥 Có thẻ đỏ trong trận đấu!",
  transfer: "🔄 Có tin chuyển nhượng mới!",
};

function simulateMuNotification(type) {
  const message = muNotificationMessages[type] || "Thông báo mới từ MU";

  // Toast trong app (luôn hoạt động)
  showToast(message, "info");

  // Thông báo trình duyệt thật (nếu đã được cấp quyền)
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Manchester United", { body: message, icon: "" });
  }

  const key = muKey("notificationHistory");
  let history = JSON.parse(localStorage.getItem(key)) || [];
  history.unshift({ message, time: Date.now() });
  history = history.slice(0, 20);
  localStorage.setItem(key, JSON.stringify(history));
  renderMuNotificationHistory();
}

function renderMuNotificationHistory() {
  const box = document.getElementById("muNotificationHistory");
  if (!box) return;
  const history =
    JSON.parse(localStorage.getItem(muKey("notificationHistory"))) || [];
  box.innerHTML = history.length
    ? history
        .map(
          (h) =>
            `<div>[${new Date(h.time).toLocaleTimeString("vi-VN")}] ${h.message}</div>`,
        )
        .join("")
    : `<div style="color: var(--text-muted);">Chưa có thông báo nào.</div>`;
}

// ---- Khởi tạo toàn bộ tab MU khi trang tải xong (nếu đã đăng nhập) ----
function initMuTab() {
  if (!document.getElementById("panel-mu")) return;
  renderStandingsTable();
  loadSeasonStats();
  loadClubStats();

  // --- Dữ liệu MU hoàn toàn tự động (không cần người dùng nhập) ---
  fetchMuLiveScore();
  fetchMuUpcomingFixtures();
  fetchMuRecentResults();
  startMuAutoRefresh();
}

// ==========================================
// 📊 ANALYTICS TAB
// ==========================================
// Ghi chú trung thực: trình duyệt không cho phép JavaScript đọc CPU/RAM/tốc
// độ mạng thật của hệ điều hành vì lý do bảo mật. Các số liệu dưới đây đều
// là phép đo THẬT có thể thực hiện được từ trình duyệt (FPS thực tế đo bằng
// requestAnimationFrame, độ trễ mạng thực tế đo bằng fetch, bộ nhớ JS Heap
// thực tế trên Chrome...), không phải số ngẫu nhiên giả lập.

let fpsHistory = [];
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 0;

function fpsTick(now) {
  frameCount++;
  if (now - lastFrameTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFrameTime = now;
    fpsHistory.push(currentFps);
    if (fpsHistory.length > 30) fpsHistory.shift();
    if (
      document.getElementById("panel-analytics")?.classList.contains("active")
    ) {
      renderFpsChart();
    }
  }
  requestAnimationFrame(fpsTick);
}
requestAnimationFrame(fpsTick);

function renderFpsChart() {
  const svg = document.getElementById("fpsChart");
  if (!svg || fpsHistory.length === 0) return;
  const w = 400,
    h = 120,
    maxFps = 60;
  const stepX = w / Math.max(1, fpsHistory.length - 1);

  const points = fpsHistory
    .map((fps, i) => `${i * stepX},${h - (Math.min(fps, maxFps) / maxFps) * h}`)
    .join(" ");

  svg.innerHTML = `
    <polyline points="${points}" fill="none" style="stroke: #30d158; stroke-width: 2;" />
    <text x="5" y="15" font-size="11" fill="var(--text-main)">${currentFps} FPS</text>
  `;
}

async function measureNetworkPing() {
  const start = performance.now();
  try {
    await fetch("https://api.github.com/zen", { cache: "no-store" });
    return Math.round(performance.now() - start);
  } catch (err) {
    return null;
  }
}

async function renderAnalyticsStats() {
  const box = document.getElementById("analyticsStatsRow");
  if (!box) return;

  const ping = await measureNetworkPing();

  let ramInfo = "Không hỗ trợ (chỉ Chrome)";
  if (performance.memory) {
    const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
    const limitMB = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(0);
    ramInfo = `${usedMB} / ${limitMB} MB`;
  }

  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const networkSpeed = connection
    ? `${connection.effectiveType || "?"} (~${connection.downlink || "?"} Mbps)`
    : "Không hỗ trợ";

  const stats = [
    { label: "FPS hiện tại", value: currentFps || "..." },
    { label: "RAM (JS Heap)", value: ramInfo },
    {
      label: "Ping (tới GitHub API)",
      value: ping !== null ? ping + " ms" : "Lỗi mạng",
    },
    { label: "Tốc độ mạng (ước lượng)", value: networkSpeed },
    {
      label: "Trạng thái",
      value: navigator.onLine ? "🟢 Online" : "🔴 Offline",
    },
  ];

  box.innerHTML = stats
    .map(
      (s) => `
    <div class="stat-chip"><div class="stat-value" style="font-size:15px;">${s.value}</div><div class="stat-label">${s.label}</div></div>`,
    )
    .join("");
}

function renderStorageStats() {
  const table = document.getElementById("storageStatsTable");
  if (!table) return;

  let localStorageBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localStorageBytes +=
      (key.length + (localStorage.getItem(key) || "").length) * 2;
  }
  const localStorageKB = (localStorageBytes / 1024).toFixed(2);

  let sessionStorageBytes = 0;
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    sessionStorageBytes +=
      (key.length + (sessionStorage.getItem(key) || "").length) * 2;
  }
  const sessionStorageKB = (sessionStorageBytes / 1024).toFixed(2);

  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });

  const rows = [
    ["LocalStorage", `${localStorageKB} KB (${localStorage.length} key)`],
    ["SessionStorage", `${sessionStorageKB} KB (${sessionStorage.length} key)`],
  ];
  rows.forEach(([label, value]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td>${value}</td>`;
    table.appendChild(tr);
  });

  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((est) => {
      const usedMB = ((est.usage || 0) / 1048576).toFixed(2);
      const quotaMB = ((est.quota || 0) / 1048576).toFixed(0);
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>Tổng dung lượng trình duyệt (IndexedDB + cache...)</td><td>${usedMB} / ${quotaMB} MB</td>`;
      table.appendChild(tr);
    });
  }
}

function renderBrowserInfo() {
  const table = document.getElementById("browserInfoTable");
  if (!table) return;

  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });

  const rows = [
    ["Trình duyệt", getDeviceInfo()],
    ["User Agent", navigator.userAgent],
    ["Độ phân giải màn hình", `${screen.width} × ${screen.height}`],
    [
      "Kích thước cửa sổ hiện tại",
      `${window.innerWidth} × ${window.innerHeight}`,
    ],
    ["Ngôn ngữ trình duyệt", navigator.language],
    [
      "Số nhân CPU logic (hardwareConcurrency)",
      navigator.hardwareConcurrency || "Không hỗ trợ",
    ],
  ];
  rows.forEach(([label, value]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${label}</td><td style="word-break: break-all;">${value}</td>`;
    table.appendChild(tr);
  });
}

function renderBatteryNetworkRow() {
  const box = document.getElementById("batteryNetworkRow");
  if (!box) return;

  box.innerHTML = `<div class="stat-chip"><div class="stat-value" style="font-size:15px;">⏳</div><div class="stat-label">Đang kiểm tra pin...</div></div>`;

  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      const percent = Math.round(battery.level * 100);
      box.innerHTML = `
        <div class="stat-chip"><div class="stat-value" style="font-size:18px;">${percent}%</div><div class="stat-label">Mức pin</div></div>
        <div class="stat-chip"><div class="stat-value" style="font-size:15px;">${battery.charging ? "🔌 Đang sạc" : "🔋 Không sạc"}</div><div class="stat-label">Trạng thái sạc</div></div>
      `;
    });
  } else {
    box.innerHTML = `<div class="stat-chip"><div class="stat-value" style="font-size:13px;">Không hỗ trợ</div><div class="stat-label">Battery API (đã bị nhiều trình duyệt gỡ bỏ vì lý do riêng tư)</div></div>`;
  }
}

function initAnalyticsTab() {
  if (!document.getElementById("panel-analytics")) return;
  renderAnalyticsStats();
  renderStorageStats();
  renderBrowserInfo();
  renderBatteryNetworkRow();
  renderFpsChart();
}

// ==========================================
// 📰 NEWS HUB TAB
// ==========================================
const newsCategories = [
  { name: "Công nghệ", icon: "💻", query: "công nghệ" },
  { name: "AI", icon: "🤖", query: "trí tuệ nhân tạo AI" },
  { name: "Lập trình", icon: "⌨️", query: "lập trình programming" },
  { name: "Game", icon: "🎮", query: "game esports" },
  { name: "Thể thao", icon: "⚽", query: "thể thao bóng đá" },
  { name: "Thế giới", icon: "🌍", query: "tin tức thế giới" },
  { name: "Kinh doanh", icon: "💼", query: "kinh doanh tài chính" },
];

function renderNewsCategoryGrid() {
  const grid = document.getElementById("newsCategoryGrid");
  if (!grid) return;
  grid.innerHTML = newsCategories
    .map(
      (c) => `
    <div class="cs-subject-card" onclick="openGoogleNewsSearch('${c.query}')">
      <div class="cs-subject-icon">${c.icon}</div>
      <div class="cs-subject-name">${c.name}</div>
      <div class="cs-subject-status">🔗 Xem tin mới nhất</div>
    </div>`,
    )
    .join("");
}

function openGoogleNewsSearch(query) {
  window.open(
    `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=vi&gl=VN`,
    "_blank",
  );
}

function searchNewsCustom() {
  const query = document.getElementById("newsSearchInput").value.trim();
  if (!query) return;
  openGoogleNewsSearch(query);
}

// ---- Bookmark tin tức ----
function newsBookmarkKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "newsBookmarks_" + currentUser;
}
function getNewsBookmarks() {
  return JSON.parse(localStorage.getItem(newsBookmarkKey())) || [];
}
function addNewsBookmark() {
  const title = document.getElementById("newsBookmarkTitle").value.trim();
  const url = document.getElementById("newsBookmarkUrl").value.trim();
  if (!title || !url) {
    showToast("Vui lòng nhập tiêu đề và link!", "error");
    return;
  }
  const list = getNewsBookmarks();
  list.unshift({ id: generateTaskId(), title, url });
  localStorage.setItem(newsBookmarkKey(), JSON.stringify(list));
  document.getElementById("newsBookmarkTitle").value = "";
  document.getElementById("newsBookmarkUrl").value = "";
  renderNewsBookmarks();
  showToast("Đã lưu bookmark!", "success");
}
function removeNewsBookmark(id) {
  const list = getNewsBookmarks().filter((b) => b.id !== id);
  localStorage.setItem(newsBookmarkKey(), JSON.stringify(list));
  renderNewsBookmarks();
}
function renderNewsBookmarks() {
  const box = document.getElementById("newsBookmarkList");
  if (!box) return;
  const list = getNewsBookmarks();
  box.innerHTML = list.length
    ? list
        .map(
          (b) => `
      <div class="yt-video-row" onclick="window.open('${b.url}', '_blank')">
        <div class="yt-video-info"><div class="yt-video-title">${b.title}</div><div class="yt-video-sub">${b.url}</div></div>
        <div class="yt-video-actions"><span class="yt-icon-btn" onclick="event.stopPropagation(); removeNewsBookmark('${b.id}')">🗑</span></div>
      </div>`,
        )
        .join("")
    : `<div class="yt-empty">Chưa có bookmark nào.</div>`;
}

function initNewsHub() {
  if (!document.getElementById("panel-news")) return;
  renderNewsCategoryGrid();
  renderNewsBookmarks();
}

// ==========================================
// 💻 DEVELOPER HUB TAB
// ==========================================
async function loadGithubProfile() {
  const username = document.getElementById("githubUsernameInput").value.trim();
  const profileBox = document.getElementById("githubProfileBox");
  const reposBox = document.getElementById("githubReposBox");
  if (!username) return;

  profileBox.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải...</p>`;
  reposBox.style.display = "none";

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
      ),
    ]);
    const user = await userRes.json();
    const repos = await reposRes.json();

    if (user.message === "Not Found") {
      profileBox.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không tìm thấy tài khoản GitHub "${username}".</p>`;
      return;
    }

    profileBox.innerHTML = `
      <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
        <img src="${user.avatar_url}" alt="avatar" style="width: 64px; height: 64px; border-radius: 50%;">
        <div>
          <h3 style="font-size: 16px; color: var(--text-main);">${user.name || user.login}</h3>
          <p style="font-size: 12px; color: var(--text-muted);">@${user.login} ${user.bio ? "• " + user.bio : ""}</p>
        </div>
      </div>
      <div class="task-stats-row">
        <div class="stat-chip"><div class="stat-value">${user.public_repos}</div><div class="stat-label">Repository</div></div>
        <div class="stat-chip"><div class="stat-value">${user.followers}</div><div class="stat-label">Followers</div></div>
        <div class="stat-chip"><div class="stat-value">${user.following}</div><div class="stat-label">Following</div></div>
      </div>
    `;

    if (Array.isArray(repos) && repos.length > 0) {
      reposBox.style.display = "grid";
      reposBox.innerHTML = repos
        .map(
          (r) => `
        <div class="github-repo-card">
          <h3>${r.name}</h3>
          <p>${r.description || "Không có mô tả"}</p>
          <p style="margin-top: 8px;">⭐ ${r.stargazers_count} • 🍴 ${r.forks_count} • ${r.language || "—"}</p>
        </div>`,
        )
        .join("");
    }
    showToast("Đã tải hồ sơ GitHub!", "success");
  } catch (err) {
    profileBox.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Lỗi mạng hoặc GitHub API đang giới hạn tốc độ (rate limit ~60 request/giờ không key).</p>`;
  }
}

async function loadCodewarsStats() {
  const username = document
    .getElementById("codewarsUsernameInput")
    .value.trim();
  const box = document.getElementById("codewarsResultBox");
  if (!username) return;
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải...</p>`;
  try {
    const res = await fetch(
      `https://www.codewars.com/api/v1/users/${encodeURIComponent(username)}`,
    );
    const data = await res.json();
    if (data.success === false) {
      box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không tìm thấy tài khoản Codewars này.</p>`;
      return;
    }
    box.innerHTML = `
      <table class="bigo-table">
        <tr><td>Tên</td><td>${data.name || data.username}</td></tr>
        <tr><td>Rank tổng</td><td>${data.ranks.overall.name}</td></tr>
        <tr><td>Honor</td><td>${data.honor}</td></tr>
        <tr><td>Số bài đã giải</td><td>${data.codeChallenges.totalCompleted}</td></tr>
      </table>
    `;
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Lỗi mạng, thử lại sau.</p>`;
  }
}

async function loadStackOverflowStats() {
  const userId = document
    .getElementById("stackoverflowUserIdInput")
    .value.trim();
  const box = document.getElementById("stackoverflowResultBox");
  if (!userId) return;
  box.innerHTML = `<p style="color: var(--text-muted); font-size: 13px;">⏳ Đang tải...</p>`;
  try {
    const res = await fetch(
      `https://api.stackexchange.com/2.3/users/${encodeURIComponent(userId)}?site=stackoverflow`,
    );
    const data = await res.json();
    if (!data.items || data.items.length === 0) {
      box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Không tìm thấy User ID này.</p>`;
      return;
    }
    const user = data.items[0];
    box.innerHTML = `
      <table class="bigo-table">
        <tr><td>Tên</td><td>${user.display_name}</td></tr>
        <tr><td>Reputation</td><td>${user.reputation.toLocaleString()}</td></tr>
        <tr><td>Huy hiệu (Vàng/Bạc/Đồng)</td><td>🥇${user.badge_counts.gold} 🥈${user.badge_counts.silver} 🥉${user.badge_counts.bronze}</td></tr>
      </table>
    `;
  } catch (err) {
    box.innerHTML = `<p style="color: #ff453a; font-size: 13px;">⚠ Lỗi mạng, thử lại sau.</p>`;
  }
}

function openLeetcodeProfile() {
  const username = document
    .getElementById("leetcodeUsernameInput")
    .value.trim();
  if (!username) return;
  window.open(
    `https://leetcode.com/${encodeURIComponent(username)}/`,
    "_blank",
  );
}
function openHackerrankProfile() {
  const username = document
    .getElementById("hackerrankUsernameInput")
    .value.trim();
  if (!username) return;
  window.open(
    `https://www.hackerrank.com/profile/${encodeURIComponent(username)}`,
    "_blank",
  );
}

// ---- Roadmap cá nhân ----
function roadmapKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "devRoadmap_" + currentUser;
}
function getRoadmapItems() {
  return JSON.parse(localStorage.getItem(roadmapKey())) || [];
}
function addRoadmapItem() {
  const input = document.getElementById("roadmapItemInput");
  const text = input.value.trim();
  if (!text) return;
  const list = getRoadmapItems();
  list.push({ id: generateTaskId(), text, done: false });
  localStorage.setItem(roadmapKey(), JSON.stringify(list));
  input.value = "";
  renderRoadmapList();
}
function toggleRoadmapItem(id) {
  const list = getRoadmapItems();
  const item = list.find((i) => i.id === id);
  if (item) item.done = !item.done;
  localStorage.setItem(roadmapKey(), JSON.stringify(list));
  renderRoadmapList();
}
function removeRoadmapItem(id) {
  const list = getRoadmapItems().filter((i) => i.id !== id);
  localStorage.setItem(roadmapKey(), JSON.stringify(list));
  renderRoadmapList();
}
function renderRoadmapList() {
  const list = document.getElementById("roadmapList");
  if (!list) return;
  const items = getRoadmapItems();
  list.innerHTML = items.length
    ? items
        .map(
          (item) => `
      <li class="${item.done ? "done" : ""}">
        <span class="task-text" onclick="toggleRoadmapItem('${item.id}')" style="cursor: pointer;">${item.text}</span>
        <span class="delete-btn" onclick="removeRoadmapItem('${item.id}')">✕</span>
      </li>`,
        )
        .join("")
    : `<li style="color: var(--text-muted);">Chưa có mục roadmap nào.</li>`;
}

function initDevHub() {
  if (!document.getElementById("panel-devhub")) return;
  renderRoadmapList();
}

// ==========================================
// TAB MU — DỮ LIỆU HOÀN TOÀN TỰ ĐỘNG (TheSportsDB API, không cần nhập liệu)
// ==========================================
const MU_TEAM_ID = "133612"; // ID Manchester United trên TheSportsDB
let muAutoRefreshTimeout = null;
let muLastKnownStatus = "finished";

// Ước lượng trạng thái trận đấu từ thời gian, vì gói miễn phí của
// TheSportsDB không đảm bảo cờ "đang live" theo phút thực.
function estimateMuMatchStatus(event) {
  const eventTime = new Date(
    `${event.dateEvent}T${event.strTime || "00:00:00"}`,
  ).getTime();
  const now = Date.now();
  const hoursSince = (now - eventTime) / (1000 * 60 * 60);

  if (hoursSince < 0) return "upcoming";
  if (hoursSince >= 0 && hoursSince <= 2.5) return "live";
  return "finished";
}

function renderMuMatchCard(event, statusOverride) {
  const status = statusOverride || estimateMuMatchStatus(event);
  const statusLabel =
    status === "live"
      ? "🔴 LIVE"
      : status === "finished"
        ? "✅ FT"
        : "🕐 Upcoming";
  const statusClass =
    status === "live"
      ? "cd-overdue blink"
      : status === "finished"
        ? "cd-green"
        : "cd-yellow";

  const homeScore =
    event.intHomeScore !== null && event.intHomeScore !== undefined
      ? event.intHomeScore
      : "-";
  const awayScore =
    event.intAwayScore !== null && event.intAwayScore !== undefined
      ? event.intAwayScore
      : "-";
  const homeBadge = event.strHomeTeamBadge || "";
  const awayBadge = event.strAwayTeamBadge || "";

  return `
    <div class="quiz-question-block" style="text-align: center;">
      <span class="countdown-badge ${statusClass}" style="margin-bottom: 10px; display: inline-block;">${statusLabel}</span>
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin: 10px 0;">
        <div style="flex: 1; text-align: center;">
          ${homeBadge ? `<img src="${homeBadge}" alt="${event.strHomeTeam}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 6px;">` : ""}
          <div style="font-size: 12px; color: var(--text-main); font-weight: 600;">${event.strHomeTeam}</div>
        </div>
        <div style="font-size: 22px; font-weight: 800; color: var(--accent); min-width: 70px;">${homeScore} - ${awayScore}</div>
        <div style="flex: 1; text-align: center;">
          ${awayBadge ? `<img src="${awayBadge}" alt="${event.strAwayTeam}" style="width: 40px; height: 40px; object-fit: contain; margin-bottom: 6px;">` : ""}
          <div style="font-size: 12px; color: var(--text-main); font-weight: 600;">${event.strAwayTeam}</div>
        </div>
      </div>
      <div style="font-size: 11px; color: var(--text-muted);">
        ${event.strLeague || ""} • ${event.dateEvent || ""} ${event.strTime ? event.strTime.slice(0, 5) : ""}
      </div>
    </div>
  `;
}

function markMuLastUpdated() {
  const label = document.getElementById("muLastUpdatedLabel");
  if (label)
    label.textContent =
      "Cập nhật lần cuối: " + new Date().toLocaleTimeString("vi-VN");
}

async function fetchMuLiveScore() {
  const box = document.getElementById("muLiveScoreBox");
  if (!box) return;
  const apiKey = getSportsDbApiKey();

  try {
    const [lastRes, nextRes] = await Promise.all([
      fetch(
        `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${MU_TEAM_ID}`,
      ),
      fetch(
        `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${MU_TEAM_ID}`,
      ),
    ]);
    const lastData = await lastRes.json();
    const nextData = await nextRes.json();

    const lastEvent = lastData.results && lastData.results[0];
    const nextEvent =
      (nextData.events && nextData.events[0]) ||
      (nextData.results && nextData.results[0]);

    if (lastEvent && estimateMuMatchStatus(lastEvent) === "live") {
      // Chỉ có 1 trận đang diễn ra → chỉ hiển thị trận đó
      box.innerHTML = renderMuMatchCard(lastEvent, "live");
      muLastKnownStatus = "live";
    } else {
      // Không có trận đang diễn ra → hiển thị trận gần nhất + trận sắp tới
      let html = "";
      if (lastEvent) html += renderMuMatchCard(lastEvent, "finished");
      if (nextEvent) html += renderMuMatchCard(nextEvent, "upcoming");
      box.innerHTML =
        html ||
        `<p style="font-size: 12px; color: var(--text-muted);">Không có dữ liệu trận đấu.</p>`;
      muLastKnownStatus = "finished";
    }
    markMuLastUpdated();
  } catch (err) {
    box.innerHTML = `<p style="font-size: 12px; color: #ff453a;">⚠ Không thể tải dữ liệu tỷ số lúc này (lỗi mạng hoặc API tạm thời không phản hồi). Sẽ tự thử lại.</p>`;
  }
}

// ---- C. Lịch thi đấu sắp tới — tự động ----
async function fetchMuUpcomingFixtures() {
  const box = document.getElementById("muUpcomingFixturesBox");
  if (!box) return;
  const apiKey = getSportsDbApiKey();

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsnext.php?id=${MU_TEAM_ID}`,
    );
    const data = await res.json();
    const events = data.events || data.results || [];

    if (events.length === 0) {
      box.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">Chưa có lịch thi đấu sắp tới.</p>`;
      return;
    }

    box.innerHTML = events
      .map((e) => {
        const isHome = e.idHomeTeam === MU_TEAM_ID;
        const opponent = isHome ? e.strAwayTeam : e.strHomeTeam;
        return `
        <div class="upcoming-task-row">
          <span>📅 ${e.dateEvent || "?"} ${e.strTime ? e.strTime.slice(0, 5) : ""} — vs <b>${opponent}</b> (${isHome ? "Sân nhà" : "Sân khách"})</span>
          <span style="font-size: 11px; color: var(--text-muted);">${e.strLeague || ""}</span>
        </div>`;
      })
      .join("");
  } catch (err) {
    box.innerHTML = `<p style="font-size: 12px; color: #ff453a;">⚠ Không thể tải lịch thi đấu lúc này.</p>`;
  }
}

// ---- D. Kết quả gần đây — tự động, kèm phân loại Thắng/Hòa/Thua ----
async function fetchMuRecentResults() {
  const box = document.getElementById("muRecentResultsBox");
  if (!box) return;
  const apiKey = getSportsDbApiKey();

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/${apiKey}/eventslast.php?id=${MU_TEAM_ID}`,
    );
    const data = await res.json();
    const events = data.results || data.events || [];

    if (events.length === 0) {
      box.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">Chưa có dữ liệu kết quả gần đây.</p>`;
      return;
    }

    box.innerHTML = events
      .map((e) => {
        const isHome = e.idHomeTeam === MU_TEAM_ID;
        const opponent = isHome ? e.strAwayTeam : e.strHomeTeam;
        const muScore = parseInt(isHome ? e.intHomeScore : e.intAwayScore);
        const oppScore = parseInt(isHome ? e.intAwayScore : e.intHomeScore);

        let resultLabel = "—";
        let resultClass = "cd-none";
        if (!isNaN(muScore) && !isNaN(oppScore)) {
          if (muScore > oppScore) {
            resultLabel = "🟢 Thắng";
            resultClass = "cd-green";
          } else if (muScore < oppScore) {
            resultLabel = "🔴 Thua";
            resultClass = "cd-red";
          } else {
            resultLabel = "🟡 Hòa";
            resultClass = "cd-yellow";
          }
        }

        return `
        <div class="upcoming-task-row">
          <span>vs <b>${opponent}</b> — ${e.intHomeScore ?? "-"} : ${e.intAwayScore ?? "-"} (${e.dateEvent || "?"})</span>
          <span class="countdown-badge ${resultClass}">${resultLabel}</span>
        </div>`;
      })
      .join("");
  } catch (err) {
    box.innerHTML = `<p style="font-size: 12px; color: #ff453a;">⚠ Không thể tải kết quả gần đây lúc này.</p>`;
  }
}

// ---- Tự động làm mới: nhanh hơn khi đang LIVE, chậm hơn khi không có trận ----
function startMuAutoRefresh() {
  if (muAutoRefreshTimeout) clearTimeout(muAutoRefreshTimeout);

  const scheduleNext = () => {
    const interval = muLastKnownStatus === "live" ? 20000 : 5 * 60 * 1000; // 20s khi LIVE, 5 phút khi không
    muAutoRefreshTimeout = setTimeout(async () => {
      await fetchMuLiveScore();
      fetchMuUpcomingFixtures();
      fetchMuRecentResults();
      scheduleNext();
    }, interval);
  };
  scheduleNext();
}

// ==========================================
// TAB THỜI TIẾT — HOÀN TOÀN TỰ ĐỘNG (Open-Meteo, miễn phí không cần key)
// Ưu tiên Geolocation trình duyệt → nếu từ chối, dùng Hà Nội làm mặc định.
// Không yêu cầu người dùng nhập thành phố hay tra cứu gì cả.
// ==========================================
const WEATHER_DEFAULT_CITY = {
  lat: 21.0278,
  lon: 105.8342,
  label: "Hà Nội (vị trí mặc định)",
};
let weatherAutoRefreshInterval = null;

// Bảng diễn giải mã thời tiết WMO sang mô tả + icon tiếng Việt
function interpretWeatherCode(code) {
  const map = {
    0: ["Trời quang", "☀️"],
    1: ["Ít mây", "🌤️"],
    2: ["Có mây", "⛅"],
    3: ["Nhiều mây", "☁️"],
    45: ["Sương mù", "🌫️"],
    48: ["Sương mù đóng băng", "🌫️"],
    51: ["Mưa phùn nhẹ", "🌦️"],
    53: ["Mưa phùn", "🌦️"],
    55: ["Mưa phùn dày", "🌧️"],
    61: ["Mưa nhẹ", "🌧️"],
    63: ["Mưa vừa", "🌧️"],
    65: ["Mưa to", "⛈️"],
    71: ["Tuyết nhẹ", "🌨️"],
    80: ["Mưa rào nhẹ", "🌦️"],
    81: ["Mưa rào", "🌧️"],
    82: ["Mưa rào lớn", "⛈️"],
    95: ["Dông", "⛈️"],
    96: ["Dông kèm mưa đá", "⛈️"],
  };
  return map[code] || ["Không xác định", "🌡️"];
}

async function renderWeatherTabResult(latitude, longitude, cityLabel) {
  const box = document.getElementById("weatherTabBox");
  if (!box) return;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code`,
    );
    const data = await res.json();
    const current = data.current;
    const [condition, icon] = interpretWeatherCode(current.weather_code);

    box.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="font-size: 56px;">${icon}</div>
        <div>
          <div style="font-size: 32px; font-weight: 700; color: var(--text-main);">${Math.round(current.temperature_2m)}°C</div>
          <div style="font-size: 13px; color: var(--text-muted);">${condition} • ${cityLabel}</div>
        </div>
      </div>
      <div class="task-stats-row" style="margin-top: 18px;">
        <div class="stat-chip"><div class="stat-value" style="font-size: 16px;">🌡️ ${Math.round(current.apparent_temperature)}°C</div><div class="stat-label">Cảm giác như</div></div>
        <div class="stat-chip"><div class="stat-value" style="font-size: 16px;">💧 ${current.relative_humidity_2m}%</div><div class="stat-label">Độ ẩm</div></div>
        <div class="stat-chip"><div class="stat-value" style="font-size: 16px;">💨 ${current.wind_speed_10m} km/h</div><div class="stat-label">Tốc độ gió</div></div>
      </div>
    `;
    const label = document.getElementById("weatherLastUpdatedLabel");
    if (label)
      label.textContent =
        "Cập nhật lần cuối: " + new Date().toLocaleTimeString("vi-VN");
  } catch (err) {
    box.innerHTML = `<p style="font-size: 12px; color: #ff453a;">⚠ Không thể tải dữ liệu thời tiết lúc này (lỗi mạng hoặc API tạm thời không phản hồi).</p>`;
  }
}

function initWeatherTab() {
  const box = document.getElementById("weatherTabBox");
  if (!box) return;

  const runFetch = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          renderWeatherTabResult(
            pos.coords.latitude,
            pos.coords.longitude,
            "Vị trí của bạn",
          ),
        () =>
          renderWeatherTabResult(
            WEATHER_DEFAULT_CITY.lat,
            WEATHER_DEFAULT_CITY.lon,
            WEATHER_DEFAULT_CITY.label,
          ),
      );
    } else {
      renderWeatherTabResult(
        WEATHER_DEFAULT_CITY.lat,
        WEATHER_DEFAULT_CITY.lon,
        WEATHER_DEFAULT_CITY.label,
      );
    }
  };

  runFetch();
  if (!weatherAutoRefreshInterval) {
    weatherAutoRefreshInterval = setInterval(runFetch, 10 * 60 * 1000); // làm mới mỗi 10 phút
  }
}

// ==========================================
// TAB GIÁ XĂNG (cập nhật thủ công — không có API công khai đáng tin cậy,
// xem ghi chú minh bạch trong giao diện)
// ==========================================
function gasPriceKey() {
  const currentUser = sessionStorage.getItem("currentUser") || "guest";
  return "gasPriceHistory_" + currentUser;
}
function getGasPriceHistory() {
  return JSON.parse(localStorage.getItem(gasPriceKey())) || [];
}
function saveGasPriceHistory(list) {
  localStorage.setItem(gasPriceKey(), JSON.stringify(list));
}

function addGasPriceEntry() {
  const date = document.getElementById("gasPriceDate").value;
  const price = parseInt(document.getElementById("gasPriceValue").value);
  if (!date || isNaN(price)) {
    showToast("Vui lòng nhập đủ ngày và giá!", "error");
    return;
  }
  const list = getGasPriceHistory();
  list.push({ date, price });
  list.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveGasPriceHistory(list);
  document.getElementById("gasPriceValue").value = "";
  renderGasPriceChart();
  showToast("Đã thêm lần điều chỉnh giá xăng!", "success");
}

function removeGasPriceEntry(idx) {
  const list = getGasPriceHistory();
  list.splice(idx, 1);
  saveGasPriceHistory(list);
  renderGasPriceChart();
}

function renderGasPriceChart() {
  const currentRow = document.getElementById("gasPriceCurrentRow");
  const svg = document.getElementById("gasPriceChart");
  const table = document.getElementById("gasPriceHistoryTable");
  if (!currentRow || !svg || !table) return;

  const list = getGasPriceHistory();

  // --- Thẻ giá hiện tại + mức tăng/giảm ---
  if (list.length === 0) {
    currentRow.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">Chưa có dữ liệu, hãy thêm lần điều chỉnh giá đầu tiên.</p>`;
  } else {
    const latest = list[list.length - 1];
    const prev = list.length > 1 ? list[list.length - 2] : null;
    const diff = prev ? latest.price - prev.price : 0;
    const diffLabel = prev
      ? diff > 0
        ? `🔺 Tăng ${diff.toLocaleString()} đồng`
        : diff < 0
          ? `🔻 Giảm ${Math.abs(diff).toLocaleString()} đồng`
          : "◾ Không đổi"
      : "—";

    currentRow.innerHTML = `
      <div class="stat-chip"><div class="stat-value" style="font-size: 18px;">${latest.price.toLocaleString()}đ</div><div class="stat-label">Giá hiện tại (đồng/lít)</div></div>
      <div class="stat-chip"><div class="stat-value" style="font-size: 15px;">${diffLabel}</div><div class="stat-label">So với lần trước</div></div>
      <div class="stat-chip"><div class="stat-value" style="font-size: 15px;">${new Date(latest.date).toLocaleDateString("vi-VN")}</div><div class="stat-label">Ngày cập nhật</div></div>
    `;
  }

  // --- Biểu đồ đường (vanilla SVG) ---
  if (list.length < 2) {
    svg.innerHTML = `<text x="200" y="80" text-anchor="middle" fill="var(--text-muted)" font-size="12">Cần ít nhất 2 lần điều chỉnh để vẽ biểu đồ</text>`;
  } else {
    const w = 400,
      h = 160,
      pad = 30;
    const prices = list.map((l) => l.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const range = maxP - minP || 1;

    const points = list.map((l, i) => {
      const x = pad + (i / (list.length - 1)) * (w - pad * 2);
      const y = h - pad - ((l.price - minP) / range) * (h - pad * 2);
      return `${x},${y}`;
    });

    const dots = list
      .map((l, i) => {
        const [x, y] = points[i].split(",");
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--accent)" />`;
      })
      .join("");

    svg.innerHTML = `
      <polyline points="${points.join(" ")}" fill="none" style="stroke: var(--accent); stroke-width: 2.5;" />
      ${dots}
    `;
  }

  // --- Bảng lịch sử ---
  Array.from(table.querySelectorAll("tr")).forEach((r, i) => {
    if (i > 0) r.remove();
  });
  list
    .slice()
    .reverse()
    .forEach((entry) => {
      const idx = list.indexOf(entry);
      const prevIdx = idx - 1;
      const diff = prevIdx >= 0 ? entry.price - list[prevIdx].price : 0;
      const diffText =
        prevIdx < 0
          ? "—"
          : diff > 0
            ? `🔺 +${diff.toLocaleString()}đ`
            : diff < 0
              ? `🔻 ${diff.toLocaleString()}đ`
              : "◾ 0đ";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date(entry.date).toLocaleDateString("vi-VN")}</td>
        <td>${entry.price.toLocaleString()}đ</td>
        <td>${diffText}</td>
        <td><span class="delete-btn" onclick="removeGasPriceEntry(${idx})">✕</span></td>
      `;
      table.appendChild(tr);
    });
}
