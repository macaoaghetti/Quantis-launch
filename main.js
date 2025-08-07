// main.js
const splToken = window.splToken;
const solanaWeb3 = window.solanaWeb3;

const connectButton = document.getElementById("connectWallet");
const deployButton = document.getElementById("deployToken");
const statusDiv = document.getElementById("status");

const TOTAL_SUPPLY = 1_000_000_000 * 10 ** 9; // 1B tokens, 9 decimals

let provider = null;
let wallet = null;

// ✅ Ensure Phantom exists
if (window.solana && window.solana.isPhantom) {
  provider = window.solana;
} else {
  alert("Phantom wallet not found. Please install it.");
  throw new Error("Phantom wallet not found.");
}

// ✅ Connect Wallet
connectButton.addEventListener("click", async () => {
  try {
    const resp = await provider.connect();
    wallet = resp.publicKey.toString();
    connectButton.innerText = "Connected: " + wallet.slice(0, 6) + "...";
    connectButton.disabled = true;
    deployButton.disabled = false;
    statusDiv.innerText = "";
  } catch (err) {
    console.error("Wallet connection failed:", err);
    statusDiv.innerText = "❌ Wallet connection failed.";
  }
});

// ✅ Deploy Token
deployButton.addEventListener("click", async () => {
  try {
    statusDiv.innerText = "⏳ Deploying QTX Token...";

    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    const walletPubKey = provider.publicKey;

    const payer = {
      publicKey: walletPubKey,
      signTransaction: provider.signTransaction.bind(provider),
      signAllTransactions: provider.signAllTransactions.bind(provider),
    };

    // ✅ Create mint
    const mint = await splToken.createMint(
      connection,
      payer,
      walletPubKey,
      null,
      9 // decimals
    );

    // ✅ Create associated token account
    const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      walletPubKey
    );

    // ✅ Mint to user's wallet
    await splToken.mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      walletPubKey,
      TOTAL_SUPPLY
    );

    statusDiv.innerText = "✅ QTX Deployed Successfully: " + mint.toBase58();
    console.log("Token Mint Address:", mint.toBase58());
  } catch (err) {
    console.error("Deployment failed:", err);
    statusDiv.innerText = "❌ Deployment failed. Check console.";
  }
});
