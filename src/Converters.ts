import {Converter} from "./Converter/Converter";
import {UniversalVTT} from "./Converter/UniversalVTT";
import {EncounterPlus} from "./Converter/EncounterPlus";
import {Foundry} from "./Converter/Foundry";

type ConverterProcessor = {new() : Converter} & (typeof Converter);

export const converters: ConverterProcessor[] = [
    UniversalVTT,
    EncounterPlus,
    Foundry
];