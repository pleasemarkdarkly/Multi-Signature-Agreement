/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import hre from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export const keys = async (obj: any) => {
    Object.keys(obj).toString().split(`,`)
        .forEach(p => { process.stdout.write(`${p}` + `\n`); })
}

const NUM_CONFIRMATIONS = 3;
const NUM_PARTIES = 5;

export function shouldBehaveLikeMultiSignatureV2(): void {    
    it("should return MultiSignature contract constructor initial state", async function () {
        const msAddress = await this.multiSignatureV2.address;
        const msBalance = await hre.ethers.provider.getBalance(msAddress);
        process.stdout.write(`deployed multiSig contract to => ` +
            `${await this.multiSignatureV2.address}:${msBalance} (wei)` + `\n`);
        process.stdout.write(`deployed random contract to => ` +
            `${await this.randomContract.address}:${await hre.ethers.provider.getBalance(this.randomContract.address)} (wei)` + `\n`);
        
        expect(await this.multiSignatureV2.address);
        expect(msBalance).to.equal(0);
    });

    it("should display other unnamed addresses and balances", async function () {
        process.stdout.write(`(+)` + `\t` +
            `${await this.signers.admin.address}:` +
            `${await hre.ethers.provider.getBalance(await this.signers.admin.address)}` + `\n`);
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            process.stdout.write(`(${i})` + `\t` +
                ` ${await a.address}:${await a.getBalance()}` + `\n`);
        }        
    });

    it(`should initialize multisignature contract with ${NUM_PARTIES} members ` +
        `and requirement of ${NUM_CONFIRMATIONS} of ${NUM_PARTIES} approvals`, async function () {
        const [one, two, three, four, five] = this.unnamedAccounts;
        const multiSigners = [
            await one.address,
            await two.address,
            await three.address,
            await four.address,
            await five.address
        ];
        await this.multiSignatureV2.initialize(multiSigners, NUM_CONFIRMATIONS);
        this.multiSigners = multiSigners;
    });

    it("should verify owners", async function () {
        let count = 0;
        const multiSignatureOwners = await this.multiSignatureV2.getOwners();
        this.multiSigners.forEach((s: any) => {
            process.stdout.write(`(${count})` + `\t` + `${s}` +
                ` == ` +
                `${multiSignatureOwners[count]}` + `\n`);
            expect(s).to.equal(multiSignatureOwners[count]);
            count++;            
        });                
    });

    it("should verify multisignature transaction count and num confirmations", async function () {
        expect(await this.multiSignatureV2.getTransactionCount()).to.equal(0);
        expect(await this.multiSignatureV2.numConfirmationsRequired()).to.equal(NUM_CONFIRMATIONS);
    });

    it("should verify multisignature properties", async function () {
        expect(await this.multiSignatureV2.attorney()).to.equal("reed@yurchaklaw.com");
        expect(await this.multiSignatureV2.author()).to.equal("mark.phillips@gmail.com");
    });

    it(`should verify ${NUM_PARTIES} owners sending ethers to contract`, async function () {
        let count = 0;        
        let randomInt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const ethers = BigNumber.from(randomInt).mul(100000);
        for (let i = 0; i < this.multiSigners.length; i++){
            const s = this.multiSigners[i];            
            this.multiSignatureV2.deposit({ value: ethers });            
            process.stdout.write(`(${count})` + `\t` + `${s}:` +
                `${await hre.ethers.provider.getBalance(s)}` + `\n`);            
            count++;
        };        
    });

    it("should verify contract balance", async function () {
        const multiSignatureBalance = await hre.ethers.provider.getBalance(await this.multiSignatureV2.address);
        process.stdout.write(`\t` + `${await this.multiSignatureV2.address}:${multiSignatureBalance} (wei)` + `\n`);
        expect(multiSignatureBalance).to.not.equal(0);
    })

    it("should submit external contract calling transaction data", async function () {
        const randomOwner = Math.floor(Math.random() * this.multiSigners.length);
        const to = await this.multiSigners[randomOwner];        
        const data = await this.randomContract.generateExternalCallData();
        const defaultGas = 20000;
        const defaultBalance = hre.ethers.constants.Zero;
        const isOwner = await this.multiSignatureV2.isOwner(to);
        process.stdout.write(`\t` + `${to}:` + `\n` + 
            `\t` + `data:${data}` + `\n`);
        await this.multiSignatureV2.connect(await this.unnamedAccounts[0]).submitTransaction(to, defaultBalance, data);
    });
    
    it("should verify pending transaction", async function () {
        process.stdout.write(`\t` + `transaction count:${await this.multiSignatureV2.getTransactionCount()}` + `\n`);
        expect(await this.multiSignatureV2.getTransactionCount()).to.equal(1);
    });

    it("should verify multisignature properties", async function () {        
        expect(await this.multiSignatureV2.getTransactionCount()).to.equal(1);
        process.stdout.write(`\t` + `transaction count:${await this.multiSignatureV2.getTransactionCount()}` + `\n`);
        process.stdout.write(`\t` + `num confirmations:${await this.multiSignatureV2.numConfirmationsRequired()}` + `\n`);
        const owners = await this.multiSignatureV2.getOwners();
        process.stdout.write(`\t` + `owners:` + `\n`);
        let count = 0;
        owners.forEach((o: any) => {
            process.stdout.write(`\t` + `(${count}) ${o}` + `\n`);
            count++;
        });
    });
    
    it("should verify random contract internal_value initial state", async function () {
        let iv = await this.randomContract.internal_value();
        process.stdout.write(`\t 1. ` + `${iv}` + `\n`);
        expect(await this.randomContract.internal_value()).to.equal(0);
        expect(await this.randomContract.initialize());
        expect(await this.randomContract.internal_value()).to.equal(1);
        iv = await this.randomContract.internal_value();        
        process.stdout.write(`\t 2. ` + `${iv}` + `\n`);        
        const ivv = await this.randomContract.addition(4444);
        iv = await this.randomContract.internal_value();
        process.stdout.write(`\t 3. ` + `${iv}` + `\n`);
        /*
        expect(await this.randomContract.clearValue());
        expect(await this.randomContract.internal_value()).to.equal(0);
        iv = await this.randomContract.internal_value();
        process.stdout.write(`\t 4. ` + `${iv}` + `\n`);
        */
    });


    it("should verify and confirm the transaction", async function () {
        const txIndex = await this.multiSignatureV2.getTransactionCount() - 1;
        let count = 0;
        let confirmations = NUM_CONFIRMATIONS;
        for (let i = 0; i < this.multiSigners.length && confirmations !== 0; i++) {
            const s = this.multiSigners[i];            
            await this.multiSignatureV2.connect(await this.unnamedAccounts[i]).confirmTransaction(txIndex);
            process.stdout.write(`(${count})` + `\t` + `${s}:` + `${await hre.ethers.provider.getBalance(s)}:(CONFIRM TX)` + `\n`);
            count++;
            confirmations--;
        };
    });

    it("should verify transaction details", async function () {
        const index = await this.multiSignatureV2.getTransactionCount() -1;
        const [address, value, bytes, executed, confirmations] =
            await this.multiSignatureV2.connect(await this.unnamedAccounts[0]).getTransaction(index);
        process.stdout.write(`\t` + `${address}:${value} (${confirmations})` + `\n` + `\t` + `(${bytes}):${executed}` + `\n`);
        expect(confirmations).to.equal(NUM_CONFIRMATIONS);
        expect(executed).to.equal(false);
    });
    
    
    it("should execute transaction", async function () {
        const index = await this.multiSignatureV2.getTransactionCount() - 1;
        const block = await this.multiSignatureV2.connect(await this.unnamedAccounts[0]).executeTransaction(index);
        const receipt = await block.wait();        
        const { events } = receipt;
        
        process.stdout.write(`\t randomContract internal_value:` + `${await this.randomContract.internal_value()}` + `\n`);
        
        // FIXME:        
        // console.log(receipt);

        events.forEach((e: any) => {
            process.stdout.write(`\t` + `${e.eventSignature}` + `\n`);
        });

        expect(events[0].event).to.equal("ExecuteTransaction");
        expect(events[0].args.owner).to.equal(await this.unnamedAccounts[0].address);
        expect(events[0].args.txIndex).to.equal(index);                
    });


    it("should update random contract internal property", async function () {                
        process.stdout.write(`\t randomContract internal_value:` + `${await this.randomContract.internal_value()}` + `\n`);
    });
    
};
