let client;
const { SlippiGame, characters
} = require("@slippi/slippi-js");
const chokidar = require("chokidar");
const _ = require("lodash");
const os = require("os");
const fs = require('fs');
const ini = require('ini')
const path = require('path')

// TODO: Add more stages.
const stages = {
  3: {
    "stageKey": "pokemonstadium",
    "stageName": "Pokemon Stadium"
  },
  28: {
    "stageKey": "dreamland",
    "stageName": "Dreamland"
  },
  8: {
    "stageKey": "yoshisstory",
    "stageName": "Yoshi's Story"
  },
  2: {
    "stageKey": "fountainofdreams",
    "stageName": "Fountain of Dreams"
  },
  31: {
    "stageKey": "battlefield",
    "stageName": "Battlefield"
  },
  32: {
    "stageKey": "finaldestination",
    "stageName": "Final Destination"
  },
};

// Used if a stage is not defined in stages dict.
const unknown_stage = {
  "stageKey": "pokefloats",
  "stageName": "Unknown Stage"
}

function getStage(stageId) {
  const result = stages[stageId];
  return (result === undefined) ? unknown_stage : result;
}

function getStageName(stageId) {
  const stage = getStage(stageId);
  return stage[
    "stageName"
  ];
}

function main() {
  // Apply config
  try {
    var config = ini.decode(fs.readFileSync(path.join(__dirname,
      "../.config/config.ini"), 'utf-8'));
    var debug = config.display.show_debug_console;
    if (debug == 0) {
      console.log = function () { }
    } else {
      console.log("Debug mode on, showing log")
    }
    var listenPath = os.homedir() + config.directories.replay_directory_from_home + "\\2024-10"; // TODO: Get value from UTC date
    client = require('discord-rich-presence')(config.discord.application_id);
    console.log(`Using Application ID ${config.discord.application_id
      }`);
  } catch (error) {
    console.log("No config found or config error, using defaults...");
    var listenPath = os.homedir() + "\\Documents\\Slippi\\2024-10"; // TODO: Get value from UTC date
    client = require('discord-rich-presence')('1125092736404570123');
  }


  let mode, stageId, startTime, endTime, gameEnd;
  gameEnd = true;

  console.log(`Listening for game at: ${listenPath
    }`);

  const watcher = chokidar.watch(listenPath,
    {
      ignored: "!*.slp", // TODO: This doesn't work. Use regex?
      depth: 0,
      persistent: true,
      usePolling: true,
      ignoreInitial: true,
    });

  const gameByPath = {};
  setInterval(() => {
    if (gameEnd) { //!inGame
      client.updatePresence({
        state: "In Lobby",
        largeImageKey: "notingame",
        largeImageText: "In Lobby",
        instance: false,
      });
      return;
    }

    const stage = getStage(stageId);
    const stageKey = stage["stageKey"];
    const stageName = stage["stageName"];

    client.updatePresence({
      state: "Playing on " + stageName,
      details: mode,
      largeImageKey: stageKey,
      largeImageText: stageName,
      startTimestamp: startTime,
      //endTimestamp: endTime, TODO
      instance: true,
    });
  },
    15e3);

  watcher.on("change", (path) => {

    let gameState, settings, stats, frames, latestFrame; //gameEnd;
    try {
      let game = _.get(gameByPath,
        [path,
          "game"
        ]);
      if (!game) {
        console.log(`New file at: ${path
          }`);
        // Make sure to enable `processOnTheFly` to get updated stats as the game progresses
        game = new SlippiGame(path,
          {
            processOnTheFly: true
          });
        gameByPath[path
        ] = {
          game: game,
          state: {
            settings: null,
            detectedPunishes: {},
          },
        };
      }

      gameState = _.get(gameByPath,
        [path,
          "state"
        ]);

      settings = game.getSettings();

      gameEnd = game.getGameEnd();
    } catch (err) {
      console.log(err);
      return;
    }

    if (!gameState.settings && settings) {
      startTime = Date.now();
      endTime = startTime + 480;
      console.log(settings);
      mode = settings.matchInfo.matchId;
      mode = mode.slice(5, mode.search("-"));
      mode = mode.charAt(0).toUpperCase() + mode.slice(1);
      inGame = true;
      console.log(`[Game Start
            ] New game has started`);
      stageId = settings.stageId;
      gameState.settings = settings;
    }
  });
}


module.exports = { getStageName, main }
