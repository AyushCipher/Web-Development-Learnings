# Q. WHY node:20-alpine INSTEAD OF THE ORIGINAL EXERCISE'S PLAIN "FROM node"?
# ANS: An unpinned "node" tag resolves to whatever "latest" happens to be
# on whatever day the image gets built - a fresh `docker compose up
# --build` on EC2 next month could silently pull a different major Node
# version than what you tested locally. Pinning to node:20-alpine fixes
# the major version and uses the small Alpine-based variant, which matters
# on a modest EC2 instance (e.g. a free-tier t2.micro) where image size
# and pull time are real constraints, not just nice-to-haves.
FROM node:20-alpine

WORKDIR /app

# Copying just the manifests first (before the rest of the source) lets
# Docker's layer cache reuse the `npm install` layer on rebuilds where only
# application code changed, not dependencies - meaningfully faster
# redeploys once this is rebuilding on every push via the GitHub Actions
# workflow.
COPY package*.json .
RUN npm install --omit=dev
COPY . .

# Q. WHY A BUILD ARG FOR THE GIT COMMIT INSTEAD OF RUNNING git INSIDE THE
#    CONTAINER (installing it, like an earlier version of this Dockerfile
#    tried)?
# ANS: This folder is a SUBDIRECTORY of a larger monorepo - the build
# CONTEXT Docker uses here (see docker-compose.yml's `build: .`) is scoped
# to just "22. Deployment", but the actual .git lives two directories up,
# entirely outside that context. No amount of `apk add git` or adjusting
# .dockerignore fixes that - there's simply no .git reachable from inside
# the build to read from. The fix is to compute the commit OUTSIDE the
# build (where .git is reachable) and pass it in as a build arg instead -
# see docker-compose.yml's `build.args` and the GitHub Actions workflow for
# where GIT_COMMIT actually gets set.
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

EXPOSE 5000

CMD [ "node", "index.js" ]
