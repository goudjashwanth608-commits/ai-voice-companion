const companionName = document.getElementById("companionName");
const message = document.getElementById("message");
const statusText = document.getElementById("statusText");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const micBtn = document.getElementById("micBtn");

let selectedCompanion = "Maya";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    statusText.textContent = "Listening...";
    message.textContent = "I'm listening...";
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    statusText.textContent = "You said:";
    message.textContent = spokenText;

    console.log("User said:", spokenText);

    // Temporary voice response
    speak(
      `I heard you say ${spokenText}. I'm here with you.`
    );
  };

  recognition.onerror = (event) => {
    statusText.textContent = "Microphone error";
    message.textContent = "Please allow microphone access and try again.";

    console.log("Speech recognition error:", event.error);
  };

  recognition.onend = () => {
    statusText.textContent = "Ready";
  };
} else {
  message.textContent =
    "Speech recognition is not supported in this browser.";
}

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
  if (!recognition) {
    message.textContent =
      "Your browser does not support voice recognition.";
    return;
  }

  recognition.start();
});

function speak(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-IN";
  speech.rate = 1;
  speech.pitch = selectedCompanion === "Maya" ? 1.15 : 0.9;

  window.speechSynthesis.speak(speech);
}
