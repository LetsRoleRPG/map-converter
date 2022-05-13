import {Converter} from "./Converter/Converter";
import {converters} from "./Converters";
import {Package} from "./Package";
import {ConvertedFile} from "./ConvertedFile";
import {ConverterError} from "./ConverterError";

export class MapConverter {

    protected converters: Converter[];

    public constructor() {
        this.initConverters();
    }

    protected initConverters() {
        this.converters = [];

        for (const converterClass of converters) {
            this.converters.push(
                new converterClass()
            )
        }
    }

    public async convert(file: File, from: Converter|string, to: Converter|string): Promise<ConvertedFile[]> {
        let convertFrom: Converter;
        let convertTo: Converter;

        if (typeof from === 'string') {
            convertFrom = this.getConverter(from);
        } else {
            convertFrom = from;
        }

        if (typeof to === 'string') {
            convertTo = this.getConverter(to);
        } else {
            convertTo = to;
        }

        if (!convertFrom) {
            throw new ConverterError("Unable to find a source converter");
        }

        if (!convertTo) {
            throw new ConverterError("Unable to find a target converter");
        }

        const pack: Package = await convertFrom.import(file);

        if (!pack) {
            throw new ConverterError("Unable to parse source file");
        }

        console.log(pack);

        const converted: ConvertedFile[] = await convertTo.export(pack);

        if (!converted || !converted.length) {
            throw new ConverterError("Unable to convert any files");
        }

        return converted;
    }

    public getConverter(name: string): Converter {
        for (const converter of this.converters) {
            if (converter.name === name) {
                return converter;
            }
        }

        return null;
    }

    public async detect(file: File): Promise<Converter> {
        for (const converter of this.converters) {
            const detected: boolean = await converter.detect(file);

            if (detected) {
                return converter;
            }
        }
    }
}