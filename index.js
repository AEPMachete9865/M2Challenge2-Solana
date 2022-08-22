// Import Solana web3 functinalities
const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const DEMO_FROM_SECRET_KEY = new Uint8Array(
    [
        246, 221, 114, 171,   7,  68,  42, 168, 251, 209,   0,
        142,  50, 222,  50,  70,  63,  21, 103,  46,  32, 138,
         38, 205, 245,  55, 127,  16, 249,  27, 162,  99,  88,
        215, 158, 125, 150, 146, 192, 161, 177, 137, 186, 237,
        169,  83,  86, 149,  39, 127, 175, 245,  58, 165, 239,
         58, 247,  64,  36, 224, 204,  53, 182, 177
      ]            
);

const transferSol = async() => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Get Keypair from Secret Key
    var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

    // Other things to try: 
    // 1) Form array from userSecretKey
    // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
    // 2) Make a new Keypair (starts with 0 SOL)
    // const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to)
    const to = Keypair.generate();

    // Aidrop 2 SOL to Sender wallet
    console.log("Airdopping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        new PublicKey(from.publicKey),
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: fromAirDropSignature
    });

    console.log("Airdrop completed for the Sender account");
    // get wallet balances and identify send amount
    let fromBalance = await connection.getBalance(new PublicKey(from.publicKey)); 
    let toBalance = await connection.getBalance(new PublicKey(to.publicKey)); 
    let fromSend = (fromBalance)/2;
    console.log("From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);
    console.log("To Balance:", parseInt(toBalance)/LAMPORTS_PER_SOL);
    console.log("Sending" ,fromSend/LAMPORTS_PER_SOL);


    // Send money from "from" wallet and into "to" wallet
    var transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: fromSend
        })
    );

    // Sign transaction
    var signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    // check and print final wallet balances
    console.log('Signature is ', signature);
    fromBalance = await connection.getBalance(new PublicKey(from.publicKey)); 
    toBalance = await connection.getBalance(new PublicKey(to.publicKey)); 
    console.log("From Balance:", parseInt(fromBalance)/LAMPORTS_PER_SOL);
    console.log("To Balance:", parseInt(toBalance)/LAMPORTS_PER_SOL);
   
}

transferSol();
