import {Converter} from "./Converter/Converter";
import {UniversalVTT} from "./Converter/UniversalVTT";
import {Module} from "./Converter/Module";

type MapConverter = {new() : Converter} & (typeof Converter);

export const converters: MapConverter[] = [
    UniversalVTT,
    Module
];