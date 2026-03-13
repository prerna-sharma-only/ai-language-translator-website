const express = require("express");
const cors = require("cors");
const axios = require("axios");
const googleTTS = require("google-tts-api");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/translate", async (req, res) => {

    const { text, target } = req.body;

    try {

        const response = await axios.get(
            "https://translate.googleapis.com/translate_a/single",
            {
                params: {
                    client: "gtx",
                    sl: "auto",
                    tl: target,
                    dt: "t",
                    q: text
                }
            }
        );

        const translated = response.data[0][0][0];

        const audioUrl = googleTTS.getAudioUrl(translated, {
            lang: target,
            slow: false,
            host: "https://translate.google.com"
        });

        res.json({
            translated,
            audioUrl
        });

    } catch (err) {

        res.json({
            translated: "Translation failed",
            audioUrl: null
        });
    }
});

app.listen(5000, () => console.log("Server running"));