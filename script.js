const companionName = document.getElementById("companionName");
const message = document.getElementById("message");
const statusText = document.getElementById("statusText");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const micBtn = document.getElementById("micBtn");

let selectedCompanion = "Maya";
let wakeListening = true;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    statusText.textContent = `Listening for "Hey ${selectedCompanion}"...`;
  };

  recognition.onresult = (event) => {
    const text =
      event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

    console.log("Heard:", text);

    const wakeName = selectedCompanion.toLowerCase();

    // Check whether the user said the companion's name
    if (
      text.includes(`hey ${wakeName}`) ||
      text.includes(wakeName)
    ) {
      activateCompanion();
    }
  };

  recognition.onerror = (event) => {
    console.log("Recognition error:", event.error);

    if (event.error === "not-allowed") {
      statusText.textContent = "Microphone permission required";
      message.textContent =
        "Please allow microphone access.";
    }
  };

  recognition.onend = () => {
    // Restart listening when possible
    if (wakeListening) {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.log("Restarting...");
        }
      }, 500);
    }
  };
}

function activateCompanion() {
  statusText.textContent = "Active";
  message.textContent = `Yes, I'm here. What do you need?`;

  speak(`Yes, I'm here. What do you need?`);
}

femaleBtn.addEventListener("click", () => {
  selectedCompanion = "Maya";

  companionName.textContent = "Maya";
  message.textContent = 'Say "Hey Maya"';
  statusText.textContent = 'Listening...';
});

maleBtn.addEventListener("click", () => {
  selectedCompanion = "Arjun";

  companionName.textContent = "Arjun";
  message.textContent = 'Say "Hey Arjun"';
  statusText.textContent = 'Listening...';
});

micBtn.addEventListener("click", () => {
  if (!recognition) {
    message.textContent =
      "Voice recognition is not supported here.";
    return;
  }

  wakeListening = true;

  try {
    recognition.start();
  } catch (error) {
    console.log("Already listening");
  }
});

function speak(text) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-IN";
  speech.rate = 1;

  if (selectedCompanion === "Maya") {
    speech.pitch = 1.15;
  } else {
    speech.pitch = 0.9;
  }

  window.speechSynthesis.speak(speech);
}
