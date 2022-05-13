import {Converter} from "./Converter/Converter";
import {UniversalVTT} from "./Converter/UniversalVTT";
import {Module} from "./Converter/Module";

type ConverterProcessor = {new() : Converter} & (typeof Converter);

export const converters: ConverterProcessor[] = [
    UniversalVTT,
    Module
];