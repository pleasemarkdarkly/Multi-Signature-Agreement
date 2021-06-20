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
        const aTsMBalance = await hre.ethers.provider.getBalance(addressToStringMapAddress);
        process.stdout.write(`deployed contract:balance=> ` +
            `${await this.addressStringMap.address}:${aTsMBalance} (wei)` + `\n`);                
        expect(await this.addressStringMap.address);
        expect(aTsMBalance).to.equal(0);        
    });

    it("should display admin and all unnamed addresses and balances", async function () {
        const adminDeployer = await this.signers.admin;
        process.stdout.write(`(+)` + `\t` + `${await adminDeployer.address}:` +
            `${await hre.ethers.provider.getBalance(await adminDeployer.address)}` + `\n`);
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            process.stdout.write(`(${i})` + `\t` +
                `${await a.address}:${await a.getBalance()}` +
                `\n`);
        }        
    });

    it("should provider spacing after addresses, balances", async function () {
        expect(process.stdout.write(`this sentence is intentionally uninformative` + `\n`));
    });

    it("should load contract by printing its keys", async function () {
        const utility = await this.addressStringMap;        
        await keys(utility);
        // process.stdout.write(`\n`);
        // await keys(utility.functions);
    });

    it("should populate address-uint mapping utility", async function () {
        const utility = await this.addressStringMap;                
        for (let i = 0; i < this.unnamedAccounts.length; i++) {
            const a: SignerWithAddress = this.unnamedAccounts[i];
            await utility.add(await a.address, (await a.getBalance()).toString());            
        }
                
        process.stdout.write(`total contents:${await utility.size()}` + `\n`);
        process.stdout.write(`get keys:` + `\n`);
        console.log(await utility.getKeys());
    });


};
