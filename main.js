document.addEventListener("DOMContentLoaded", async function () {
  const splToken = window.splToken;
  const solanaWeb3 = window.solanaWeb3;
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");
  const statusDiv = document.getElementById("status");

  const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9;

  if (!window.solana || !window.solana.isPhantom) {
    alert("Phantom wallet not found. Please install it.");
    return;
  }

  const provider = window.solana;

  connectButton.addEventListener("click", async () => {
    try {
      const resp = await provider.connect();
      const walletPub = resp.publicKey.toString();
      connectButton.innerText = "Connected: " + walletPub.slice(0, 6) + "...";
      connectButton.disabled = true;
      deployButton.disabled = false;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      statusDiv.innerText = "❌ Wallet connection failed.";
    }
  });

  deployButton.addEventListener("click", async () => {
    try {
      statusDiv.innerText = "⏳ Deploying QTX Token...";

      const connection = new solanaWeb3.Connection(
        solanaWeb3.clusterApiUrl("mainnet-beta"),
        "confirmed
