document.addEventListener("DOMContentLoaded", async function () {
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");
  const statusDiv = document.getElementById("status");

  let provider = null;
  let wallet = null;

  const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
  const TOTAL_SUPPLY = 1000000000 * 10 ** 9;

  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        wallet = resp.publicKey.toString();
        connectButton.innerText = "Connected: " + wallet.substring(0, 6) + "...";
        connectButton.disabled = true;
        deployButton.disabled = false;
        statusDiv.innerText = "✅ Wallet connected. Ready to deploy.";
      } catch (err) {
        console.error("Connection failed:", err);
        statusDiv.innerText = "❌ Wallet connection failed.";
      }
    });

    deployButton.addEventListener("click", async () => {
      try {
        statusDiv.innerText = "🚀 Deploying QTX Token...";
        deployButton.disabled = true;

        const connection = new solanaWeb3.Connection(
          solanaWeb3.clusterApiUrl("mainnet-beta"),
          "confirmed"
        );

        const payer = provider;

        const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken;

        const mint = await createMint(
          connection,
          payer,
          new solanaWeb3.PublicKey(FOUNDER_ADDRESS),
          null,
          9
        );

        const tokenAddress = mint.toBase58();

        const founderTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          mint,
          new solanaWeb3.PublicKey(FOUNDER_ADDRESS)
        );

        await mintTo(
          connection,
          payer,
          mint,
          founderTokenAccount.address,
          payer.publicKey,
          TOTAL_SUPPLY * 0.1
        );

        statusDiv.innerHTML = `✅ QTX Token Deployed!<br><a href="https://solscan.io/token/${tokenAddress}" target="_blank">${tokenAddress}</a>`;
      } catch (err) {
        console.error("Deployment failed:", err);
        statusDiv.innerText = "❌ Deployment failed. Check console.";
        deployButton.disabled = false;
      }
    });

  } else {
    alert("❌ Phantom Wallet not detected. Please install it.");
  }
});
