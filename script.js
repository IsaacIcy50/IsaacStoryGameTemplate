// GAME VARIABLES
let currentScene = "westWing";
let suspicion = 0;
let inventory = [];
let ventLoops = 0;
let gameOver = false;

// SEVEN LOCATIONS
// Every location uses title, character, text, choices.
const scenes = {
  westWing: {
    title: "The West Wing Storage Closet",
    character: "You — the Science Olympiad team member",
    text: "You are backed into the very back closet of the west wing. Through the wooden door slats, you hear the janitor's keys jingling in the hallway to your left. The whole team is relying on you. A rusted metal grate hangs loosely overhead. Behind a jar of paste, you spot an official Hall Pass.",
    choices: [
      {
        text: "Take the Hall Pass",
        action: function () {
          pickUpItem("Hall Pass");
        }
      },
      {
        text: "Bust the door open and run to the Main Hallway (+25 suspicion)",
        action: function () {
          updateSuspicion(25);
        },
        nextScene: "mainHallway"
      },
      {
        text: "Climb into the ceiling vent",
        nextScene: "ventilation"
      }
    ]
  },

  mainHallway: {
    title: "The Main Hallway",
    character: "You",
    text: "Green lockers line the long, wax-shined corridor. Fluorescent lights buzz overhead, and framed student art hangs on the walls. The front doors are guarded by Vice Principal Vance. Locker 104 is slightly ajar, and something inside catches your eye.",
    choices: [
      {
        text: "Check locker 104 for the Student ID Badge",
        action: function () {
          pickUpItem("Student ID Badge");
        }
      },
      {
        text: "Head toward the front Exit Doors",
        nextScene: "exitDoors"
      },
      {
        text: "Return to the West Wing Storage Closet",
        nextScene: "westWing"
      }
    ]
  },

  ventilation: {
    title: "The Ventilation Network",
    character: "You",
    text: "You crawl through a narrow, dark metal tube above the school ceiling. Dust floats through thin beams of light. Through a grate, you spot Mr. Henderson setting up tomorrow's chemistry demonstration in the Science Lab. Farther ahead, an exit hatch leads toward the Gymnasium Balcony.",
    choices: [
      {
        text: "Find the east wing exit hatch",
        nextScene: "gymBalcony"
      },
      {
        text: "Drop through the grate into the Science Lab (+10 suspicion)",
        action: function () {
          updateSuspicion(10);
        },
        nextScene: "scienceLab"
      },
      {
        text: "Keep crawling deeper into the vents",
        action: function () {
          ventLoops++;

          if (ventLoops >= 4) {
            finishEnding("secret");
          } else {
            messageDisplay.textContent =
              "You crawl deeper, but the tunnels look familiar. Vent loop " +
              ventLoops + " of 4. Find an exit before you get lost!";
          }
        }
      }
    ]
  },

  scienceLab: {
    title: "The Science Lab",
    character: "You",
    text: "Rows of black lab tables, Bunsen burners, and glass beakers fill the room. An aquarium bubbles quietly in the corner. Under a locked glass case rests the missing Science Olympiad trophy. The case needs an authorized Student ID Badge to release its lock.",
    choices: [
      {
        text: "Try to open the trophy case",
        action: getTrophy
      },
      {
        text: "Use the back exit to reach the Courtyard",
        nextScene: "courtyard"
      },
      {
        text: "Climb back into the ventilation network",
        nextScene: "ventilation"
      }
    ]
  },

  gymBalcony: {
    title: "The Gymnasium Balcony",
    character: "You",
    text: "You emerge onto a dusty metal catwalk overlooking the echoing gymnasium. Basketball practice is wrapping up below. The coaches are distracted by a scrimmage, leaving a clear route down the bleachers toward the front doors.",
    choices: [
      {
        text: "Descend the bleachers toward the Exit Doors",
        nextScene: "exitDoors"
      },
      {
        text: "Return to the Ventilation Network",
        nextScene: "ventilation"
      }
    ]
  },

  courtyard: {
    title: "The Courtyard",
    character: "You",
    text: "You enter an open-air quad surrounded by brick academic buildings. A fountain trickles in the center, and rose bushes have grown wild along the path. The main gates are chained shut, but the side gate near the bicycle racks appears unlatched.",
    choices: [
      {
        text: "Try to escape through the side gate",
        action: escapeSideGate
      },
      {
        text: "Return to the Science Lab",
        nextScene: "scienceLab"
      }
    ]
  },

  exitDoors: {
    title: "The Exit Doors",
    character: "Vice Principal Vance",
    text: "The heavy glass doors stand between you and freedom. Vice Principal Vance blocks the exit with a clipboard in hand. He looks directly at you. \"Hold right there, student. Where is your pass?\" You must decide whether to present your Hall Pass or turn back.",
    choices: [
      {
        text: "Present your Hall Pass and attempt to leave",
        action: attemptExit
      },
      {
        text: "Turn around and run back into the school",
        nextScene: "mainHallway"
      }
    ]
  }
};

// HTML ELEMENT REFERENCES
const sceneTitle = document.getElementById("scene-title");
const characterName = document.getElementById("character-name");
const sceneText = document.getElementById("scene-text");
const choicesContainer = document.getElementById("choices-container");
const healthDisplay = document.getElementById("health-display");
const inventoryDisplay = document.getElementById("inventory-display");
const messageDisplay = document.getElementById("message-display");
const restartButton = document.getElementById("restart-button");


// UPDATE SCENE

function updateScene(sceneName) {
  if (gameOver) return;

  currentScene = sceneName;
  const scene = scenes[sceneName];

  sceneTitle.textContent = scene.title;
  characterName.textContent = scene.character;
  sceneText.textContent = scene.text;

  choicesContainer.replaceChildren();
  messageDisplay.textContent = "";

  // Loop through every choice and create its button.
  scene.choices.forEach(function (choice) {
    const button = document.createElement("button");
    button.textContent = choice.text;

    button.addEventListener("click", function () {
      if (gameOver) return;

      if (choice.action) {
        choice.action();
      }

      // An action can end the game or change the scene itself.
      if (choice.nextScene && !gameOver) {
        updateScene(choice.nextScene);
      }
    });

    choicesContainer.appendChild(button);
  });
}


// NUMERICAL STAT: SUSPICION

function updateSuspicion(amount) {
  suspicion = Math.max(0, Math.min(100, suspicion + amount));
  healthDisplay.textContent = suspicion;

  if (suspicion >= 75) {
    messageDisplay.textContent =
      "WARNING: Suspicion is high! The school staff are becoming alert.";
  } else {
    messageDisplay.textContent =
      "Suspicion increased to " + suspicion + "/100.";
  }
}


// INVENTORY

function updateInventory() {
  inventoryDisplay.textContent =
    inventory.length > 0 ? inventory.join(", ") : "Empty";
}

function pickUpItem(itemName) {
  if (inventory.includes(itemName)) {
    messageDisplay.textContent =
      "You already have the " + itemName + ".";
    return;
  }

  inventory.push(itemName);
  updateInventory();

  messageDisplay.textContent = "Collected: " + itemName + "!";
}


// CONDITIONAL: GET THE TROPHY
// The Student ID Badge unlocks the case.

function getTrophy() {
  if (!inventory.includes("Student ID Badge")) {
    messageDisplay.textContent =
      "The glass case is locked. Find the Student ID Badge in locker 104 first.";
    return;
  }

  if (inventory.includes("Science Olympiad Trophy")) {
    messageDisplay.textContent =
      "You already have the Science Olympiad trophy.";
    return;
  }

  pickUpItem("Science Olympiad Trophy");
  messageDisplay.textContent =
    "The badge releases the case lock. You recover the missing Science Olympiad trophy!";
}

// CONDITIONAL: EXIT THROUGH SECURITY
// Hall Pass + trophy = true ending.
// No Hall Pass = bad ending.
function attemptExit() {
  if (!inventory.includes("Hall Pass")) {
    finishEnding("bad");
    return;
  }

  if (!inventory.includes("Science Olympiad Trophy")) {
    messageDisplay.textContent =
      "Vance checks your pass and lets you approach the doors, but you still need to recover the missing Science Olympiad trophy. Get back inside and find it!";
    return;
  }

  finishEnding("true");
}

// CONDITIONAL: SIDE GATE
function escapeSideGate() {
  if (
    inventory.includes("Hall Pass") &&
    inventory.includes("Science Olympiad Trophy")
  ) {
    finishEnding("true");
  } else {
    messageDisplay.textContent =
      "You reach the side gate, but you still need both the Hall Pass and the missing trophy to complete your mission. Return to the building and finish the job.";
  }
}

// THREE ENDINGS
// Endings are displayed dynamically and are
// not additional location entries in scenes.
function finishEnding(ending) {
  gameOver = true;
  choicesContainer.replaceChildren();
  messageDisplay.textContent = "";

  if (ending === "true") {
    sceneTitle.textContent = "Ending 1: Clean Getaway";
    characterName.textContent = "Mission Accomplished";
    sceneText.textContent =
      "You breeze past the front doors with your valid Hall Pass. Vice Principal Vance raises an eyebrow, sighs, and waves you through. \"Just make sure this is turned in tomorrow,\" he mutters. The Science Olympiad trophy is safely tucked in your backpack, and your team's project is saved. The cool evening air hits your face as you walk home under the twilight sky. You pulled off the ultimate after-school escape!";
  } else if (ending === "bad") {
    sceneTitle.textContent = "Ending 2: Caught in the Act";
    characterName.textContent = "Vice Principal Vance";
    sceneText =
      "\"Nice try,\" Vance says, grabbing you by the shoulder before you can escape. You tried to leave without a Hall Pass, and now you're caught. The next morning, your name is announced over the PA system, and you spend the entire week scrubbing the cafeteria floors. The trophy goes back on its shelf, and your reputation as a master escape artist is ruined.";
  } else {
    sceneTitle.textContent = "Ending 3: Lost in the Metal Maze";
    characterName.textContent = "The School's New Urban Legend";
    sceneText =
      "You take one wrong turn too many in the dark metal tubes above the school. Hours pass, and the school lights click off one by one. With no way down and no way out, you become a permanent urban legend of the school: the ghost who lives in the air vents.";
  }

  const restartButtonEnding = document.createElement("button");
  restartButtonEnding.textContent = "Play Again";
  restartButtonEnding.addEventListener("click", restartGame);
  choicesContainer.appendChild(restartButtonEnding);
}

// RESTART
function restartGame() {
  currentScene = "westWing";
  suspicion = 0;
  inventory = [];
  ventLoops = 0;
  gameOver = false;

  updateSuspicion(0);
  updateInventory();
  updateScene(currentScene);
}

restartButton.addEventListener("click", restartGame);

// START THE GAME
updateSuspicion(0);
updateInventory();
updateScene(currentScene);