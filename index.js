const express = require("express");

const app = express();

app.use(express.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/supplier", (req, res) => {
  const success = req?.body;
console.log(req.body);
  if (success) {
    return res.status(200).json({
      success: true,
      data: req.body
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
