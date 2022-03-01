require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { default: fetch } = require("node-fetch");
const jwt = require("jsonwebtoken");

const PORT = 9000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

async function get_detail(response) {
  const { status } = response
  response = await response.text();
  try {
    const detail = JSON.parse(response)
    return { status, detail };
  }
  catch {
    return { status, detail: (response=="") ? "Not found" : response }
  }
}

//
app.get("/get-token", (req, res) => {
  const API_KEY = process.env.VIDEOSDK_API_KEY;
  const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

  const options = { expiresIn: "10m", algorithm: "HS256" };

  const payload = {
    apikey: API_KEY,
    permissions: ["allow_join", "allow_mod"], // also accepts "ask_join"
  };

  const token = jwt.sign(payload, SECRET_KEY, options);
  res.json({ token });
});

// create new meeting
app.post("/create-meeting", (req, res) => {
  const { token, region } = req.body;
  const url = `${process.env.VIDEOSDK_API_ENDPOINT}/v1/meetings`;
  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ region }),     // region: sg001 || uk001 || us001
  };

  fetch(url, options)
    // .then((response) => response.json())
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});

// To validate existing meeting id, before joining
app.post("/validate-meeting/:meetingId", (req, res) => {
  const token = req.body.token;
  const meetingId = req.params.meetingId;

  const url = `${process.env.VIDEOSDK_API_ENDPOINT}/v1/meetings/${meetingId}`;

  const options = {
    method: "POST",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


//  Get meeting details/meeting list
app.post("/meetings/:meetingId?", (req, res) => {
  const token = req.body.token;
  const meetingId = req.params.meetingId;

  var url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meetings`;
  if (meetingId) {
    url = `${process.env.VIDEOSDK_API_ENDPOINT}/v1/meetings/${meetingId}`;
  }

  const options = {
    method: "GET",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


// Get meeting-session details/meeting-session list
app.post("/meeting-sessions/:sessionId?", (req, res) => {
  const token = req.body.token;
  const sessionId = req.params.sessionId;

  var url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-sessions`;
  if (sessionId) {
    url = `${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-sessions/${sessionId}`;
  }

  const options = {
    method: "GET",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


// End a running session
app.post("/meeting-sessions/:sessionId/end", (req, res) => {
  const token = req.body.token;
  const sessionId = req.params.sessionId;

  const url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-sessions/${sessionId}/end`;

  const options = {
    method: "POST",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


// Remove a participant from a running session
app.post("/meeting-sessions/:sessionId/remove-participant", (req, res) => {
  const { token, participantId } = req.body;
  const sessionId = req.params.sessionId;

  const url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-sessions/${sessionId}/remove-participant`;

  const options = {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({ participantId: participantId }),
  };
  
  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


// List/get recordings
app.post("/meeting-recordings/:recordingId?", (req, res) => {
  const token = req.body.token;
  const recordingId = req.params.recordingId;

  var url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-recordings`;
  if (recordingId) {
    url = `${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-recordings/${recordingId}`;
  }

  const options = {
    method: "GET",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});


// delete recordings
app.post ("/meeting-recordings/:recordingId", (req, res) => {
  const token = req.body.token;
  const recordingId = req.params.recordingId;

  const url =`${process.env.VIDEOSDK_API_ENDPOINT}/v1/meeting-recordings/${recordingId}`;

  const options = {
    method: "DELETE",
    headers: { Authorization: token },
  };

  fetch(url, options)
    .then((res) => get_detail(res))
    .then((result) => res.json(result))
    .catch((error) => console.error("error", error));
});

//
const post = PORT || 3000
app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
