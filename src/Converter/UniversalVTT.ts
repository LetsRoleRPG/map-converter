import {Converter} from "./Converter";
import {Package} from "../Package";
import {ConvertedFile} from "../ConvertedFile";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";

export class UniversalVTT extends Converter {
    public readonly name: string = 'Universal VTT';

    public async import(file: File): Promise<Package> {
        return Promise.resolve({} as Package);
    }

    public async export(pack: Package): Promise<ConvertedFile[]> {
        return Promise.resolve([]);
    }

    public async detect(file: File): Promise<boolean> {
        const ext: string = file.name.split('.').pop().toLowerCase();

        return ext === 'dd2vtt' || ext === 'df2vtt' || ext === 'uvtt';
    }
}