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

export function shouldBehaveLikeUtilities(): void {    
    it("should return contract address and initial balance of zero", async function () {
        const addressToStringMapAddress = await this.addressStringMap.address;
        const balance = await hre.ethers.provider.getBalance(addressToStringMapAddress);
        process.stdout.write(`deployed contract:balance=> ` +
            `${await this.addressStringMap.address}:${balance} (wei)` + `\n`);                
        
        expect(await this.addressStringMap.address);
        expect(balance).to.equal(0);        
    });

    it("should display random wei/eth accounts will transfer", function () {        
        const rndInt = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const rndBn = BigNumber.from(rndInt).mul(10000000);
        const defaultBnWei = BigNumber.from("100000000000000000000000");
        const randomWei = defaultBnWei.sub(rndBn);
        process.stdout.write(`max int:` + `\t` + `${Number.MAX_SAFE_INTEGER}` + `\n`);
        process.stdout.write(`random int:` + `\t` + `${rndInt}` + `\n`);
        process.stdout.write(`default wei:` + `\t` + `${defaultBnWei}` + `\n`);
        process.stdout.write(`random wei:` + `\t` + `${randomWei}` + `\n`);        
    });

    it("should display admin and all unnamed addresses and balances", async function () {
        const adminDeployer = await this.signers.admin;
        process.stdout.write(`(+)` + `\t` + `${await adminDeployer.address}:` +
            `${await hre.ethers.provider.getBalance(await adminDeployer.address)}` + `\n`);
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            process.stdout.write(`(${i})` + `\t` +
                `${await a.address}:${await a.getBalance()} (wei)` +
                `\n`);
        }        
    });
    
    it(`should send random ethers to winner`, async function () {
        const adminDeployer = await this.signers.admin;
        const winner = Math.floor(Math.random() * this.unnamedAccounts.length);
        this.winner = winner;
        process.stdout.write(`\t` + `💸 (${winner}) ${await this.unnamedAccounts[winner].address}` + `\n`);
        process.stdout.write(`(+)` + `\t` + `${await adminDeployer.address}:` +
            `${await hre.ethers.provider.getBalance(await adminDeployer.address)}` + `\n`);
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];            
            const r = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            const b = BigNumber.from(r).mul(100000);
            const s = await (await a.getBalance()).sub(b);            
            const block = await a.sendTransaction({ to: await this.unnamedAccounts[winner].address, value: s });
            const receipt = block.wait();            
        }
                
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            process.stdout.write(`(${i})` + `\t` +
                `${await a.address}:${await a.getBalance()} (wei) ` + `\n`)
        }
    });

    it("should provider spacing after addresses, balances", async function () {
        const zeroAddress = hre.ethers.constants.AddressZero;
        process.stdout.write(`zeroed address:${zeroAddress}` + `\n`);
        expect(process.stdout.write(`this sentence is intentionally uninformative` + `\n`));
    });

    it("should display contract keys", async function () {
        const utility = await this.addressStringMap;        
        false ? await keys(utility) : process.stdout.write(`disabled printing keys` + `\n`);
    });

    it("should populate address-string mapping utility", async function () {
        const utility = await this.addressStringMap;                
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            await utility.add(await a.address, (await a.getBalance()).toString());            
        }                
        process.stdout.write(`size:${await utility.size()}` + `\n`);
        process.stdout.write(`keys:` + `\n`);
        console.log(await utility.getKeys());
        expect(this.unnamedAccounts.length).to.equal(await utility.size());
    });


};
