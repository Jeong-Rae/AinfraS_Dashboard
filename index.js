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
    const items = await Item.find({}).sort({ created_at: -1 }); // 데이터를 최신 날짜 순으로 정렬
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>AINFRAS-SECURITY</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              document.querySelectorAll('.toggle-content').forEach(button => {
                button.addEventListener('click', () => {
                  const content = button.nextElementSibling;
                  content.classList.toggle('hidden');
                });
              });
            });
          </script>
      </head>
      <body class="bg-gray-100">
          <div class="container mx-auto px-4">
              <h1 class="text-center text-3xl font-bold my-5">AINFRAS-SECURITY</h1>
              ${items
                  .map((item) => {
                      const firstLineOfPayload = item.payload.split("\n")[0];
                      return `
                            <div class="my-5 p-5 w-3/5 mx-auto ${
                                item.status === "anomaly"
                                    ? "bg-red-500 border-red-500"
                                    : item.status === "normal"
                                    ? "bg-green-500 border-green-500"
                                    : "bg-white border-gray-300"
                            } rounded shadow">
                              <button class="toggle-content font-bold text-left flex justify-between items-center w-full">
                                <span class="text-left">${firstLineOfPayload}</span>
                                <span class="text-right text-sm">${new Date(
                                    item.created_at
                                ).toLocaleString()}</span>
                              </button>
                              <div class="hidden bg-white p-3 border-2 ${
                                  item.status === "anomaly"
                                      ? "border-red-500"
                                      : item.status === "normal"
                                      ? "border-green-500"
                                      : "border-gray-300"
                              } rounded">
                                <h2 class="text-lg font-bold">Payload</h2>
                                <p>${item.payload.replace(/\n/g, "<br>")}</p>
                                <h2 class="text-lg font-bold">Status</h2>
                                <p>${item.status}</p>
                                <h2 class="text-lg font-bold">Created at</h2>
                                <p>${new Date(
                                    item.created_at
                                ).toLocaleString()}</p>
                              </div>
                            </div>
                          `;
                  })
                  .join("")}
          </div>
      </body>
      </html>
    `;
    res.send(html);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
