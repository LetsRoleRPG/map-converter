import {Package} from "../Package";

export abstract class Converter {
    public abstract readonly name: string;

    public abstract import(file: File): Promise<Package>;
    public abstract export(pack: Package): Promise<File>;
    public abstract detect(file: File): Promise<boolean>;
}