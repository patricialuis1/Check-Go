import APP from "./app.js";

const PORT = 3000;
APP.listen(PORT, () => {
  console.log("Local ON → http://localhost:" + PORT);
});
