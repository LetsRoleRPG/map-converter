/// <reference path="converter.d.ts" />

import {WebApp} from "./WebApp";

if (window !== undefined) {
    window.converter = new WebApp();
}