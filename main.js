const connectBtn = document.getElementById("connectBtn");
const deployBtn = document.getElementById("deployBtn");
const statusDiv = document.getElementById("status");

let provider = null;
let wallet = null;

const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
const TOTAL_SUPPLY = 1000000000 * 10 ** 9;

connectBtn.onclick = async () => {
  if ("solana" in window) {
    provider = window.solana;
    try {
      const resp = await provider.connect();
      wallet = resp.publicKey.toString();
      connectBtn.innerText = `Connected: ${wallet.substring(0, 6)}...${wallet.slice(-4)}`;
      deployBtn.disabled = false;
      statusDiv.innerText = "✅ Wallet connected. Ready to deploy.";
    } catch (e) {
      statusDiv.innerText = "❌ Wallet connection failed.";
    }
  } else {
    statusDiv.innerText = "❌ Phantom Wallet not detected.";
  }
};

deployBtn.onclick = async () => {
  if (!provider || !wallet) return;

  statusDiv.innerText = "🚀 Deploying QTX Token...";
  deployBtn.disabled = true;

  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    const mint = await window.splToken.createMint(
      connection,
      provider,
      new solanaWeb3.PublicKey(FOUNDER_ADDRESS),
      null,
      9
    );

    const tokenAddress = mint.toBase58();

    const founderTokenAccount = await window.splToken.getOrCreateAssociatedTokenAccount(
      connection,
      provider,
      mint,
      new solanaWeb3.PublicKey(FOUNDER_ADDRESS)
    );

    await window.splToken.mintTo(
      connection,
      provider,
      mint,
      founderTokenAccount.address,
      provider.publicKey,
      TOTAL_SUPPLY * 0.1
    );

    statusDiv.innerHTML = `✅ QTX Token Deployed!<br><strong>Token Address:</strong><br><a href="https://solscan.io/token/${tokenAddress}" target="_blank">${tokenAddress}</a>`;
  } catch (err) {
    console.error("Deployment error:", err);
    statusDiv.innerText = "❌ Deployment failed. Check console for details.";
    deployBtn.disabled = false;
  }
};
