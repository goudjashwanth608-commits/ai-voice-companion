 const companionName = document.getElementById("companionName");
const message = document.getElementById("message");
const statusText = document.getElementById("statusText");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const micBtn = document.getElementById("micBtn");

let selectedCompanion = "Maya";
let wakeListening = true;
let waitingForCommand = false;

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    if (!waitingForCommand) {
      statusText.textContent =
        `Listening for "Hey ${selectedCompanion}"...`;
    }
  };

  recognition.onresult = (event) => {
    const text =
      event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();

    console.log("Heard:", text);

    const wakeName = selectedCompanion.toLowerCase();

    // Wake-name detected
    if (!waitingForCommand &&
        (text.includes(`hey ${wakeName}`) ||
         text.includes(wakeName))) {

      activateCompanion();
      return;
    }

    // User's command detected
    if (waitingForCommand) {
      handleCommand(text);
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
    if (wakeListening) {
      setTimeout(() => {
        try {
          recognition.start();
        } catch (error) {
          console.log("Recognition restarting...");
        }
      }, 500);
    }
  };
}

function activateCompanion() {
  waitingForCommand = true;

  statusText.textContent = "Active";
  message.textContent =
    `Yes, I'm here. What do you need?`;

  speak(`Yes, I'm here. What do you need?`);

  // Give the voice response a moment,
  // then listen for the user's command.
  setTimeout(() => {
    statusText.textContent = "Listening to you...";
    message.textContent = "I'm listening...";
  }, 1200);
}

function handleCommand(command) {
  waitingForCommand = false;

  statusText.textContent = "Thinking...";
  message.textContent = command;

  console.log("User command:", command);

  let response = "";

  if (command.includes("hello") ||
      command.includes("hi") ||
      command.includes("hey")) {

    response =
      `Hello! I'm ${selectedCompanion}. It's nice to talk with you.`;
  }

  else if (command.includes("how are you")) {

    response =
      "I'm doing great! I'm here and ready to talk with you.";
  }

  else if (command.includes("your name")) {

    response =
      `My name is ${selectedCompanion}.`;
  }

  else if (command.includes("thank you") ||
           command.includes("thanks")) {

    response =
      "You're welcome! I'm always happy to help.";
  }

  else if (command.includes("good morning")) {

    response =
      "Good morning! I hope you have a wonderful day.";
  }

  else {

    response =
      `I heard you say ${command}. My real AI brain will be connected in the next step.`;
  }

  message.textContent = response;
  statusText.textContent = "Speaking...";

  speak(response);
}

femaleBtn.addEventListener("click", () => {

  selectedCompanion = "Maya";
  waitingForCommand = false;

  companionName.textContent = "Maya";
  message.textContent = 'Say "Hey Maya"';
  statusText.textContent = "Ready";
});

maleBtn.addEventListener("click", () => {

  selectedCompanion = "Arjun";
  waitingForCommand = false;

  companionName.textContent = "Arjun";
  message.textContent = 'Say "Hey Arjun"';
  statusText.textContent = "Ready";
});

micBtn.addEventListener("click", () => {

  if (!recognition) {
    message.textContent =
      "Voice recognition is not supported in this browser.";
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

  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(text);

  speech.lang = "en-IN";
  speech.rate = 1;

  if (selectedCompanion === "Maya") {
    speech.pitch = 1.15;
  } else {
    speech.pitch = 0.9;
  }

  speech.onend = () => {

    if (waitingForCommand) {
      statusText.textContent = "Listening to you...";
      message.textContent = "I'm listening...";
    } else {
      statusText.textContent = "Ready";
    }
  };

  window.speechSynthesis.speak(speech);
}
