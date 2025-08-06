document.addEventListener("DOMContentLoaded", async function () {
  const connectButton = document.getElementById("connectWallet");
  const deployButton = document.getElementById("deployToken");
  const statusDiv = document.getElementById("status");

  let provider = null;
  let wallet = null;

  const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
  const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9;

  if (window.solana && window.solana.isPhantom) {
    provider = window.solana;

    connectButton.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        wallet = resp.publicKey.toString();
        connectButton.innerText = "Connected: " + wallet.slice(0, 6) + "...";
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

        const mint = await splToken.createMint(
          connection,
          {
            publicKey: payer.publicKey,
            signTransaction: payer.signTransaction,
            signAllTransactions: payer.signAllTransactions
          },
          new solanaWeb3.PublicKey(FOUNDER_ADDRESS),
          null,
          9
        );

        const tokenAddress = mint.toBase58();

        const founderTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
          connection,
          {
            publicKey: payer.publicKey,
            signTransaction: payer.signTransaction,
            signAllTransactions: payer.signAllTransactions
          },
          mint,
          new solanaWeb3.PublicKey(FOUNDER_ADDRESS)
        );

        await splToken.mintTo(
          connection,
          {
            publicKey: payer.publicKey,
            signTransaction: payer.signTransaction,
            signAllTransactions: payer.signAllTransactions
          },
          mint,
          founderTokenAccount.address,
          payer.publicKey,
          TOTAL_SUPPLY * 0.1
        );

        statusDiv.innerHTML = `✅ QTX Token Deployed!<br><a href="https://solscan.io/token/${tokenAddress}" target="_blank">${tokenAddress}</a>`;
      } catch (err) {
        console.error("❌ Deployment error:", err);
        statusDiv.innerText = "❌ Deployment failed. Check console.";
        deployButton.disabled = false;
      }
    });

  } else {
    alert("❌ Phantom Wallet not detected. Please install it.");
  }
});
