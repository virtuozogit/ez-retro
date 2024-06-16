const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true
    },
    gameUrl: {
        type: String,
    },
    image: {
        type: String,
    },
    core: {
        type: String
    }
})

// Super Mario Bros.
// EJS_player = "#game";
// EJS_core = "nes";
// EJS_gameName = "test";
// EJS_color = "#0064ff";
// EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
// EJS_gameUrl = "Super Mario Bros. (Europe).nes";
// EJS_gameUrl = "https://ia804700.us.archive.org/cors_get.php?path=/29/items/nointro.nes-headered/Super%20Mario%20Bros.%20%28Europe%29.7z";

module.exports = mongoose.model("game", gameSchema)
