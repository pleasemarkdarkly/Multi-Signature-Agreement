import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { Signers } from "../../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MULTISIGNATURE  } from "..";
import { MultiSignatureAgreement } from "../../typechain/MultiSignatureAgreement"
import { shouldBehaveLikeMultiSignature } from "./MultiSignature.behavior";

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

    describe("Creating MultiSignature Contract", function () {
        before(async function () {
            const multiSignatureArtifact: Artifact =
                await hre.artifacts.readArtifact("MultiSignatureAgreement");
            this.multiSignature =
                <MultiSignatureAgreement>await deployContract(
                    this.signers.admin, multiSignatureArtifact, []);
        });

        MULTISIGNATURE && shouldBehaveLikeMultiSignature();
    });
});
