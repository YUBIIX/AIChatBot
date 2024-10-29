const chatBot = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const urlPattern = new RegExp("`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${AIzaSyDr_tu137vVZdmr7BlOHKmB7Wqp2TkeawI}`");
const isValidUrl = urlPattern.test(yourUrl);

const API_KEY = "AIzaSyDr_tu137vVZdmr7BlOHKmB7Wqp2TkeawI";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${AIzaSyDr_tu137vVZdmr7BlOHKmB7Wqp2TkeawI}`;


let userData = {
  message: null,
  file: {
    data: null,
    mime_type: null
  }
};

let chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// ฟังก์ชันสำหรับสร้างองค์ประกอบข้อความ
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// ฟังก์ชันเพื่อรับการตอบสนองจาก API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // ตรวจสอบว่ามีไฟล์อยู่หรือไม่
  const fileParts = userData.file && userData.file.data
    ? [{ inline_data: userData.file }]
    : [];

  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }, ...fileParts]
  });

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: {
        text: userData.message
      }
    })
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || "An error occurred");

    const apiResponseText = data.candidates?.[0]?.output || "No response available.";
    messageElement.innerText = apiResponseText;
  } catch (error) {
    console.error(error);
    messageElement.innerText = "Error: Unable to fetch response.";
  } finally {
    userData.file = {}; // ล้างข้อมูลไฟล์
    incomingMessageDiv.classList.remove("thinking");
    chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });
  }
};

const url = new URL(yourUrl);
if (url.protocol === "https:") {
  console.log("URL ใช้โปรโตคอลที่ปลอดภัย");
} else {
  console.log("URL ไม่ปลอดภัย");
}

fetch(yourUrl, { method: "HEAD" })
  .then(response => {
    if (response.ok) {
      console.log("URL ถูกต้องและสามารถเข้าถึงได้");
    } else {
      console.log("URL ไม่สามารถเข้าถึงได้");
    }
  })
  .catch(error => console.error("URL ไม่ถูกต้องหรือมีข้อผิดพลาด:", error));


// ฟังก์ชันสำหรับจัดการข้อความขาออก
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
  messageInput.dispatchEvent(new Event("input"));

  const messageContent = `
    <div class="message-text"></div>
    ${userData.file.data 
      ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` 
      : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
  chatBot.appendChild(outgoingMessageDiv);
  chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const messageContent = ` 
      <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z"></path>
      </svg>
      <div class="message-text">
        <div class="thinking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBot.appendChild(incomingMessageDiv);
    chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// การจัดการอัปเดตความสูงของ textarea
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// การจัดการไฟล์อัปโหลด
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      userData.file.data = reader.result.split(",")[1];
      userData.file.mime_type = file.type;
      fileUploadWrapper.classList.add("file-uploaded");
      document.querySelector("#file-preview").src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// ยกเลิกการอัปโหลดไฟล์
fileCancelButton.addEventListener("click", () => {
  fileUploadWrapper.classList.remove("file-uploaded");
  fileInput.value = "";
  userData.file = { data: null, mime_type: null };
});

// เปิด/ปิด Chatbot
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
