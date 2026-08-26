require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const pool = require("./db/pool");
const authRoutes = require("./routes/auth");
const projectsRoutes = require("./routes/projects");
const { initSockets } = require("./sockets");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);

app.get("/health", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ status: "ok", dbTime: result.rows[0].now });
});

const server = http.createServer(app);
const io = initSockets(server);

// make io accessible inside route controllers via req.app.get('io')
app.set("io", io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
