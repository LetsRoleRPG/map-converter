import {Converter} from "./Converter";
import {Package} from "../Package";

export class Module extends Converter {
    public readonly name: string = 'Foundry Module';

    public async import(file: File): Promise<Package> {
        return Promise.resolve({} as Package);
    }

    public async export(pack: Package): Promise<File> {
        return Promise.resolve({} as File);
    }

    public async detect(file: File): Promise<boolean> {
        return Promise.resolve(true);
    }
}