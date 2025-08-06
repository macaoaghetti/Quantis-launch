document.addEventListener("DOMContentLoaded", async function () {
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");

  let provider = null;

  // Check for Phantom wallet
  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;

    connectButton.addEventListener("click", async () => {
      try {
        const response = await provider.connect();
        const wallet = response.publicKey.toString();
        connectButton.innerText = "Connected: " + wallet.substring(0, 6) + "...";
        connectButton.disabled = true;
        deployButton.disabled = false;
      } catch (err) {
        console.error("Connection failed:", err);
      }
    });
  } else {
    alert("Phantom Wallet not detected. Please install it.");
  }

  // Deploy token logic (placeholder)
  deployButton.addEventListener("click", () => {
    alert("QTX token will deploy now...");
    // Your actual deployment logic goes here
  });
});
