import {Package} from "../Package";
import {ConvertedFile} from "../ConvertedFile";

export abstract class Converter {
    public abstract readonly name: string;

    public abstract import(file: File): Promise<Package>;
    public abstract export(pack: Package): Promise<ConvertedFile[]>;
    public abstract detect(file: File): Promise<boolean>;
}