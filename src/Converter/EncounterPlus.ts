import {Converter} from "./Converter";
import {Package} from "../Package";
import {ConvertedFile} from "../ConvertedFile";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";
import {ConverterError} from "../ConverterError";
import {Map} from "../Map";
import {Door, GridType, Light, Lighting, Media, MediaType, Wall} from "../Types";

export class EncounterPlus extends Converter {
    public readonly name: string = 'Encounter+ Module';

    public async import(file: File): Promise<Package> {
        let zip: JSZip;
        const pack: Package = new Package();

        return JSZip.loadAsync(file)
            .then((_zip: JSZip) => {
                zip = _zip;

                let moduleFile: JSZipObject;

                zip.forEach((path: string, file: JSZipObject) => {
                    if (path.endsWith('module.xml')) {
                        moduleFile = file;
                    }
                })

                if (!moduleFile) {
                    throw new ConverterError("Cannot find module.xml file");
                }

                return moduleFile;
            })
            .then((moduleFile: JSZipObject) => {
                return moduleFile.async('string')
                    .then((moduleString: string) => {
                        return (new DOMParser())
                            .parseFromString(moduleString, 'text/xml');
                    })
            })
            .then(async (module: Document) => {
                console.log(module);
                pack.title = this.text(module, 'module > name');
                pack.description = this.text(module, 'module > description');
                pack.filename = file.name;

                const promises: Promise<Map>[] = [];

                module.querySelectorAll('map').forEach((data: HTMLElement) => {
                    promises.push(
                        this.parseMap(data, zip)
                    )
                });

                return Promise.all(promises);
            })
            .then((maps: Map[]) => {
                pack.maps = maps;

                return pack;
            })
    }

    protected text(doc: Document|HTMLElement, path: string): string {
        const elt: any = doc.querySelector(path);

        if (!elt) {
            return null;
        }

        return elt.textContent;
    }

    protected async parseMap(data: HTMLElement, zip: JSZip): Promise<Map> {
        const map: Map = new Map();
        map.title = this.text(data, 'name');

        const size: string = this.text(data, 'gridSize');

        // Parse grid
        if (size) {
            const gridEnabledData: string = this.text(data, 'gridVisible');
            let gridEnabled: boolean = false;

            if (gridEnabledData && gridEnabledData.toLowerCase() == 'yes') {
                gridEnabled = true;
            }

            map.grid = {
                enabled: gridEnabled,
                size: parseFloat(this.text(data, 'gridSize')),
                color: this.text(data, 'gridColor'),
                offset: {
                    x: parseFloat(this.text(data, 'gridOffsetX')),
                    y: parseFloat(this.text(data, 'gridOffsetY'))
                },
                type: this.text(data, 'gridType') === 'square' ? GridType.Square : GridType.Hex
            }
        }

        const lighting: Lighting = {
            enabled: false
        };

        const walls: Wall[] = [];
        const lights: Light[] = [];
        const doors: Door[] = [];

        // Parse walls
        data.querySelectorAll('wall').forEach((wall: HTMLElement) => {
            const data: string = this.text(wall, 'data');
            const type: string = this.text(wall, 'type');
            const points: number[] = data.split(',').map((point: string) => parseFloat(point));
            let n: number = 1;

            for (let i = 0; i < points.length; i += 4) {
                if (type === 'door') {
                    doors.push({
                        id: wall.id + '-' + n.toString(10),
                        x1: points[i],
                        y1: points[i + 1],
                        x2: points[i + 2],
                        y2: points[i + 3],
                        gm: true,
                        closed: true
                    })
                } else {
                    walls.push({
                        id: wall.id + '-' + n.toString(10),
                        x1: points[i],
                        y1: points[i + 1],
                        x2: points[i + 2],
                        y2: points[i + 3]
                    })
                }

                n++;
            }

            lighting.enabled = true;

        });

        // Parse Lights
        data.querySelectorAll('light').forEach((light: HTMLElement) => {
            lights.push({
                id: light.id,
                range: parseFloat(this.text(light, 'radiusMax')),
                x: parseFloat(this.text(light, 'x')),
                y: parseFloat(this.text(light, 'y')),
                color: this.text(light, 'color'),
                intensity: parseFloat(this.text(light, 'opacity'))
            });

            lighting.enabled = true;
        });

        lighting.walls = walls;
        lighting.lights = lights;
        lighting.doors = doors;

        map.lighting = lighting;

        const imagePath: string = this.text(data, 'image');

        if (!imagePath) {
            throw new ConverterError(`Cannot find image for map ${data.id}`);
        }

        return zip.file(imagePath)
            .async("arraybuffer")
            .then((content: ArrayBuffer) => {
                const ext: string = imagePath.split('.').pop().toLowerCase();
                let mime: string;

                switch (ext) {
                    case 'jpg':
                    case 'jpeg':
                        mime = 'image/jpeg';
                        break;
                    case 'png':
                        mime = 'image/png';
                        break;
                    case 'webp':
                        mime = 'image/webp';
                        break;
                    default:
                        mime = 'image/jpeg';
                        break;
                }


                const buffer: Uint8Array = new Uint8Array(content);
                const blob: Blob = new Blob([buffer.buffer], {
                    type: mime
                });

                return new Promise((resolve: Function, reject: Function) => {
                    const img: HTMLImageElement = new Image();

                    img.addEventListener('load', () => {
                        return resolve({
                            blob: blob,
                            image: img
                        });
                    });

                    img.src = URL.createObjectURL(blob);
                })
            })
            .then(async (mapImage: MapImage) => {
                const image: HTMLImageElement = mapImage.image;

                map.width = image.width;
                map.height = image.height;

                const media: Media = {
                    x: 0,
                    y: 0,
                    data: await this.blobToBase64(mapImage.blob),
                    type: MediaType.Image,
                    filename: imagePath
                };

                map.addMedia(media);

                return map;
            })
    }

    public async export(pack: Package): Promise<ConvertedFile[]> {
        return Promise.resolve([]);
    }

    public async detect(file: File): Promise<boolean> {
        const ext: string = file.name.split('.').pop().toLowerCase();

        return ext === 'module';
    }
}

interface MapImage {
    blob: Blob,
    image: HTMLImageElement
}