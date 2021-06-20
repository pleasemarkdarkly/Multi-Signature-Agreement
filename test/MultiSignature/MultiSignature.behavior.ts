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

};
