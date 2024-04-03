const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

// MongoDB 연결
mongoose.connect("mongodb://localhost:27017/ainfras");

// Mongoose 스키마 정의
const Schema = mongoose.Schema;
const ItemSchema = new Schema(
    {
        payload: String,
        created_at: Date,
        status: String,
    },
    { collection: "2024/04/01" }
);

const Item = mongoose.model("Item", ItemSchema);

app.get("/", async (req, res) => {
    const items = await Item.find({
        created_at: {
            $gte: new Date("2024-04-03T00:00:00Z"),
            $lte: new Date("2024-04-03T01:40:00Z"),
        },
    }).sort({ created_at: -1 });
    //.limit(40); // 데이터를 최신 날짜 순으로 정렬

    // 각 status 값의 갯수를 세기 위한 객체 생성
    let statusCounts = {
        anomaly: 0,
        normal: 0,
    };

    // 각 아이템의 status 값에 따라 count 증가
    items.forEach((item) => {
        if (item.status === "anomaly") {
            statusCounts.anomaly++;
        } else if (item.status === "normal") {
            statusCounts.normal++;
        }
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AINFRAS-SECURITY</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
            body {
                background-color: #f3f4f6;
                color: #1a202c;
                font-family: 'Roboto', sans-serif;
            }
            .logo {
                font-size: 1rem;
                font-weight: 900;
            }
            .subtitle {
                font-size: 1.5rem;
                font-weight: 700;
                color: #2d3748;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                margin-right: 5px;
                position: relative;
                top: 3px;
            }
            .status-dot.anomaly {
                background-color: #f56565;
            }
            .status-dot.normal {
                background-color: #48bb78;
            }
            .details-content {
                max-width: 500px;
                overflow-wrap: break-word;
            }
            .content-container {
                transition: max-height 0.5s;
                overflow: hidden;
            }
            .content-container.hidden {
                max-height: 0;
            }
        </style>
    </head>
    <body>
        <div class="container mx-auto px-4 py-8">
            <h3 class="logo mb-5">AINFRAS-SECURITY</h3>
            <h2 class="subtitle text-center mb-5">Server Log Analysis Results</h2>
            <div class="flex justify-between items-center mb-10">
                <div class="flex-grow"></div>
                <div class="text-right">
                    <p class="text-sm">
                        <span class="status-dot anomaly"></span>${
                            statusCounts.anomaly
                        } Anomaly
                    </p>
                    <p class="text-sm">
                        <span class="status-dot normal"></span>${
                            statusCounts.normal
                        } Normal
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-6 mt-5">
                ${items
                    .map((item, index) => {
                        const firstLineOfPayload = item.payload.split("\n")[0];
                        return `
                    <div class="bg-white rounded shadow">
                        <div class="p-4 ${
                            item.status === "anomaly"
                                ? "border-red-500"
                                : item.status === "normal"
                                ? "border-green-500"
                                : "border-gray-300"
                        }" id="item-${index}">
                            <div class="flex items-center space-x-4 cursor-pointer" onclick="toggleContent(${index})">
                                <span class="status-dot ${
                                    item.status === "anomaly"
                                        ? "anomaly"
                                        : item.status === "normal"
                                        ? "normal"
                                        : "unknown"
                                }"></span>
                                <div class="flex flex-col flex-1">
                                    <span class="text-left font-semibold">${firstLineOfPayload}</span>
                                    <span class="text-sm text-gray-500">${new Date(
                                        item.created_at
                                    ).toLocaleString()}</span>
                                </div>
                                <p class="text-sm ml-2 mt-1 ${
                                    item.status === "anomaly"
                                        ? "text-red-500"
                                        : item.status === "normal"
                                        ? "text-green-500"
                                        : "text-gray-500"
                                }">
                                    ${
                                        item.status === "anomaly"
                                            ? "  Anomaly log"
                                            : item.status === "normal"
                                            ? "  Normal log"
                                            : ""
                                    }
                                </p>
                            </div>
                            <div class="content-container p-4 hidden ${
                                item.status === "anomaly"
                                    ? "border-red-500"
                                    : item.status === "normal"
                                    ? "border-green-500"
                                    : "border-gray-300"
                            }" id="content-${index}">
                                <h2 class="text-lg font-bold mt-2">Payload</h2>
                                <p class="text-sm details-content">${item.payload.replace(
                                    /\n/g,
                                    "<br>"
                                )}</p>
                                <h2 class="text-lg font-bold mt-2">Status</h2>
                                <p class="text-sm">${item.status}</p>
                                <h2 class="text-lg font-bold mt-2">Created at</h2>
                                <p class="text-sm">${new Date(
                                    item.created_at
                                ).toLocaleString()}</p>
                                <p class="text-sm mt-2 ${
                                    item.status === "anomaly"
                                        ? "text-red-500"
                                        : item.status === "normal"
                                        ? "text-green-500"
                                        : "text-gray-500"
                                }">
                                </p>
                            </div>
                        </div>
                    </div>
                `;
                    })
                    .join("")}
            </div>
        </div>
        <script>
            function toggleContent(index) {
                const content = document.getElementById('content-' + index);
                content.classList.toggle('hidden');
            }
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
