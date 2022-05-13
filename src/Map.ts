import {Grid, Lighting, Media} from "./Types";

export class Map {
    public title?: string;
    public description?: string;
    public authors?: string[];
    public url?: string;
    public width: number;
    public height: number;
    public grid?: Grid;
    public medias?: Media[];
    public lighting?: Lighting;

    public addMedia(media: Media): Map {
        if (!this.medias) {
            this.medias = [];
        }

        this.medias.push(media);

        return this;
    }
}