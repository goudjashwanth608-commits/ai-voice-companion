/* =========================
   ELEMENTS
========================= */

const companionName =
  document.getElementById("companionName");

const message =
  document.getElementById("message");

const statusText =
  document.getElementById("statusText");

const statusDot =
  document.getElementById("statusDot");

const orb =
  document.getElementById("orb");

const chatBox =
  document.getElementById("chatBox");

const chatInput =
  document.getElementById("chatInput");

const sendBtn =
  document.getElementById("sendBtn");

const micBtn =
  document.getElementById("micBtn");

const settingsBtn =
  document.getElementById("settingsBtn");

const settingsPanel =
  document.getElementById("settingsPanel");

const closeSettings =
  document.getElementById("closeSettings");

const nameInput =
  document.getElementById("nameInput");

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
   SETTINGS
========================= */

let settings = {

  name: "Maya",

  gender: "female",

  language: "en-IN",

  voiceName: "",

  speed: 1,

  pitch: 1

};


const savedSettings =
  localStorage.getItem(
    "companionSettings"
  );


if (savedSettings) {

  try {

    settings = {
      ...settings,
      ...JSON.parse(savedSettings)
    };

  } catch (error) {

    console.log(
      "Could not load settings."
    );

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

let voiceConversation = false;


if (SpeechRecognition) {

  recognition =
    new SpeechRecognition();

  recognition.continuous = true;

  recognition.interimResults = false;

  recognition.lang =
    settings.language;


  recognition.onstart = () => {

    if (!waitingForCommand) {

      setState(
        "ready",
        `Listening for "Hey ${settings.name}"...`
      );

    }

  };


  recognition.onresult =
    (event) => {

      const result =
        event.results[
          event.results.length - 1
        ];

      const text =
        result[0]
          .transcript
          .toLowerCase()
          .trim();


      console.log(
        "Heard:",
        text
      );


      /*
       * If we are waiting for a command
       */

      if (waitingForCommand) {

        waitingForCommand = false;

        addMessage(
          "user",
          text
        );

        askAI(
          text,
          true
        );

        return;

      }


      /*
       * Wake name detection
       */

      const wakeName =
        settings.name
          .toLowerCase()
          .trim();


      if (
        text.includes(
          `hey ${wakeName}`
        ) ||
        text.includes(wakeName)
      ) {

        activateCompanion();

      }

    };


  recognition.onerror =
    (event) => {

      console.log(
        "Recognition error:",
        event.error
      );


      if (
        event.error ===
        "not-allowed"
      ) {

        setState(
          "error",
          "Microphone permission required"
        );

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
   STATE
========================= */

function setState(
  state,
  text
) {

  statusText.textContent =
    text;


  orb.classList.remove(
    "listening",
    "thinking",
    "speaking",
    "error"
  );


  if (state) {

    orb.classList.add(
      state
    );

  }


  if (state === "error") {

    statusDot.style.background =
      "#ff5c7c";

  }

  else if (
    state === "thinking"
  ) {

    statusDot.style.background =
      "#ffd166";

  }

  else if (
    state === "speaking"
  ) {

    statusDot.style.background =
      "#8d9aff";

  }

  else {

    statusDot.style.background =
      "#55ffb0";

  }

}


/* =========================
   ACTIVATE COMPANION
========================= */

function activateCompanion() {

  waitingForCommand = true;

  voiceConversation = true;

  setState(
    "listening",
    "Listening..."
  );


  message.textContent =
    "I'm listening...";


  speak(
    `Yes, I'm here. What do you need?`
  );

}


/* =========================
   ASK AI
========================= */

async function askAI(
  userMessage,
  shouldSpeak
) {

  setState(
    "thinking",
    "Thinking..."
  );


  message.textContent =
    "Thinking...";


  try {

    const response =
      await fetch(
        "/api/chat",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            message:
              userMessage,

            companionName:
              settings.name,

            gender:
              settings.gender,

            language:
              settings.language

          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "AI request failed"
      );

    }


    const answer =
      data.answer ||
      "Sorry, I couldn't answer that.";


    /*
     * AI reply appears in chat
     */

    addMessage(
      "ai",
      answer
    );


    message.textContent =
      answer;


    /*
     * Voice request:
     * speak the answer
     */

    if (shouldSpeak) {

      speak(answer);

    }

    else {

      setState(
        "ready",
        "Ready"
      );

    }


  } catch (error) {

    console.error(
      "AI error:",
      error
    );


    const errorMessage =
      "Sorry, I couldn't connect to the AI right now.";


    addMessage(
      "ai",
      errorMessage
    );


    message.textContent =
      errorMessage;


    setState(
      "error",
      "Connection error"
    );


    if (shouldSpeak) {

      speak(errorMessage);

    }

  }

}


/* =========================
   CHAT MESSAGE
========================= */

function addMessage(
  sender,
  text
) {

  const welcome =
    chatBox.querySelector(
      ".welcome-message"
    );


  if (welcome) {

    welcome.remove();

  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.className =
    `chat-message ${sender}`;


  const bubble =
    document.createElement(
      "div"
    );


  bubble.className =
    "message-bubble";


  bubble.textContent =
    text;


  wrapper.appendChild(
    bubble
  );


  chatBox.appendChild(
    wrapper
  );


  chatBox.scrollTop =
    chatBox.scrollHeight;

}


/* =========================
   TEXT CHAT
========================= */

async function sendChatMessage() {

  const text =
    chatInput.value.trim();


  if (!text) {

    return;

  }


  chatInput.value = "";


  addMessage(
    "user",
    text
  );


  /*
   * Typed messages:
   * AI replies in chat only.
   */

  await askAI(
    text,
    false
  );

}


/* =========================
   SEND BUTTON
========================= */

sendBtn.addEventListener(
  "click",
  sendChatMessage
);


/* =========================
   ENTER KEY
========================= */

chatInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "Enter"
    ) {

      sendChatMessage();

    }

  }
);


/* =========================
   VOICE BUTTON
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

    waitingForCommand = true;

    voiceConversation = true;


    setState(
      "listening",
      "Listening..."
    );


    message.textContent =
      "I'm listening...";


    try {

      recognition.start();

    } catch (error) {

      console.log(
        "Recognition already running."
      );

    }

  }
);


/* =========================
   TEXT TO SPEECH
========================= */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    console.log(
      "Speech synthesis not supported."
    );

    return;

  }


  window.speechSynthesis.cancel();


  const speech =
    new SpeechSynthesisUtterance(
      text
    );


  speech.lang =
    settings.language;


  speech.rate =
    Number(settings.speed);


  speech.pitch =
    Number(settings.pitch);


  const voices =
    window.speechSynthesis
      .getVoices();


  const selectedVoice =
    voices.find(
      voice =>
        voice.name ===
        settings.voiceName
    );


  if (selectedVoice) {

    speech.voice =
      selectedVoice;

  }


  setState(
    "speaking",
    "Speaking..."
  );


  speech.onend = () => {

    setState(
      "ready",
      "Ready"
    );


    message.textContent =
      `Say "Hey ${settings.name}"`;

  };


  speech.onerror = () => {

    setState(
      "error",
      "Voice error"
    );

  };


  window.speechSynthesis
    .speak(speech);

}


/* =========================
   VOICES
========================= */

function loadVoices() {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  const voices =
    window.speechSynthesis
      .getVoices();


  voiceSelect.innerHTML = "";


  if (
    voices.length === 0
  ) {

    const option =
      document.createElement(
        "option"
      );


    option.value = "";

    option.textContent =
      "Default device voice";


    voiceSelect.appendChild(
      option
    );


    return;

  }


  voices.forEach(
    voice => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        voice.name;


      option.textContent =
        `${voice.name} (${voice.lang})`;


      voiceSelect.appendChild(
        option
      );

    }
  );


  if (
    settings.voiceName
  ) {

    voiceSelect.value =
      settings.voiceName;

  }

}


if (
  "speechSynthesis"
  in window
) {

  window.speechSynthesis
    .onvoiceschanged =
    loadVoices;

}


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
    Number(settings.speed)
      .toFixed(1);


  pitchValue.textContent =
    Number(settings.pitch)
      .toFixed(1);


  wakePreview.textContent =
    `Say "Hey ${settings.name}"`;


  companionName.textContent =
    settings.name;


  message.textContent =
    `Say "Hey ${settings.name}"`;


  settingsFemale.classList.toggle(
    "active",
    settings.gender ===
      "female"
  );


  settingsMale.classList.toggle(
    "active",
    settings.gender ===
      "male"
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
      Number(
        speedRange.value
      ).toFixed(1);

  }
);


/* =========================
   PITCH
========================= */

pitchRange.addEventListener(
  "input",
  () => {

    pitchValue.textContent =
      Number(
        pitchRange.value
      ).toFixed(1);

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


    if (
      newName.length > 0
    ) {

      settings.name =
        newName;

    }


    settings.language =
      languageSelect.value;


    settings.voiceName =
      voiceSelect.value;


    settings.speed =
      Number(
        speedRange.value
      );


    settings.pitch =
      Number(
        pitchRange.value
      );


    localStorage.setItem(
      "companionSettings",
      JSON.stringify(
        settings
      )
    );


    if (recognition) {

      recognition.lang =
        settings.language;

    }


    updateSettingsUI();


    settingsPanel.classList.remove(
      "active"
    );


    setState(
      "ready",
      "Settings saved"
    );


    message.textContent =
      `I'm ${settings.name}. Say "Hey ${settings.name}"`;


    /*
     * Settings confirmation is spoken.
     */

    speak(
      `Settings saved. I'm ${settings.name}.`
    );

  }
);
