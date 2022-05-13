import {Map} from "./Map";

export class Package {
    public title: string;
    public description?: string;
    public filename?: string;
    public maps: Map[] = [];

    public addMap(map: Map): Package {
        this.maps.push(map);

        return this;
    }
}