const crypto = require("crypto"), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");
const EC = require("elliptic").ec, ec = new EC("secp256k1");

const MINT_PRIVATE_ADDRESS = "f285e2b2a96eef6034ce46216b06469e24326b16d494bd4c14409cd64ie955a31";
const MINT_KEY_PAIR = ec.keyFromPrivate(MINT_PRIVATE_ADDRESS, "hex");
const MINT_PUBLIC_ADDRESS = MINT_KEY_PAIR.getPublic("hex");

class Block {
    constructor(timestamp = "", data =[]){
        this.timestamp = timestamp;
        this.data = data;
        this.hash = Block.getHash(this);
        this.prevHash = "";
        this.nonce = 0;
    }

    static getHash(block){
        return SHA256(JSON.stringify(block.data) + block.timestamp + block.prevHash + block.nonce);
    }
    mine(difficulty){
        while(!this.hash.startsWith(Array(difficulty + 1).join("0"))){
            this.nonce++;
            this.hash = Block.getHash(this);
        }
    }
    static hasValidTransactions(block, chain){
        let gas = 0, reward = 0;
        block.data.forEach(transaction=>{
            if (transaction.from !== MINT_PUBLIC_ADDRESS){
                gas += transaction.gas;
            }else{
                reward = transaction.amount;
            }
        })
return (
    reward - gas === chain.reward &&
    block.data.every(transaction => Transaction.isValid(transaction, chain)) &&
    block.data.filter(transaction => transaction.from === MINT_PUBLIC_ADDRESS). length === 1
)   };
}

class Blockchain {
    constructor(){
        const initialCoinRelease = new Transaction(MINT_PUBLIC_ADDRESS, holderKeyPair.getPublic("hex"), 100000)
        this.chain = [new Block("", [initialCoinRelease])];
        this.difficulty = 1;
        this.blockTime = 30000;
        this.transactions = [];
        this.reward = 6012;
    }
    getLastblock(){
        return this.chain[this.chain.length - 1];
    }
    getBalance(address){
        let balance = 0;
        this.chain.forEach(block => {
            block.data.forEach(transaction =>{
                if (transaction.from === address){
                    balance -= transaction.amount;
                    balance -= transaction.gas;
                }
                if (transaction.to === address){
                    balance += transaction.amount;
                }
            })
        })
        return balance;
    }
    addBlock(block){
        block.prevHash = this.getLastblock().hash;
        block.hash = Block.getHash(block);

        block.mine(this.difficulty);

        this.difficulty += Date.now() - parseInt(this.getLastblock().timestamp) < this.blocktime ? 1 : -1;

        this.chain.push(block);
    }
    addTransaction(transaction){
        if (transaction.isValid(transaction, this)){
            this.transactions.push(transaction);

        }
    }
    mineTransaction(rewardAddress){
        let gas = 0;

        this.transactions.forEach(transaction => {
            gas += transaction.gas;
        })

        const rewardTransaction = new Transaction(MINT_PUBLIC_ADDRESS, rewardAddress, this.reward + gas);
        rewardTransaction.sign(MINT_KEY_PAIR);


        if (this.transactions.length !== 0) this.addBlock(new Block(Date.now().toString(), [rewardTransaction, ...this.transactions]));
        this.transactions = [];
    }

    static isValid(blockchain){
        for (let i = 1; i < blockchain.chain.length; i++){
            const currentBlock = blockchain.chain[i];
            const prevBlock = blockchain.chain[i-1];

            if (
                currentBlock.has !== Block.getHash(currentBlock) || 
                currentBlock.prevHash !== prevBlock.Hash ||
                !Block.hasValidTransactions(currentBlock, blockchain)
                ){
                return false;
            }
        }
        return true;
    }
}

class Transaction{
    constructor(from, to, amount, gas = 0){
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.gas = gas;
    }
    sign(keyPair){
        if(keyPair.getPublic("hex")=== this.from){
            this.signature = keyPair.sign(SHA256(this.from + this.to + this.amount + this.gas), "base64").toDER("hex");
        }
    }
    static isValid(tx, chain){
        return (
            tx.from &&
            tx.to &&
            tx.amount &&
            (chain.getBalance(tx.from) >= tx.amount + tx.gas || tx. from === MINT_PUBLIC_ADDRESS) &&
            ec.keyFromPublic(tx.from, "hex").verify(SHA256(tx.from + tx.to + tx.amount + tx.gas), tx.signature)
        )
    }
}

const workChain = new Blockchain();

module.exports = { Block, Blockchain, workChain, Transaction}