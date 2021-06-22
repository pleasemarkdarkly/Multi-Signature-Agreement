import { BigNumber } from "ethers";

export const UTILITIES = false;
export const LOTTERY = false;
export const MULTISIGNATURE = false;
export const MULTISIGNATUREV2 = true;

(async () => {
    
    process.stdout.write(`\n`);
    
    (!UTILITIES) ? process.stdout.write(`Utilities test harness disabled` + `\n`) : null;
    (!LOTTERY) ? process.stdout.write(`Lottery test harness disabled` + `\n`) : null;
    (!MULTISIGNATURE) ? process.stdout.write(`MultiSignature test harness disabled` + `\n`) : null;
        
    process.stdout.write(`\n`);

})();
