# 22. Deployment

Sourced from the `level5` module of [Virtualcode-yt/Advanced-Backend--Course](https://github.com/Virtualcode-yt/Advanced-Backend--Course),
extended with extra routes and the missing `docker-compose.yml` (the
original workflow calls `docker compose up`, but shipped no compose file
at all - see the Q&A comment at the top of `docker-compose.yml`).

The app itself is intentionally tiny - the real subject here is deploying
it to a real server (AWS EC2) and being able to verify that from your own
machine after every push.

## Run it locally first

```bash
npm install
npm run dev        # node --watch index.js
curl http://localhost:5000/health
```

## Run it in Docker locally (what EC2 will actually run)

```bash
export GIT_COMMIT=$(git rev-parse --short HEAD)   # see Q&A in Dockerfile for why this is needed
docker compose up --build
curl http://localhost:5000/version
```

## Deploying to a real EC2 instance

1. **Launch an EC2 instance** (Ubuntu, any size - even a free-tier
   `t2.micro` works for this). In its **Security Group**, allow inbound
   traffic on port **22** (SSH, from your IP) and port **5000** (this
   app - from anywhere, `0.0.0.0/0`, if you want to hit it from your own
   machine over the public internet).

2. **Install Docker + Compose on the instance** (SSH in first):
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin
   sudo usermod -aG docker ubuntu   # log out/in again after this
   ```

3. **Clone this folder onto the instance:**
   ```bash
   git clone <your-fork-or-repo-url>
   cd Web-Development-Learnings/"2. Backend"/"22. Deployment"
   ```
   (The workflow below assumes this exact path - adjust the `cd` line in
   `.github/workflows/deploy.yaml` if you place it elsewhere.)

4. **First manual start**, so the instance has something running before
   the automated workflow ever fires:
   ```bash
   sudo docker compose up -d --build
   ```

5. **Add two GitHub Actions secrets** to this repository (Settings ->
   Secrets and variables -> Actions):
   - `SSH_HOST` - the EC2 instance's public IP (or DNS name)
   - `SSH_KEY` - the private half of the `.pem` key pair you launched the
     instance with (paste the full file contents, including the
     `-----BEGIN ... KEY-----` / `-----END ... KEY-----` lines)

6. **Push to `main`.** `.github/workflows/deploy.yaml` fires automatically,
   SSHes into the instance, and runs `git pull && docker compose down &&
   docker compose up -d --build` there.

## Verifying the deploy from your own machine

This is the actual point of the extra routes below - after step 6, from
your own laptop (not the EC2 instance):

```bash
curl http://<EC2-PUBLIC-IP>:5000/version
```

If `commit` in the response matches `git log -1 --format=%h` on your own
clone, the deploy picked up your latest push. If it's stale, the deploy
didn't actually rebuild (check the Actions tab for a failed run, or SSH in
and check `docker compose logs`).

## Routes

| Route | Purpose |
|---|---|
| `GET /` | Original hello-world route from the exercise |
| `GET /health` | Liveness check - fast, no logic, safe to poll constantly |
| `GET /info` | Human-facing check-in: hostname, Node version, uptime, server time |
| `GET /version` | **The main "did my deploy actually work" check** - returns the exact git commit currently running |
| `GET /echo` | Reflects back what the server actually received (headers, IP) - useful once this sits behind a reverse proxy/load balancer and "what I sent" and "what arrived" can differ |

See the Q&A comments directly above each route in `index.js` for the
reasoning behind it.
