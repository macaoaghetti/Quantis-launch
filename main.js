// main.js

import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.73.3";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "https://esm.sh/@solana/spl-token@0.3.5";

const connectBtn = document.getElementById("connectWallet");
const deployBtn  = document.getElementById("deployToken");
const statusDiv  = document.getElementById("status");

// ← your founder address here
const FOUNDER_ADDRESS = "CkvoeLNXgeGF99MbUu3YvUd19s5o94iG2Y77QdFitxUC";
// ← 1 billion tokens with 9 decimals
const TOTAL_SUPPLY    = 1_000_000_000 * 10 ** 9;
const FOUNDER_SUPPLY  = Math.floor(TOTAL_SUPPLY * 0.15);

let provider, walletPubkey;

window.addEventListener("DOMContentLoaded", async () => {
  statusDiv.innerText = "Status: checking Phantom…";

  if (window.solana?.isPhantom) {
    provider = window.solana;
    statusDiv.innerText = "Status: Phantom detected";
    connectBtn.disabled = false;

    connectBtn.addEventListener("click", async () => {
      try {
        const resp = await provider.connect();
        walletPubkey = resp.publicKey;
        connectBtn.innerText = "🔒 " + walletPubkey.toString().slice(0,6) + "...";
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
        // ← your QuickNode endpoint here
        const RPC_URL = "https://wiser-cool-arm.solana-mainnet.quiknode.pro/cdc6f37839abfb551f2c762094e0b05dcc5aa93a/";
        const conn    = new Connection(RPC_URL, "confirmed");

        // 1) create the mint
        const mint = await createMint(
          conn,
          provider,          // payer
          walletPubkey,      // mint authority
          null,              // freeze authority
          9                  // decimals
        );

        // 2) get founder ATA
        const ata  = await getOrCreateAssociatedTokenAccount(
          conn,
          provider,
          mint,
          new PublicKey(FOUNDER_ADDRESS)
        );

        // 3) mint 15% to founder
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

  } else {
    statusDiv.innerText = "❌ Phantom not found. Install Phantom Extension.";
  }
});
