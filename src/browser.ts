/// <reference path="browser.d.ts" />

import {MapConverter} from "./MapConverter";


if (window !== undefined) {
    window.MapConverter = new MapConverter();
}