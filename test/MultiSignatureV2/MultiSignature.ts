import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { Signers } from "../../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MULTISIGNATUREV2  } from "..";
import { MultiSignatureAgreementV2 } from "../../typechain/MultiSignatureAgreementV2";
import { RandomContract } from "../../typechain/RandomContract"
import { shouldBehaveLikeMultiSignatureV2 } from "./MultiSignatureV2.behavior";

const { deployContract } = hre.waffle;

describe("Setup Contract Admin and Unnamed Accounts", function () {
    before(async function () {
        this.signers = {} as Signers;
        const signers: SignerWithAddress[] = await hre.ethers.getSigners();
        this.signers.admin = signers[0];
        this.unnamedAccounts = [] as Signers[];
        for (let i = 1; i <= (signers.length - 1); i++) {
            const unnamedAccount: SignerWithAddress = signers[i];
            this.unnamedAccounts.push(unnamedAccount);
        }
    });

    describe("Creating MultiSignature, Random Contract", function () {
        before(async function () {
            const multiSignatureV2Artifact: Artifact =
                await hre.artifacts.readArtifact("MultiSignatureAgreementV2");
            this.multiSignatureV2 =
                <MultiSignatureAgreementV2>await deployContract(
                    this.signers.admin, multiSignatureV2Artifact, []);
            const randomContractArtifact: Artifact =
                await hre.artifacts.readArtifact("RandomContract");
            this.randomContract =
                <RandomContract>await deployContract(
                    this.signers.admin, randomContractArtifact, []);
        });

        

        MULTISIGNATUREV2 && shouldBehaveLikeMultiSignatureV2();
    });
});
