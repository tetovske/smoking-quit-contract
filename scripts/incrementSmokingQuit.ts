import { Address, toNano } from '@ton/core';
import { SmokingQuit } from '../wrappers/SmokingQuit';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SmokingQuit address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const smokingQuit = provider.open(SmokingQuit.createFromAddress(address));

    // const counterBefore = await smokingQuit.getCounter();
    //
    // await smokingQuit.sendIncrease(provider.sender(), {
    //     increaseBy: 1,
    //     value: toNano('0.05'),
    // });
    //
    // ui.write('Waiting for counter to increase...');
    //
    // let counterAfter = await smokingQuit.getCounter();
    // let attempt = 1;
    // while (counterAfter === counterBefore) {
    //     ui.setActionPrompt(`Attempt ${attempt}`);
    //     await sleep(2000);
    //     counterAfter = await smokingQuit.getCounter();
    //     attempt++;
    // }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
