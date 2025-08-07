// … your imports …

window.addEventListener("DOMContentLoaded", async () => {
  // … phantom detection & connect button wiring …

  deployBtn.addEventListener("click", async () => {
    statusDiv.innerText = "Status: deploying token…";
    try {
      // ← USE A CORS-FRIENDLY RPC URL HERE
      const RPC_URL = "https://rpc.ankr.com/solana";
      const conn    = new Connection(RPC_URL, "confirmed");

      // 1) create the mint
      const mint = await createMint(
        conn,
        provider,
        walletPubkey,
        null,
        9
      );

      // 2) get founder ATA
      const ata = await getOrCreateAssociatedTokenAccount(
        conn,
        provider,
        mint,
        new PublicKey(FOUNDER_ADDRESS)
      );

      // 3) mint founder supply
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
