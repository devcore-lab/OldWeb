const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get("/api/archive", async (req, res) => {

    const site = (req.query.site || "").trim();
    const year = (req.query.year || "").trim();

    if (!site || !year) {
        return res.json({
            success: false,
            message: "Website unavailable."
        });
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {

        controller.abort();

    }, 10000);

    try {

        const api =
            `https://archive.org/wayback/available?url=${encodeURIComponent(site)}&timestamp=${year}0101000000`;

        const response = await fetch(api, {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {

            return res.json({
                success: false,
                message: "Website unavailable."
            });

        }

        const data = await response.json();

        const snapshot =
            data.archived_snapshots &&
            data.archived_snapshots.closest;

        if (!snapshot || !snapshot.available) {

            return res.json({
                success: false,
                message: "Website unavailable."
            });

        }

        res.json({

            success: true,

            url: snapshot.url,

            timestamp: snapshot.timestamp

        });

    }
    catch {

        clearTimeout(timeout);

        res.json({

            success: false,

            message: "Website unavailable."

        });

    }

});

app.get("*", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

app.listen(PORT, () => {

    console.log("OldWeb running on port " + PORT);

});
