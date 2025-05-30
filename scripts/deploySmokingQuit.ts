import { toNano } from '@ton/core';
import { SmokingQuit } from '../wrappers/SmokingQuit';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const smokingQuit = provider.open(
        SmokingQuit.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('SmokingQuit')
        )
    );

    await smokingQuit.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(smokingQuit.address);
}
