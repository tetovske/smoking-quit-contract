import {
    Address,
    beginCell,
    TupleItem,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleItemSlice,
    parseTuple
} from '@ton/core';

export type SmokingQuitConfig = {};

export function smokingQuitConfigToCell(config: SmokingQuitConfig): Cell {
    return beginCell().endCell();
}

export const Opcodes = {
    quitSmoking: 0xee250c1b,
    beginSmoking: 0xbfa3821,
};

export class SmokingQuit implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new SmokingQuit(address);
    }

    static createFromConfig(config: SmokingQuitConfig, code: Cell, workchain = 0) {
        const data = smokingQuitConfigToCell(config);
        const init = { code, data };
        return new SmokingQuit(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendQuitSmoking(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            timestamp: number | bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.quitSmoking, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.timestamp, 64)
                .endCell(),
        });
    }

    async sendBeginSmoking(
        provider: ContractProvider,
        via: Sender,
        opts: {
            increaseBy: number;
            value: bigint;
            queryID?: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.beginSmoking, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async getTimestamp(provider: ContractProvider, address: Address) {
        const addr = beginCell().storeAddress(address).endCell();

        const result = (await provider.get('get_timestamp', [{ type: 'slice', cell: addr }])).stack;

        return result.readNumber()
    }
}
