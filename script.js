
// GAME VARIABLES
let currentScene = "westWing";
let suspicion = 0;
let inventory = [];
let ventLoops = 0;
let gameOver = true;
let onHomeScreen = true;

// SEVEN LOCATIONS
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

// HOME SCREEN
function showHomeScreen() {
  onHomeScreen = true;

  sceneTitle.textContent = "The Great School Escape";
  characterName.textContent = "Science Olympiad Mission";
  sceneText.textContent =
    "The missing Science Olympiad trophy must be recovered. " +
    "Find your Hall Pass, retrieve the trophy, and escape " +
    "without raising too much suspicion.";

  messageDisplay.textContent = "";
  choicesContainer.replaceChildren();

  const startButton = document.createElement("button");

  if (gameOver) {
    startButton.textContent = "Start Game";
    startButton.addEventListener("click", restartGame);
  } else {
    startButton.textContent = "Resume Game";
    startButton.addEventListener("click", function () {
      updateScene(currentScene);
    });
  }

  choicesContainer.appendChild(startButton);

  const resetButton = document.createElement("button");
  resetButton.textContent = "Go back to home page";

  resetButton.addEventListener("click", function () {
    window.location.assign("./index.html");
  });

  choicesContainer.appendChild(resetButton);
}

// UPDATE SCENE
function updateScene(sceneName) {
  if (gameOver) return;

  if (!scenes[sceneName]) {
    messageDisplay.textContent = "Error: This location does not exist.";
    return;
  }

  currentScene = sceneName;
  onHomeScreen = false;

  const scene = scenes[sceneName];

  sceneTitle.textContent = scene.title;
  characterName.textContent = scene.character;
  sceneText.textContent = scene.text;

  choicesContainer.replaceChildren();
  messageDisplay.textContent = "";

  scene.choices.forEach(function (choice) {
    const button = document.createElement("button");
    button.textContent = choice.text;

    button.addEventListener("click", function () {
      if (gameOver || onHomeScreen) return;

      if (choice.action) {
        choice.action();
      }

      if (choice.nextScene && !gameOver) {
        updateScene(choice.nextScene);
      }
    });

    choicesContainer.appendChild(button);
  });

  const homeButton = document.createElement("button");
  homeButton.textContent = "Home Screen";
  homeButton.addEventListener("click", showHomeScreen);
  choicesContainer.appendChild(homeButton);
}

// SUSPICION
function updateSuspicion(amount) {
  suspicion = Math.max(0, Math.min(100, suspicion + amount));

  if (healthDisplay) {
    healthDisplay.textContent = suspicion;
  }

  if (suspicion >= 100) {
    finishEnding("caught");
  } else if (suspicion >= 75) {
    messageDisplay.textContent =
      "WARNING: Suspicion is high! The school staff are becoming alert.";
  } else if (amount !== 0) {
    messageDisplay.textContent =
      "Suspicion increased to " + suspicion + "/100.";
  } else if (healthDisplay) {
    healthDisplay.textContent = suspicion;
  }
}

// INVENTORY
function updateInventory() {
  if (inventoryDisplay) {
    inventoryDisplay.textContent =
      inventory.length > 0 ? inventory.join(", ") : "Empty";
  }
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

// GET THE TROPHY
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

// EXIT THROUGH SECURITY
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

// SIDE GATE
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

// ENDINGS
function finishEnding(ending) {
  gameOver = true;
  onHomeScreen = false;

  choicesContainer.replaceChildren();
  messageDisplay.textContent = "";

  if (ending === "true") {
    sceneTitle.textContent = "Ending 1: Clean Getaway";
    characterName.textContent = "Mission Accomplished";
    sceneText.textContent =
      "You breeze past the front doors with your valid Hall Pass. " +
      "Vice Principal Vance raises an eyebrow, sighs, and waves you through. " +
      "\"Just make sure this is turned in tomorrow,\" he mutters. " +
      "The Science Olympiad trophy is safely tucked in your backpack, " +
      "and your team's project is saved. The cool evening air hits your " +
      "face as you walk home under the twilight sky. You pulled off " +
      "the ultimate after-school escape!";

  } else if (ending === "bad") {
    sceneTitle.textContent = "Ending 2: Caught in the Act";
    characterName.textContent = "Vice Principal Vance";
    sceneText.textContent =
      "\"Nice try,\" Vance says, stopping you before you can escape. " +
      "You tried to leave without a Hall Pass, and now you're caught. " +
      "The next morning, your name is announced over the PA system, " +
      "and you spend the entire week scrubbing the cafeteria floors. " +
      "The trophy goes back on its shelf, and your reputation as a " +
      "master escape artist is ruined.";

  } else if (ending === "caught") {
    sceneTitle.textContent = "Ending 3: Busted!";
    characterName.textContent = "Vice Principal Vance";
    sceneText.textContent =
      "Your suspicion level has reached its maximum. The school staff " +
      "have figured out what you are doing, and Vice Principal Vance " +
      "catches you before you can finish your mission. Your escape " +
      "attempt is over!";

  } else {
    sceneTitle.textContent = "Ending 4: Lost in the Metal Maze";
    characterName.textContent = "The School's New Urban Legend";
    sceneText.textContent =
      "You take one wrong turn too many in the dark metal tubes above " +
      "the school. Hours pass, and the school lights click off one by " +
      "one. With no way down and no way out, you become a permanent " +
      "urban legend of the school: the ghost who lives in the air vents.";
  }

  const playAgainButton = document.createElement("button");
  playAgainButton.textContent = "Play Again";
  playAgainButton.addEventListener("click", restartGame);
  choicesContainer.appendChild(playAgainButton);

  const homeButton = document.createElement("button");
  homeButton.textContent = "Home Screen";
  homeButton.addEventListener("click", showHomeScreen);
  choicesContainer.appendChild(homeButton);
}

// RESTART GAME
function restartGame() {
  currentScene = "westWing";
  suspicion = 0;
  inventory = [];
  ventLoops = 0;
  gameOver = false;
  onHomeScreen = false;

  updateSuspicion(0);
  updateInventory();
  updateScene(currentScene);
}

// EXISTING HTML RESTART BUTTON
if (restartButton) {
  restartButton.addEventListener("click", restartGame);
}

// START AT HOME SCREEN
updateSuspicion(0);
updateInventory();
showHomeScreen();
