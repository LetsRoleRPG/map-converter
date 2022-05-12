import {Grid, Lighting, Media} from "./Types";

export class Map {
    public width: number;
    public height: number;
    public grid?: Grid;
    public medias?: Media[];
    public lighting?: Lighting;
}