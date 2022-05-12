import {WebApp} from "./WebApp";

declare global {
    interface Window {
        converter: WebApp;
    }
}