import QRCode from "qrcode";

const otpAuthUrl = process.argv[2];

if (!otpAuthUrl) {
  throw new Error("Pass otpAuthurl as argument");
}

async function main() {
  await QRCode.toFile("totp.png", otpAuthUrl);
  console.log("Saved QR code");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
