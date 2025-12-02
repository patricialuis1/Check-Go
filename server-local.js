import "dotenv/config";

import APP from "./app.js";

const PORT = 3001;
APP.listen(PORT, () => {
  console.log("Local ON → http://localhost:" + PORT);
});
