import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SmokingQuit } from '../wrappers/SmokingQuit';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SmokingQuit', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SmokingQuit');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let smokingQuit: SandboxContract<SmokingQuit>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        smokingQuit = blockchain.openContract(
            SmokingQuit.createFromConfig(
                {},
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await smokingQuit.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: smokingQuit.address,
            deploy: true,
            success: true,
        });
    });

    it('should save timestamp', async () => {
        const treasury = await blockchain.treasury('treasury');
        const unixTs = Date.now()

        const quitResult = await smokingQuit.sendQuitSmoking(treasury.getSender(), {
            value: toNano('0.05'),
            timestamp: unixTs,
        });

        expect(quitResult.transactions).toHaveTransaction({
            from: treasury.address,
            to: smokingQuit.address,
            success: true,
        });

        const savedTimestamp = await smokingQuit.getTimestamp(treasury.address);
        console.log('saved timestamp', savedTimestamp);

        expect(savedTimestamp).toBe(unixTs);
    });
});
