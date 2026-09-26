const companionName = document.getElementById("companionName");
const message = document.getElementById("message");
const statusText = document.getElementById("statusText");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const micBtn = document.getElementById("micBtn");

let selectedCompanion = "Maya";

femaleBtn.addEventListener("click", () => {
  selectedCompanion = "Maya";

  companionName.textContent = "Maya";
  message.textContent = 'Say "Hey Maya" to talk with me';
  statusText.textContent = "Ready";
});

maleBtn.addEventListener("click", () => {
  selectedCompanion = "Arjun";

  companionName.textContent = "Arjun";
  message.textContent = 'Say "Hey Arjun" to talk with me';
  statusText.textContent = "Ready";
});

micBtn.addEventListener("click", () => {
  statusText.textContent = "Listening...";
  message.textContent = "I'm listening...";

  setTimeout(() => {
    statusText.textContent = "Ready";
    message.textContent = `I'm here. What would you like to talk about?`;
  }, 2000);
});
