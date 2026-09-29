const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/test", (req, res) => {
  const success = true;

  if (success) {
    return res.status(200).json({
      success: true,
      message: "API executed successfully",
      data: {
        id: 1,
        name: "John"
      }
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong"
  });
});

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
