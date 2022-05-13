import {MapConverter} from "./MapConverter";

declare global {
    interface Window {
        MapConverter: MapConverter;
    }
}