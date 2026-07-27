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
// XỬ LÝ ĐỔI AVATAR TRONG PHẦN SETTING
// ==========================================
function handleSettingsAvatarChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const newAvatarBase64 = e.target.result;
    const dataKey = "accountData_" + currentUser;
    let accData = JSON.parse(localStorage.getItem(dataKey)) || {};
    accData.avatar = newAvatarBase64;
    localStorage.setItem(dataKey, JSON.stringify(accData));

    // Cập nhật giao diện ngay lập tức
    loadUserHeaderProfile();
    loadUserSettings();
    loadMessengerConversations();
  };
  reader.readAsDataURL(file);
}

// Đồng bộ hiển thị Avatar và Tên tài khoản ra giao diện chính & Messenger
function loadUserHeaderProfile() {
  const currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) return;

  document.getElementById("displayAccountName").textContent = currentUser;

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
    renderTaskBoard();
  }
});

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  const authBtn = document.getElementById("authBtn");
  const switchBtn = document.getElementById("authSwitchBtn");
  const authTitle = document.getElementById("authTitle");
  document.getElementById("authError").style.display = "none";

  if (!isLoginMode) {
    authTitle.textContent = "ĐĂNG KÝ TÀI KHOẢN MỚI";
    authTitle.style.display = "block";
    authBtn.textContent = "Đăng Ký";
    switchBtn.textContent = "Đã có tài khoản? Đăng nhập ngay";
  } else {
    authTitle.style.display = "none";
    authBtn.textContent = "Đăng Nhập";
    switchBtn.textContent = "Đăng ký tài khoản mới";
  }
}

function handleAuth() {
  const user = document.getElementById("authUsername").value.trim();
  const pass = document.getElementById("authPassword").value.trim();
  const errorMsg = document.getElementById("authError");

  if (!user || !pass) {
    errorMsg.textContent = "Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!";
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

      if (!localStorage.getItem(dataKey)) {
        localStorage.setItem(dataKey, JSON.stringify({ avatar: "" }));
      }

      loginStartTime = Date.now();
      sessionStorage.setItem("loginStartTime", loginStartTime);

      document.getElementById("loginOverlay").style.display = "none";
      updateAccountHeaderUI();
      startUsageTracking();
      loadUserSettings();
      loadUserHeaderProfile();
      loadMessengerConversations();
      renderTaskBoard();
    } else {
      errorMsg.textContent = "Tên tài khoản hoặc mật khẩu không chính xác!";
      errorMsg.style.display = "block";
    }
  } else {
    if (localStorage.getItem(userKey)) {
      errorMsg.textContent =
        "Tên tài khoản này đã được sử dụng bởi người khác. Vui lòng chọn tên khác!";
      errorMsg.style.display = "block";
    } else {
      localStorage.setItem(userKey, pass);
      localStorage.setItem(totalTimeKey, 0);
      const accData = { avatar: "" };
      localStorage.setItem(dataKey, JSON.stringify(accData));
      alert("Đăng ký tài khoản thành công! Hãy đăng nhập ngay.");
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
function searchSpotifyMusic() {
  const input = document.getElementById("spotifySearchInput").value.trim();
  if (!input) return;

  let spotifyUri = "";
  const match = input.match(/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
  if (match) {
    spotifyUri = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
  } else {
    spotifyUri =
      "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0";
    alert(
      "Spotify yêu cầu dán chính xác link bài hát/playlist từ ứng dụng Spotify để phát trực tiếp!",
    );
  }

  document.getElementById("spotifyFrameContainer").innerHTML = `
    <iframe id="spotifyIframe" style="border-radius:12px" src="${spotifyUri}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
  `;
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

function playVideoId(id) {
  const placeholder = document.getElementById("playerPlaceholder");
  if (placeholder) placeholder.style.display = "none";

  const box = document.getElementById("playerBox");
  box.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>`;

  const resultsDiv = document.getElementById("searchResults");
  if (resultsDiv) {
    resultsDiv.style.display = "none";
  }
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
      resultsDiv.style.display = "grid";
      resultsDiv.innerHTML = "";

      currentPlaylist = data.items.map((item) => item.id.videoId);
      currentPlaylistIndex = 0;

      data.items.forEach((item) => {
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
