const express = require("express");
require("dotenv").config();
const cors = require("cors");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const redis = require("redis");
const session = require("express-session");
const connectRedis = require("connect-redis"); // Correct import for connect-redis v5.x.x
const RedisStore = connectRedis(session); // Use RedisStore correctly
const bodyParser = require("body-parser");

// Your DB and routes setup (as before)
const DBInstance = require("./db/db");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const verificationRoutes = require("./routes/verifyUser.routes");
const imageUpload = require("./routes/uploadImage.routes");
const problemRoutes = require("./routes/problem.routes");
const getUserRoutes = require("./routes/user.routes");
const logger = require("./logger");
const morgan = require("morgan");
const communicationRoutes = require("./routes/communication.routes");

//Invoking DB instance
DBInstance();

const morganFormat = ":method :url :status :response-time ms";

// Redis client setup
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "localhost", // Redis host
  port: process.env.REDIS_PORT || 6379, // Redis port
  password: process.env.REDIS_PASSWORD || "", // Optional if Redis has authentication
});

redisClient.on("connect", function () {
  console.log("Connected to Redis");
});

redisClient.on("error", function (err) {
  console.error("Redis error: ", err);
});

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow requests only from this URL
    credentials: true, // Allow credentials (cookies, HTTP authentication, etc.)
  })
);

app.use(requestIp.mw());

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Use Redis store for session management
app.use(
  session({
    store: new RedisStore({ client: redisClient }), // Set up Redis session store
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }, // 1 day expiration
  })
);

// Get user info (IP, geo-location)
app.get("/user-info", (req, res) => {
  const ip = req.clientIp;
  const geo = geoip.lookup(ip);

  const userInfo = {
    ip: ip || "Unknown",
    city: (geo && geo.city) || "Unknown",
    country: (geo && geo.country) || "Unknown",
    region: (geo && geo.region) || "Unknown",
    latitude: (geo && geo.ll && geo.ll[0]) || "Unknown",
    longitude: (geo && geo.ll && geo.ll[1]) || "Unknown",
  };

  res.json(userInfo);
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", dashboardRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1/auth", verificationRoutes);
app.use("/api/v1/useraccount/upload", imageUpload);
app.use("/api/v1/add", problemRoutes);
app.use("/api/v1/get", problemRoutes);
app.use("/api/v1/user/get", getUserRoutes);
app.use("/api/v1/get", problemRoutes);
app.use("/api/v1/execute", problemRoutes);
app.use("/api/v1/communication", communicationRoutes);

app.listen(PORT, () => {
  try {
    console.log(`Server running at PORT: ${PORT}`);
  } catch (error) {
    console.log(`Error running server : ${error}`);
  }
});
