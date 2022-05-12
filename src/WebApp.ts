import {Converter} from "./Converter/Converter";
import {converters} from "./Converters";

export class WebApp {

    protected converters: Converter[];

    public constructor() {
        this.initConverters();

        const file: File = new File([], 'map.module');

        this.process(file)
            .then((res: any) => {
                console.log(res);
            })
    }

    protected initConverters() {
        this.converters = [];

        for (const converterClass of converters) {
            this.converters.push(
                new converterClass()
            )
        }
    }

    public async process(file: File) {
        for (const converter of this.converters) {
            const detected: boolean = await converter.detect(file);

            if (detected) {
                return converter.name;
            }
        }
    }
}