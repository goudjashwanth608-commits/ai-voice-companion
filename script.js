const companionName = document.getElementById("companionName");
const message = document.getElementById("message");
const statusText = document.getElementById("statusText");

const femaleBtn = document.getElementById("femaleBtn");
const maleBtn = document.getElementById("maleBtn");
const micBtn = document.getElementById("micBtn");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const nameInput = document.getElementById("nameInput");

const settingsFemale =
  document.getElementById("settingsFemale");

const settingsMale =
  document.getElementById("settingsMale");

const voiceSelect =
  document.getElementById("voiceSelect");

const languageSelect =
  document.getElementById("languageSelect");

const speedRange =
  document.getElementById("speedRange");

const pitchRange =
  document.getElementById("pitchRange");

const speedValue =
  document.getElementById("speedValue");

const pitchValue =
  document.getElementById("pitchValue");

const wakePreview =
  document.getElementById("wakePreview");

const saveSettings =
  document.getElementById("saveSettings");


/* =========================
   DEFAULT SETTINGS
========================= */

let settings = {

  name: "Maya",

  gender: "female",

  language: "en-IN",

  voiceName: "",

  speed: 1,

  pitch: 1

};


/* =========================
   LOAD SAVED SETTINGS
========================= */

const savedSettings =
  localStorage.getItem("companionSettings");

if (savedSettings) {

  try {

    settings = {
      ...settings,
      ...JSON.parse(savedSettings)
    };

  } catch (error) {

    console.log("Could not load settings.");

  }

}


/* =========================
   SPEECH RECOGNITION
========================= */

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let recognition = null;

let wakeListening = true;

let waitingForCommand = false;


if (SpeechRecognition) {

  recognition = new SpeechRecognition();

  recognition.continuous = true;

  recognition.interimResults = false;

  recognition.lang = settings.language;


  recognition.onstart = () => {

    if (!waitingForCommand) {

      statusText.textContent =
        `Listening for "Hey ${settings.name}"...`;

    }

  };


  recognition.onresult = (event) => {

    const text =
      event.results[
        event.results.length - 1
      ][0]
      .transcript
      .toLowerCase()
      .trim();


    console.log("Heard:", text);


    const wakeName =
      settings.name.toLowerCase();


    /* Wake name */

    if (
      !waitingForCommand &&
      (
        text.includes(`hey ${wakeName}`) ||
        text.includes(wakeName)
      )
    ) {

      activateCompanion();

      return;

    }


    /* User command */

    if (waitingForCommand) {

      handleCommand(text);

    }

  };


  recognition.onerror = (event) => {

    console.log(
      "Recognition error:",
      event.error
    );


    if (event.error === "not-allowed") {

      statusText.textContent =
        "Microphone permission required";

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

          console.log(
            "Recognition already running."
          );

        }

      }, 500);

    }

  };

}


/* =========================
   ACTIVATE COMPANION
========================= */

function activateCompanion() {

  waitingForCommand = true;

  statusText.textContent = "Active";

  message.textContent =
    `Yes, I'm here. What do you need?`;

  speak(
    `Yes, I'm here. What do you need?`
  );

}


/* =========================
   HANDLE COMMAND
========================= */

function handleCommand(command) {

  waitingForCommand = false;

  statusText.textContent =
    "Thinking...";

  message.textContent =
    command;


  let response = "";


  if (
    command.includes("hello") ||
    command.includes("hi") ||
    command.includes("hey")
  ) {

    response =
      `Hello! I'm ${settings.name}. Nice to talk with you.`;

  }

  else if (
    command.includes("how are you")
  ) {

    response =
      "I'm doing great! I'm here and ready to talk with you.";

  }

  else if (
    command.includes("your name")
  ) {

    response =
      `My name is ${settings.name}.`;

  }

  else if (
    command.includes("thank you") ||
    command.includes("thanks")
  ) {

    response =
      "You're welcome!";

  }

  else if (
    command.includes("good morning")
  ) {

    response =
      "Good morning! I hope you have a wonderful day.";

  }

  else {

    response =
      `I heard you say ${command}. The real AI brain will answer this after we connect the AI backend.`;

  }


  message.textContent =
    response;

  statusText.textContent =
    "Speaking...";

  speak(response);

}


/* =========================
   TEXT TO SPEECH
========================= */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  window.speechSynthesis.cancel();


  const speech =
    new SpeechSynthesisUtterance(text);


  speech.lang =
    settings.language;


  speech.rate =
    Number(settings.speed);


  speech.pitch =
    Number(settings.pitch);


  const voices =
    window.speechSynthesis.getVoices();


  const selectedVoice =
    voices.find(
      voice =>
        voice.name === settings.voiceName
    );


  if (selectedVoice) {

    speech.voice =
      selectedVoice;

  }


  speech.onend = () => {

    if (waitingForCommand) {

      statusText.textContent =
        "Listening to you...";

      message.textContent =
        "I'm listening...";

    } else {

      statusText.textContent =
        "Ready";

    }

  };


  window.speechSynthesis.speak(
    speech
  );

}


/* =========================
   LOAD VOICES
========================= */

function loadVoices() {

  const voices =
    window.speechSynthesis.getVoices();


  voiceSelect.innerHTML = "";


  if (voices.length === 0) {

    const option =
      document.createElement("option");

    option.textContent =
      "Default device voice";

    option.value = "";

    voiceSelect.appendChild(option);

    return;

  }


  voices.forEach(voice => {

    const option =
      document.createElement("option");


    option.value =
      voice.name;


    option.textContent =
      `${voice.name} (${voice.lang})`;


    voiceSelect.appendChild(option);

  });


  if (settings.voiceName) {

    voiceSelect.value =
      settings.voiceName;

  }

}


window.speechSynthesis.onvoiceschanged =
  loadVoices;

loadVoices();


/* =========================
   SETTINGS UI
========================= */

function updateSettingsUI() {

  nameInput.value =
    settings.name;


  languageSelect.value =
    settings.language;


  speedRange.value =
    settings.speed;


  pitchRange.value =
    settings.pitch;


  speedValue.textContent =
    Number(settings.speed).toFixed(1);


  pitchValue.textContent =
    Number(settings.pitch).toFixed(1);


  wakePreview.textContent =
    `Say "Hey ${settings.name}"`;


  companionName.textContent =
    settings.name;


  message.textContent =
    `Say "Hey ${settings.name}"`;


  settingsFemale.classList.toggle(
    "active",
    settings.gender === "female"
  );


  settingsMale.classList.toggle(
    "active",
    settings.gender === "male"
  );


  femaleBtn.classList.toggle(
    "active",
    settings.gender === "female"
  );


  maleBtn.classList.toggle(
    "active",
    settings.gender === "male"
  );

}


updateSettingsUI();


/* =========================
   OPEN SETTINGS
========================= */

settingsBtn.addEventListener(
  "click",
  () => {

    settingsPanel.classList.add(
      "active"
    );

    loadVoices();

    updateSettingsUI();

  }
);


/* =========================
   CLOSE SETTINGS
========================= */

closeSettings.addEventListener(
  "click",
  () => {

    settingsPanel.classList.remove(
      "active"
    );

  }
);


/* =========================
   FEMALE
========================= */

settingsFemale.addEventListener(
  "click",
  () => {

    settings.gender =
      "female";

    updateSettingsUI();

  }
);


/* =========================
   MALE
========================= */

settingsMale.addEventListener(
  "click",
  () => {

    settings.gender =
      "male";

    updateSettingsUI();

  }
);


/* =========================
   SPEED
========================= */

speedRange.addEventListener(
  "input",
  () => {

    speedValue.textContent =
      Number(speedRange.value)
      .toFixed(1);

  }
);


/* =========================
   PITCH
========================= */

pitchRange.addEventListener(
  "input",
  () => {

    pitchValue.textContent =
      Number(pitchRange.value)
      .toFixed(1);

  }
);


/* =========================
   SAVE SETTINGS
========================= */

saveSettings.addEventListener(
  "click",
  () => {

    const newName =
      nameInput.value.trim();


    if (newName.length > 0) {

      settings.name =
        newName;

    }


    settings.language =
      languageSelect.value;


    settings.voiceName =
      voiceSelect.value;


    settings.speed =
      Number(speedRange.value);


    settings.pitch =
      Number(pitchRange.value);


    localStorage.setItem(
      "companionSettings",
      JSON.stringify(settings)
    );


    if (recognition) {

      recognition.lang =
        settings.language;

    }


    updateSettingsUI();


    settingsPanel.classList.remove(
      "active"
    );


    statusText.textContent =
      "Settings saved";


    message.textContent =
      `I'm ${settings.name}. Say "Hey ${settings.name}"`;


    speak(
      `Settings saved. I'm ${settings.name}.`
    );

  }
);


/* =========================
   MAIN FEMALE BUTTON
========================= */

femaleBtn.addEventListener(
  "click",
  () => {

    settings.gender =
      "female";

    updateSettingsUI();

  }
);


/* =========================
   MAIN MALE BUTTON
========================= */

maleBtn.addEventListener(
  "click",
  () => {

    settings.gender =
      "male";

    updateSettingsUI();

  }
);


/* =========================
   MICROPHONE BUTTON
========================= */

micBtn.addEventListener(
  "click",
  () => {

    if (!recognition) {

      message.textContent =
        "Voice recognition is not supported in this browser.";

      return;

    }


    wakeListening = true;


    try {

      recognition.start();

    } catch (error) {

      console.log(
        "Already listening."
      );

    }

  }
);
