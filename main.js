// main.js
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.73.3";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from "https://esm.sh/@solana/spl-token@0.3.5";

const connectBtn = document.getElementById("connectWallet");
const deployBtn  = document.getElementById("deployToken");
const statusDiv  = document.getElementById("status");

const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
const TOTAL_SUPPLY    = 1_000_000_000 * 10 ** 9;
const FOUNDER_SUPPLY  = Math.floor(TOTAL_SUPPLY * 0.15);

let provider, walletPubkey;

window.addEventListener("DOMContentLoaded", () => {
  statusDiv.innerText = "Status: checking Phantom…";
  if (!window.solana?.isPhantom) {
    statusDiv.innerText = "❌ Phantom not found. Install Phantom extension.";
    return;
  }

  provider = window.solana;
  statusDiv.innerText = "Status: Phantom detected";
  connectBtn.disabled = false;

  connectBtn.addEventListener("click", async () => {
    try {
      const resp = await provider.connect();
      walletPubkey = resp.publicKey;
      connectBtn.innerText = "🔒 " + walletPubkey.toString().slice(0, 6) + "...";
      connectBtn.disabled = true;
      deployBtn.disabled = false;
      statusDiv.innerText = "Status: Wallet connected";
    } catch (err) {
      statusDiv.innerText = "❌ Connect failed: " + err.message;
    }
  });

  deployBtn.addEventListener("click", async () => {
    statusDiv.innerText = "Status: deploying token…";
    try {
      // CORS-friendly RPC endpoint
      const RPC_URL = "https://rpc.ankr.com/solana";
      const conn    = new Connection(RPC_URL, "confirmed");

      // 1) Create the mint
      const mint = await createMint(
        conn,
        provider,
        walletPubkey,
        null,
        9
      );

      // 2) Create/get founder's associated token account
      const ata = await getOrCreateAssociatedTokenAccount(
        conn,
        provider,
        mint,
        new PublicKey(FOUNDER_ADDRESS)
      );

      // 3) Mint 15% to founder
      await mintTo(
        conn,
        provider,
        mint,
        ata.address,
        walletPubkey,
        FOUNDER_SUPPLY
      );

      statusDiv.innerText = "✅ Deployed! Mint: " + mint.toString();
    } catch (err) {
      statusDiv.innerText = "❌ Deploy failed: " + err.message;
    }
  });
});
