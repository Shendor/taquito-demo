import {MichelsonMap, TezosToolkit} from "@taquito/taquito";
import {importKey} from "@taquito/signer";
// import { incrementContract } from '../resources/increment_contract';
import {readFileSync} from 'fs';

const TEZOS_URL = "https://rpc.ghostnet.teztnets.xyz"
const FAUCET_KEY = {
    "pkh": "tz1Wn6x6i8TRxmdXQB2sZ38SYhZ7xCPz5KGV",
    "mnemonic": [
        "siren",
        "hockey",
        "globe",
        "talk",
        "miracle",
        "match",
        "smart",
        "struggle",
        "sting",
        "yard",
        "major",
        "settle",
        "victory",
        "circle",
        "owner"
    ],
    "email": "kgjaieqf.fxwtyylu@teztnets.xyz",
    "password": "wiYhn1igjA",
    "amount": "27392352474",
    "activation_code": "ddbf0ace6151c4ac36953caa0eaee5913369dc40"
};

const main = async (): Promise<any> => {
    const tk: TezosToolkit = new TezosToolkit(TEZOS_URL);

    await importKey(
        tk,
        FAUCET_KEY.email,
        FAUCET_KEY.password,
        FAUCET_KEY.mnemonic.join(' '),
        FAUCET_KEY.activation_code
    );
    // await getBalance(tk, "tz1h3rQ8wBxFd8L9B3d7Jhaawu6Z568XU3xY");
    // await transfer(tk, "tz1h3rQ8wBxFd8L9B3d7Jhaawu6Z568XU3xY");
    // await getBalance(tk, "tz1h3rQ8wBxFd8L9B3d7Jhaawu6Z568XU3xY");
    // await increment(tk, "KT1A3dyvS4pWd9b9yLLMBKLxc6S6G5b58BsK", 3);
    // await deploy(tk);
}

async function getBalance(tk: TezosToolkit, address: string) {
    const balance = await tk.rpc.getBalance(address)

    console.log(`balance: ${balance.toNumber() / 1000000} ꜩ`)
}

async function transfer(tk: TezosToolkit, address: string) {
    const amount = 2;

    console.log(`Transferring ${amount} ꜩ to ${address}...`);
    const t = await tk.contract.transfer({to: address, amount: amount})

    console.log(`Transferred: https://ghost.tzstats.com/${t.hash}`);
}

async function increment(tk: TezosToolkit, address: string, value: number) {
    const contract = await tk.contract.at(address);

    let methods = contract.parameterSchema.ExtractSignatures();
    console.log(JSON.stringify(methods, null, 2));

    let incrementParams = contract.methods.increment(2).toTransferParams();
    console.log(JSON.stringify(incrementParams, null, 2));

    console.log(`Incrementing storage value by ${value}...`);
    let result = await contract.methods.increment(value).send();
    console.log(`Operation injected: https://ghost.tzstats.com/${result.hash}`);

    let storage = await contract.storage();
    console.log(`Smart contract function storage: ${storage}`);
}

async function deploy(tk: TezosToolkit) {
    try {
        const incrementContract = readFileSync('./resources/increment_contract.tz', 'utf-8');
        console.log('Deploying Ligo smart contract: ', incrementContract);
        const op = await tk.contract.originate({
            balance: '1000',
            code: incrementContract,
            init: {int: '0'},
            fee: 30000,
            storageLimit: 50000,
            gasLimit: 90000,
        });

        console.log('Awaiting confirmation...');
        const contract = await op.contract();
        console.log('Contract address', contract.address)
        console.log('Storage', await contract.storage());
        console.log('Operation hash:', op.hash, 'Included in block level:', op.includedInBlock);
    } catch (ex) {
        console.error(ex);
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
