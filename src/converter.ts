/// <reference path="converter.d.ts" />

import {MapConverter} from "./MapConverter";

if (window !== undefined) {
    window.MapConverter = new MapConverter();
} else {
    console.error('The map converter can only be used in the browser');
}