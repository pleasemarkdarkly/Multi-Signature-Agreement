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

export function shouldBehaveLikeMultiSignature(): void {    
    it("should return MultiSignature contract constructor initial state", async function () {
        const msAddress = await this.multiSignature.address;
        const msBalance = await hre.ethers.provider.getBalance(msAddress);
        process.stdout.write(`deployed contract to => ` +
            `${await this.multiSignature.address}:${msBalance} (wei)` + `\n`);        
        expect(await this.multiSignature.address);
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

    it("should initialize multisignature contract with 5 members and requirement of 3 of 5 approvals", async function () {        
        const [one, two, three, four, five] = this.unnamedAccounts;
        const multiSigners = [
            await one.address,
            await two.address,
            await three.address,
            await four.address,
            await five.address
        ];
        await this.multiSignature.initialize(multiSigners, NUM_CONFIRMATIONS);
        this.multiSigners = multiSigners;
    });

    it("should verify owners", async function () {
        let count = 0;
        const multiSignatureOwners = await this.multiSignature.getOwners();
        this.multiSigners.forEach((s: any) => {
            process.stdout.write(`(${count})` + `\t` + `${s}` +
                ` == ` +
                `${multiSignatureOwners[count]}` + `\n`);
            expect(s).to.equal(multiSignatureOwners[count]);
            count++;            
        });                
    });

    it("should verify multisignature transaction count and num confirmations", async function () {
        expect(await this.multiSignature.getTransactionCount()).to.equal(0);
        expect(await this.multiSignature.numConfirmationsRequired()).to.equal(NUM_CONFIRMATIONS);
    });

    it("should verify multisignature properties", async function () {
        expect(await this.multiSignature.attorney()).to.equal("reed@yurchaklaw.com");
        expect(await this.multiSignature.author()).to.equal("mark.phillips@gmail.com");
    });

    // it("should verify failed multisignature property reads", async function () { });

    it("should send 10-50 ethers to multisignature contract", async function () {
        let count = 0;
        let randomEthers = Math.floor(Math.random() * 50);                
        for (let i = 0; i < this.multiSigners.length; i++){
            const s = this.multiSigners[i];
            let sendToContract = await hre.ethers.utils.parseEther(randomEthers.toString());
            this.multiSignature.deposit({ value: sendToContract });            
            process.stdout.write(`(${count})` + `\t` + `${s}:` +
                `${await hre.ethers.provider.getBalance(s)}` + `\n`);            
            count++;
        };        
    });

    it("should verify multiSignature contract balance", async function () {
        const multiSignatureBalance = await hre.ethers.provider.getBalance(await this.multiSignature.address);
        process.stdout.write(`\t` + `${await this.multiSignature.address}:${multiSignatureBalance} (wei)` + `\n`);
        expect(multiSignatureBalance).to.not.equal(0);
    })

    it("should randomly pick an owner to pay ether - submit transaction", async function () {
        const randomOwner = Math.floor(Math.random() * this.multiSigners.length);
        const to = await this.multiSigners[randomOwner];        
        const data = "0x543209b700000000000000000000000000000000000000000000000000038d7c3f041040";        
        const defaultGas = 20000;
        const multiSignatureBalance = await (await hre.ethers.provider.getBalance(await this.multiSignature.address)).sub(defaultGas);
        const isOwner = await this.multiSignature.isOwner(to);
        process.stdout.write(`\t` + `${to}` + `(${isOwner}):${multiSignatureBalance}` + `\n`);        
        await this.multiSignature.connect(await this.unnamedAccounts[0]).submitTransaction(to, multiSignatureBalance, data);
    });

    it("should verify pending transaction", async function () {
        process.stdout.write(`\t` + `transaction count:${await this.multiSignature.getTransactionCount()}` + `\n`);
        expect(await this.multiSignature.getTransactionCount()).to.equal(1);
    });
    
    it("should verify and confirm the transaction", async function () {
        const txIndex = await this.multiSignature.getTransactionCount() - 1;
        let count = 0;
        let confirmations = NUM_CONFIRMATIONS;
        for (let i = 0; i < this.multiSigners.length && confirmations !== 0; i++) {
            const s = this.multiSigners[i];            
            await this.multiSignature.connect(await this.unnamedAccounts[i]).confirmTransaction(txIndex);
            process.stdout.write(`(${count})` + `\t` + `${s}:` + `${await hre.ethers.provider.getBalance(s)}:(CONFIRM TX)` + `\n`);
            count++;
            confirmations--;
        };
    });

    it("should verify transaction details", async function () {
        const index = await this.multiSignature.getTransactionCount() -1;
        const [address, value, bytes, executed, confirmations] =
            await this.multiSignature.connect(await this.unnamedAccounts[0]).getTransaction(index);
        process.stdout.write(`\t` + `${address}:${value}(${confirmations})` + `\n` + `\t` + `(${bytes}):${executed}` + `\n`);
        expect(confirmations).to.equal(NUM_CONFIRMATIONS);
        expect(executed).to.equal(false);
    });
    
    it("should execute transaction", async function () {
        const index = await this.multiSignature.getTransactionCount() - 1;
        const block = await this.multiSignature.connect(await this.unnamedAccounts[0]).executeTransaction(index);
        const receipt = await block.wait();        
        const { events } = receipt;
        expect(events[0].event).to.equal("ExecuteTransaction");
        expect(events[0].args.owner).to.equal(await this.unnamedAccounts[0].address);
        expect(events[0].args.txIndex).to.equal(index);        
    });
};
