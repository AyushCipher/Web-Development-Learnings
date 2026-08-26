// Deployment demo - the app itself is intentionally tiny. The actual
// subject of this folder is everything AROUND the code: Dockerfile,
// docker-compose.yml, and the GitHub Actions workflow that deploys it to
// an EC2 instance on every push to main (see .github/workflows/deploy.yaml
// and README.md for the full deployment walkthrough).
//
// Q. WHAT DOES "VIEW IT FROM YOUR LOCALHOST AFTER DEPLOYING TO EC2" ACTUALLY
//    MEAN?
// ANS: Once this is running on an EC2 instance (a real server with its own
// public IP), your own machine can reach it over the internet just like
// any other website - hitting http://<EC2-PUBLIC-IP>:5000/... from a
// browser or curl ON YOUR LAPTOP, not "localhost" in the literal
// loopback-address sense. The routes below are deliberately built to make
// that check easy and informative: rather than just "is *a* server
// responding", each one answers a different verification question you'd
// actually have right after a deploy.
import express from "express"
import dotenv from "dotenv"
import os from "os"
import { execSync } from "child_process"

dotenv.config()

const port = process.env.PORT || 5000
const app = express()

// Q. WHY READ THE GIT COMMIT HASH FROM process.env.GIT_COMMIT, WITH A
//    execSync FALLBACK, INSTEAD OF JUST ALWAYS SHELLING OUT TO git?
// ANS: This is the single most useful thing a "did my deploy actually work"
// route can tell you - but where that commit hash actually comes from
// differs between running this directly with `node index.js` and running
// it in Docker. Run directly, this file's cwd sits inside the real repo
// checkout, so `git rev-parse` just works (git walks up to find .git).
// Inside the Docker image, though, the build CONTEXT is only this
// `22. Deployment` folder - the repo's actual .git lives two directories
// up, outside that context entirely, so no `COPY . .` or `apk add git`
// fix can make git work in there; there's simply no .git to find. The
// Dockerfile instead accepts a GIT_COMMIT build ARG, which the CI
// workflow/docker-compose.yml populate from a git command run OUTSIDE
// the build (where .git is actually reachable) and bakes in as an env
// var - checking process.env.GIT_COMMIT first covers that case, and the
// execSync fallback keeps plain local `node index.js` runs (like the one
// you're probably using to read this) working without any setup.
let commitHash = process.env.GIT_COMMIT
if (!commitHash) {
    try {
        commitHash = execSync("git rev-parse --short HEAD").toString().trim()
    } catch {
        commitHash = "unknown"
    }
}

const startedAt = new Date()

app.get("/", (req, res) => {
    return res.status(200).json({ message: "hello ayush v4👍" })
})

// Liveness check - "is the process running at all". Kept deliberately
// synchronous/instant: a load balancer or process manager polling this
// shouldn't itself be a source of load or slow failure detection.
app.get("/health", (req, res) => {
    return res.status(200).json({ message: "all is good👍" })
})

// Q. WHY BOTH /health AND /info INSTEAD OF PUTTING EVERYTHING IN ONE ROUTE?
// ANS: Same reasoning used elsewhere in this repo for liveness vs.
// readiness checks - /health answers one narrow yes/no question fast, so
// it's cheap to poll constantly from a monitor. /info is for a HUMAN
// checking in after a deploy, so it can affort to be richer: which host
// answered (useful once you're behind a load balancer with more than one
// instance), how long it's been up (a low uptime right after you expected
// a deploy confirms the process actually restarted), and the current
// server time (catches host clock/timezone surprises early).
app.get("/info", (req, res) => {
    return res.status(200).json({
        hostname: os.hostname(),
        platform: process.platform,
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        startedAt: startedAt.toISOString(),
        serverTime: new Date().toISOString(),
    })
})

// See the Q&A above the commitHash line for why this is the main "did my
// EC2 deploy pick up the latest code" check.
app.get("/version", (req, res) => {
    return res.status(200).json({
        commit: commitHash,
        env: process.env.NODE_ENV || "development",
    })
})

// Q. WHY A ROUTE THAT JUST ECHOES BACK THE REQUEST?
// ANS: Once this sits behind nginx/a load balancer/a security group on
// EC2, "the app works" and "the app receives what I think it receives"
// are two different questions - a reverse proxy can silently rewrite the
// Host header, strip a path prefix, or fail to forward the real client IP
// (see X-Forwarded-For below). Hitting this from your own machine after
// deploying is a quick way to confirm what's actually arriving at the
// app, not just what you sent from the browser.
app.get("/echo", (req, res) => {
    return res.status(200).json({
        yourIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
    })
})

app.listen(port, () => {
    console.log(`server started ${port}`)
})
