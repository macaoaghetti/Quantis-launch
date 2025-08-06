const connectBtn = document.getElementById("connectBtn");
const deployBtn = document.getElementById("deployBtn");
const statusDiv = document.getElementById("status");

let provider = null;
let wallet = null;

const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC"; // Your private founder wallet
const TOTAL_SUPPLY = 1000000000 * 10 ** 9; // 1 Billion with 9 decimals

connectBtn.addEventListener("click", async () => {
  if ("solana" in window) {
    provider = window.solana;
    try {
      const resp = await provider.connect();
      wallet = resp.publicKey.toString();
      connectBtn.innerText = `Connected: ${wallet.substring(0, 6)}...${wallet.slice(-4)}`;
      deployBtn.disabled = false;
      statusDiv.innerText = "Wallet connected. Ready to deploy.";
    } catch (err) {
      statusDiv.innerText = "Wallet connection failed.";
    }
  } else {
    statusDiv.innerText = "Phantom Wallet not detected.";
  }
});

deployBtn.addEventListener("click", async () => {
  if (!provider || !wallet) {
    statusDiv.innerText = "Please connect your wallet first.";
    return;
  }

  statusDiv.innerText = "Deploying QTX token on Solana...";
  deployBtn.disabled = true;

  try {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"), "confirmed");
    const payer = provider;

    const token = await solanaWeb3.Token.createMint(
      connection,
      payer,
      new solanaWeb3.PublicKey(FOUNDER_ADDRESS),
      null,
      9,
      solanaWeb3.TOKEN_PROGRAM_ID
    );

    const tokenAddress = token.publicKey.toString();

    // Send 10% supply to founder
    const founderTokenAccount = await token.getOrCreateAssociatedAccountInfo(new solanaWeb3.PublicKey(FOUNDER_ADDRESS));
    await token.mintTo(
      founderTokenAccount.address,
      payer.publicKey,
      [],
      TOTAL_SUPPLY * 0.1
    );

    // Log & UI
    console.log("QTX deployed at:", tokenAddress);
    statusDiv.innerHTML = `✅ QTX Token Deployed Successfully!<br>Address: <a href="https://solscan.io/token/${tokenAddress}" target="_blank">${tokenAddress}</a>`;
  } catch (err) {
    console.error("Deployment failed:", err);
    statusDiv.innerText = "❌ Deployment failed. See console for details.";
    deployBtn.disabled = false;
  }
});
