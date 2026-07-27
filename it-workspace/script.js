const YT_API_KEY = "AIzaSyAj3PnZL4hBnqN3iAn1nAwZI2XaDaHyzgE";

let currentChatFriend = null;
let tempAvatarBase64 = "";

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
}

function applyUserSettings(settings) {
  if (settings.textColor) {
    document.documentElement.style.setProperty(
      "--text-main",
      settings.textColor,
    );
  }

  const body = document.getElementById("pageBody");
  // Xóa gọn các class theme cũ trước khi áp dụng theme mới
  body.classList.remove(
    "style-blur",
    "style-rgb",
    "style-basic",
    "style-cyberpunk",
    "style-matrix",
  );

  // Áp dụng theme mới được chọn (nếu không phải là apple mặc định)
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
// XỬ LÝ AVATAR KHI ĐĂNG KÝ
// ==========================================
function previewAvatar(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    tempAvatarBase64 = e.target.result;
    document.getElementById("avatarPreviewBox").innerHTML =
      `<img src="${tempAvatarBase64}" alt="Avatar">`;
  };
  reader.readAsDataURL(file);
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
  if (sessionStorage.getItem("itDashboardLogged") === "true") {
    document.getElementById("loginOverlay").style.display = "none";
    loginStartTime =
      parseInt(sessionStorage.getItem("loginStartTime")) || Date.now();
    updateAccountHeaderUI();
    startUsageTracking();
    loadUserSettings();
    loadUserHeaderProfile();
    loadMessengerConversations();
  }
});

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const authBtn = document.getElementById("authBtn");
  const switchBtn = document.getElementById("authSwitchBtn");
  document.getElementById("authError").style.display = "none";
  document.getElementById("avatarUploadInput").value = "";
  tempAvatarBase64 = "";
  document.getElementById("avatarPreviewBox").innerHTML = "👤";

  if (!isLoginMode) {
    authBtn.textContent = "Đăng Ký";
    switchBtn.textContent = "Đã có tài khoản? Đăng nhập";
  } else {
    authBtn.textContent = "Đăng Nhập";
    switchBtn.textContent = "Tạo tài khoản mới";
  }
}

function handleAuth() {
  const user = document.getElementById("authUsername").value.trim();
  const pass = document.getElementById("authPassword").value.trim();
  const errorMsg = document.getElementById("authError");

  if (!user || !pass) {
    errorMsg.textContent = "Vui lòng nhập đầy đủ tài khoản và mật khẩu!";
    errorMsg.style.display = "block";
    return;
  }

  const userKey = "account_" + user;
  const dataKey = "accountData_" + user;
  const totalTimeKey = "totalUsageTime_" + user;

  if (isLoginMode) {
    const savedPass = localStorage.getItem(userKey);
    if (savedPass && savedPass === pass) {
      sessionStorage.setItem("itDashboardLogged", "true");
      sessionStorage.setItem("currentUser", user);

      loginStartTime = Date.now();
      sessionStorage.setItem("loginStartTime", loginStartTime);

      document.getElementById("loginOverlay").style.display = "none";
      updateAccountHeaderUI();
      startUsageTracking();
      loadUserSettings();
      loadUserHeaderProfile();
      loadMessengerConversations();
    } else {
      errorMsg.textContent = "Sai tài khoản hoặc mật khẩu!";
      errorMsg.style.display = "block";
    }
  } else {
    if (localStorage.getItem(userKey)) {
      errorMsg.textContent = "Tên tài khoản này đã tồn tại!";
      errorMsg.style.display = "block";
    } else {
      localStorage.setItem(userKey, pass);
      localStorage.setItem(totalTimeKey, 0);
      const accData = { avatar: tempAvatarBase64 || "" };
      localStorage.setItem(dataKey, JSON.stringify(accData));
      alert("Đăng ký thành công! Đăng nhập ngay thôi.");
      toggleAuthMode();
    }
  }
}

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

// Đồng bộ hiển thị Avatar và Tên tài khoản ra giao diện chính
function loadUserHeaderProfile() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  document.getElementById("displayAccountName").textContent = currentUser;

  const accData =
    JSON.parse(localStorage.getItem("accountData_" + currentUser)) || {};
  const headerAvatar = document.getElementById("headerAvatarDisplay");

  if (accData.avatar && accData.avatar.trim() !== "") {
    headerAvatar.innerHTML = `<img src="${accData.avatar}" alt="Avatar">`;
  } else {
    headerAvatar.innerHTML = currentUser.charAt(0).toUpperCase();
    headerAvatar.style.fontWeight = "bold";
  }
}

function switchAccount() {
  saveCurrentSessionTime();
  if (usageTimerInterval) clearInterval(usageTimerInterval);
  sessionStorage.clear();
  document.getElementById("loginOverlay").style.display = "flex";
}

// Điều hướng Tab & Viên thuốc trượt 5 tab
const tabBtns = document.querySelectorAll(".tab-btn");
const pillIndicator = document.querySelector(".pill-indicator");

tabBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("panel-" + btn.dataset.tab).classList.add("active");

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
// YOUTUBE: TÌM KIẾM, ẨN DANH SÁCH & ĐIỀU HƯỚNG NEXT/PREV
// ==========================================
let currentPlaylist = [];
let currentPlaylistIndex = 0;

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

// Phát Video trực tiếp lên khung hình và Ẩn Danh Sách Tìm Kiếm
function playVideoId(id) {
  const placeholder = document.getElementById("playerPlaceholder");
  if (placeholder) placeholder.style.display = "none";

  const box = document.getElementById("playerBox");
  box.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>`;

  // TỰ ĐỘNG ẨN KHUNG TÌM KIẾM
  const resultsDiv = document.getElementById("searchResults");
  if (resultsDiv) {
    resultsDiv.style.display = "none";
  }
}

// Xử lý khi ấn chọn một video từ danh sách tìm kiếm
function playSearchedVideo(id) {
  if (!currentPlaylist.includes(id)) {
    currentPlaylist.push(id);
  }
  currentPlaylistIndex = currentPlaylist.indexOf(id);
  playVideoId(id);
}

// Xử lý Bài Tiếp Theo (Hoạt động dựa trên playlist vừa tìm kiếm)
function nextTrack() {
  if (currentPlaylist.length === 0) {
    alert("Chưa có danh sách phát! Hãy tìm kiếm một bài hát trước.");
    return;
  }
  currentPlaylistIndex = (currentPlaylistIndex + 1) % currentPlaylist.length;
  playVideoId(currentPlaylist[currentPlaylistIndex]);
}

// Xử lý Bài Trước (Hoạt động dựa trên playlist vừa tìm kiếm)
function prevTrack() {
  if (currentPlaylist.length === 0) {
    alert("Chưa có danh sách phát! Hãy tìm kiếm một bài hát trước.");
    return;
  }
  currentPlaylistIndex =
    (currentPlaylistIndex - 1 + currentPlaylist.length) %
    currentPlaylist.length;
  playVideoId(currentPlaylist[currentPlaylistIndex]);
}

// Xử lý Tìm Kiếm & Hiển thị danh sách kết quả
async function handleYouTubeAction() {
  const input = document.getElementById("ytInput").value.trim();
  const resultsDiv = document.getElementById("searchResults");
  if (!input) return;

  // 1. Kiểm tra nếu dán trực tiếp link YouTube
  const m = input.match(
    /(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  if (m) {
    resultsDiv.style.display = "none";
    playSearchedVideo(m[1]);
    return;
  }

  // 2. TÌM KIẾM TỪ KHÓA BẰNG YOUTUBE API
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--accent);">Đang tìm kiếm: "${input}"...</div>`;

  if (!YT_API_KEY) {
    resultsDiv.innerHTML = `
      <div style="padding: 15px; text-align: center; color: #ff453a; border: 1px solid #ff453a; border-radius: 12px; margin-bottom: 10px;">
        <b>Lỗi: Thiếu YouTube API Key!</b>
      </div>`;
    return;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(input)}&type=video&key=${YT_API_KEY}`,
    );
    const data = await response.json();

    if (data.error) {
      resultsDiv.innerHTML = `<div style="padding: 15px; text-align: center; color: #ff453a;">Lỗi API: ${data.error.message}</div>`;
      return;
    }

    if (data.items && data.items.length > 0) {
      resultsDiv.style.display = "grid";
      resultsDiv.innerHTML = "";

      // Tạo playlist ẩn ngay khi tìm kiếm ra kết quả
      currentPlaylist = data.items.map((item) => item.id.videoId);
      currentPlaylistIndex = 0;

      data.items.forEach((item, idx) => {
        const vid = item.id.videoId;
        const title = item.snippet.title;
        const channel = item.snippet.channelTitle;
        const thumb = item.snippet.thumbnails.medium.url;

        resultsDiv.innerHTML += `
          <div class="result-item-grid" onclick="playSearchedVideo('${vid}')" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--apple-glass-border); border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform 0.2s;">
            <img src="${thumb}" alt="thumb" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
            <div class="info" style="padding: 10px;">
              <div class="title" style="font-size: 13px; font-weight: 500; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${title}">${title}</div>
              <div class="channel" style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${channel}</div>
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
    // Thêm tham số &dt=bd vào API để Google trả về TỪ LOẠI VÀ TỪ ĐỒNG NGHĨA
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(q)}`,
    );
    const data = await res.json();

    // Phần dịch thông thường
    let htmlResult = `<b>Dịch nghĩa:</b> <span style="color: #30d158; font-size: 16px;">${data[0][0][0]}</span>`;

    // Bóc tách Từ loại và Từ đồng nghĩa (Nếu là từ đơn có trong từ điển)
    if (data[1] && data[1].length > 0) {
      htmlResult += `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--apple-glass-border);"><b>Giải thích chi tiết (Từ loại & Đồng nghĩa):</b></div>`;

      data[1].forEach((part) => {
        const partOfSpeech = part[0]; // (vd: noun, verb, adjective)
        const synonyms = part[1].join(", "); // Các từ đồng nghĩa tương ứng

        htmlResult += `
          <div style="margin-top: 8px; padding-left: 10px; border-left: 2px solid var(--accent);">
            <i style="color: var(--accent); font-size: 13px; text-transform: capitalize;">${partOfSpeech}</i>: 
            <span style="color: var(--text-muted);">${synonyms}</span>
          </div>`;
      });
    } else {
      // Dành cho trường hợp tra cả một câu văn dài
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

const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
if (todoList && localStorage.getItem("savedTodos")) {
  todoList.innerHTML = localStorage.getItem("savedTodos");
}
function saveTodos() {
  if (todoList) localStorage.setItem("savedTodos", todoList.innerHTML);
}
function addTodo() {
  if (!todoInput) return;
  let val = todoInput.value.trim();
  if (!val) return;
  let li = document.createElement("li");
  li.innerHTML = `<span class="task-text" onclick="this.parentElement.classList.toggle('done'); saveTodos();">${val}</span><span class="delete-btn" onclick="this.parentElement.remove(); saveTodos();">✕</span>`;
  todoList.prepend(li);
  todoInput.value = "";
  saveTodos();
}
if (todoInput) {
  todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
  });
}

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
