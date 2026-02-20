const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require("multer");
const openURLMiddleware = require('@react-native-community/cli-server-api/build/openURLMiddleware').default;

const app = connect();
const upload = multer();

app.use((req, res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

/* ---------------- JSON Parser (API ONLY) ---------------- */
app.use('/api', bodyParser.json());

/* ---------------- In-Memory Database ---------------- */

let users = [];
let posts = [];

const SECRET = require('crypto').randomBytes(32).toString('hex');

/* ---------------- JWT Middleware ---------------- */

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: "No token provided" }));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid token" }));
  }
}

/* ================= REGISTER ================= */

app.use('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.end(JSON.stringify({ error: "Missing fields" }));

  if (users.find(u => u.username === username))
    return res.end(JSON.stringify({ error: "User exists" }));

  users.push({
    username,
    password,
    bio: "",
    avatar: "",
    followers: [],
    following: []
  });

  res.end(JSON.stringify({ success: true }));
});

/* ================= LOGIN ================= */

app.use('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user)
    return res.end(JSON.stringify({ error: "Invalid credentials" }));

  const token = jwt.sign({ username }, SECRET, { expiresIn: "1h" });

  res.end(JSON.stringify({ success: true, token }));
});

/* ================= POSTS ================= */

app.use((req, res, next) => {

  if (!req.url.startsWith('/api/posts')) return next();

  authenticate(req, res, () => {

    const pathParts = req.url.replace('/api/posts', '').split('/').filter(Boolean);
    const id = pathParts.length > 0 ? parseInt(pathParts[0]) : null;

    /* GET ALL POSTS */
    if (req.method === 'GET' && pathParts.length === 0) {
      return res.end(JSON.stringify(posts));
    }

    /* CREATE POST */
    if (req.method === 'POST' && pathParts.length === 0) {

      if (!req.body || !req.body.content) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Content required" }));
      }

      const post = {
        id: Date.now(),
        author: req.user.username,
        content: req.body.content,
        likes: 0,
        replies: [],
        createdAt: new Date().toLocaleString()
      };

      posts.unshift(post);
      return res.end(JSON.stringify(post));
    }

    /* LIKE */
    if (req.method === 'POST' && pathParts[1] === 'like') {
      const post = posts.find(p => p.id === id);
      if (!post) return res.end(JSON.stringify({ error: "Post not found" }));

      post.likes++;
      return res.end(JSON.stringify(post));
    }

    /* REPLY */
    if (req.method === 'POST' && pathParts[1] === 'reply') {
      const post = posts.find(p => p.id === id);
      if (!post) return res.end(JSON.stringify({ error: "Post not found" }));

      post.replies.push({
        id: Date.now(),
        author: req.user.username,
        text: req.body.text
      });

      return res.end(JSON.stringify(post));
    }

    /* DELETE */
    if (req.method === 'DELETE' && id) {
      const index = posts.findIndex(p => p.id === id);
      if (index === -1)
        return res.end(JSON.stringify({ error: "Post not found" }));

      if (posts[index].author !== req.user.username)
        return res.end(JSON.stringify({ error: "Not authorized" }));

      posts.splice(index, 1);
      return res.end(JSON.stringify({ success: true }));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  });
});

/* ================= PROFILE ================= */

app.use('/api/profile', authenticate, (req, res) => {

  const user = users.find(u => u.username === req.user.username);

  if (!user)
    return res.end(JSON.stringify({ error: "User not found" }));

  if (req.method === 'GET') {
    return res.end(JSON.stringify({
      bio: user.bio,
      avatar: user.avatar
    }));
  }

  if (req.method === 'PUT') {
    user.bio = req.body.bio || user.bio;
    return res.end(JSON.stringify({ success: true }));
  }

  res.statusCode = 405;
  res.end();
});

/* ================= AVATAR UPLOAD ================= */

app.use('/api/avatar', authenticate, upload.single('avatar'), (req, res) => {

  const user = users.find(u => u.username === req.user.username);

  if (!req.file)
    return res.end(JSON.stringify({ error: "No file uploaded" }));

  user.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  res.end(JSON.stringify({ success: true }));
});

/* ================= RESET PASSWORD ================= */

app.use('/api/reset-password', authenticate, (req, res) => {

  const user = users.find(u => u.username === req.user.username);

  if (!user)
    return res.end(JSON.stringify({ error: "User not found" }));

  if (!req.body.newPassword || req.body.newPassword.length < 4)
    return res.end(JSON.stringify({ error: "Password too short" }));

  user.password = req.body.newPassword;

  res.end(JSON.stringify({ success: true }));
});

app.use((req, res, next) => {

  if (!req.url.startsWith('/api/view-mobile')) return next();

  authenticate(req, res, () => {

    if (req.method !== 'POST') {
      res.statusCode = 405;
      return res.end(JSON.stringify({ error: "Method not allowed" }));
    }

    if (!req.body || !req.body.url) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "URL required" }));
    }

    return res.end(JSON.stringify({
      success: true,
      message: "Mobile deep link generated successfully"
    }));
  });

});

/* -------- DEV ROOT EXACT MATCH -------- */

app.use((req, res, next) => {

  // Match exact /dev or /dev/
  if (req.url === '/dev' || req.url === '/dev/') {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.statusCode = 404;
      return res.end("Not Found");
    }

    try {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, SECRET);

      res.statusCode = 503;
      return res.end("Service Unavailable");

    } catch {
      res.statusCode = 404;
      return res.end("Not Found");
    }
  }

  next();
});

app.use((req, res, next) => {

  if (!req.url.startsWith('/dev/view-mobile')) {
    return next();
  }

  authenticate(req, res, () => {

    try {
      openURLMiddleware(req, res, next);
    } catch (err) {
      console.error("Dev middleware error:", err.message);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }

  });

});

/* ================= STATIC ================= */

const distPath = path.join(__dirname, 'chatterbox/dist');

app.use(serveStatic(distPath));

app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.end(fs.readFileSync(path.join(distPath, 'index.html')));
  } else {
    next();
  }
});


http.createServer(app).listen(8081, () => {
  console.log("ChatterBox running at http://localhost:8081");
});