Step 1 — SSH into VPS
ssh root@

Step 2 — Update server packages
apt update -y
apt upgrade -y

Step 3 — Install required tools (git, nginx, curl)
apt install -y git nginx curl

Step 4 — Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v

Step 5 — Enable basic firewall (UFW)
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status

Step 6 — Create & point DuckDNS domain

nodejsauth.duckdns.org

point ->
curl "https://www.duckdns.org/update?domains=nodejsauth&token=duckdns token&ip=vps ip"

Step 7 — Configure Nginx for your domain
Create a new Nginx site config

nano /etc/nginx/sites-available/nodejs-youtube-authentication

paste the config

server {
listen 80;
server_name nodejsauth.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:5000;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Real-IP $remote_addr;
    }

}

Enable the site

ln -s /etc/nginx/sites-available/nodejs-youtube-authentication /etc/nginx/sites-enabled/

Test Nginx config
nginx -t

Reload Nginx

systemctl reload nginx

Step 8 — Install SSL (HTTPS) with Certbot

Install Certbot
apt install -y certbot python3-certbot-nginx

Generate SSL certificate
certbot --nginx -d nodejsauth.duckdns.org

Deploy Node App and PM2

mkdir -p /var/www
cd /var/www
git clone https://<username of github>:<token>@github.com/<github username>/<reponame>.git nodejs_auth_youtube
cd nodejs_auth_youtube

Install deps + build
npm install
npm run build

Create .env
nano .env

Start app with PM2
npm i -g pm2
pm2 start dist/server.js --name youtube-auth-demo
pm2 save
pm2 startup
