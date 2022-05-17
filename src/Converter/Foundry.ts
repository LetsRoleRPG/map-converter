import {Converter} from "./Converter";
import {Package} from "../Package";
import {ConvertedFile} from "../ConvertedFile";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";
import {ConverterError} from "../ConverterError";
import {Map} from "../Map";
import {GridType, Media, MediaType} from "../Types";

export class Foundry extends Converter {
    public readonly name: string = 'Foundry';

    public async import(file: File): Promise<Package> {
        let zip: JSZip;
        const pack: Package = new Package();

        return JSZip.loadAsync(file)
            .then((_zip: JSZip) => {
                zip = _zip;

                let moduleFile: JSZipObject;

                zip.forEach((path: string, file: JSZipObject) => {
                    if (path.endsWith('/module.json')) {
                        moduleFile = file;
                    }
                })

                if (!moduleFile) {
                    throw new ConverterError("Cannot find module.json file");
                }

                return moduleFile;
            })
            .then((moduleFile: JSZipObject) => {
                const pathParts: string[] = moduleFile.name.split('/');
                pathParts.pop();

                const baseDir: string = pathParts.join('/');

                return moduleFile.async('string')
                    .then(async (moduleString: string) => {
                        const module: any = JSON.parse(moduleString);

                        if (!module.packs || !Array.isArray(module.packs)) {
                            throw new ConverterError("Unable to find packs inside module");
                        }

                        for (const modulePack of module.packs) {
                            if (modulePack.entity === "Scene") {
                                await this.parseFoundryModulePack(modulePack, zip, baseDir, pack);
                            }
                        }
                    })
            })
            .then(() => {
                return pack;
            })
    }

    protected async parseFoundryModulePack(modulePack: any, zip: JSZip, baseDir: string, pack: Package) {
        const dbFile: JSZipObject = zip.file(baseDir + modulePack.path);

        return dbFile.async('string')
            .then(async (dbString: string) => {
                const mapsData: string[] = dbString.split(`}
{`);

                let n: number = 0;

                for (let mapData of mapsData) {

                    if (n === 0) {
                        mapData += '}';
                    } else if (n === mapsData.length - 1) {
                        mapData = '{' + mapData;
                    } else {
                        mapData = '{' + mapData + '}';
                    }

                    const source: any = JSON.parse(mapData);
                    const map: Map = await this.parseMap(source, zip, baseDir);

                    pack.addMap(map);

                    n++;
                }
            })
            .catch ((e) => {
                console.error(e);
                throw new ConverterError('Unable to parse .db file');
            })

    }

    protected async parseMap(source: any, zip: JSZip, baseDir: string): Promise<Map> {
        console.log(source);
        const map: Map = new Map();

        const fullImagePath: string = decodeURI(source.img);
        const relativeImagePath: string = fullImagePath.split(baseDir).pop();
        const imagePath = baseDir + relativeImagePath;

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

                const media: Media = {
                    x: 0,
                    y: 0,
                    data: await this.blobToBase64(mapImage.blob),
                    type: MediaType.Image,
                    filename: imagePath
                };

                map.addMedia(media);
            })
            .then(() => {
                map.height = source.height;
                map.width = source.width;
                map.title = source.name;

                const transformX = (value: number): number => {
                    return value - map.width * source.padding;
                }

                const transformY = (value: number): number => {
                    return value - map.height * source.padding - 70;
                }

                if (source.backgroundColor) {
                    map.backgroundColor = source.backgroundColor;
                }

                if (source.grid) {
                    map.grid = {
                        enabled: true,
                        size: source.grid,
                        color: source.gridColor,
                        type: source.gridType == 1 ? GridType.Square : GridType.Hex,
                        opacity: source.gridAlpha
                    }
                }

                map.lighting = {
                    enabled: false
                };

                if (source.walls) {
                    map.lighting.enabled = true;
                    map.lighting.walls = [];
                    map.lighting.doors = [];

                    for (let wall of source.walls) {
                        if (wall.door) {
                            map.lighting.doors.push({
                                id: wall._id,
                                x1: transformX(wall.c[0]),
                                y1: transformY(wall.c[1]),
                                x2: transformX(wall.c[2]),
                                y2: transformY(wall.c[3]),
                                closed: wall.ds == 0,
                                gm: true
                            })
                        } else {
                            map.lighting.walls.push({
                                id: wall._id,
                                x1: transformX(wall.c[0]),
                                y1: transformY(wall.c[1]),
                                x2: transformX(wall.c[2]),
                                y2: transformY(wall.c[3]),
                            })
                        }
                    }
                }

                if (source.lights) {
                    map.lighting.enabled = true;
                    map.lighting.lights = [];

                    for (const light of source.lights) {
                        if (light.config.bright > 0) {
                            if (light.config && light.config.type && light.config.type === 'ghost') {
                                continue;
                            }

                            map.lighting.lights.push({
                                id: light._id,
                                x: transformX(light.x),
                                y: transformY(light.y),
                                color: light.config.color,
                                intensity: light.config.luminosity,
                                range: light.config.bright
                            });
                        }
                    }
                }

                return map;
            })
    }

    public async export(pack: Package): Promise<ConvertedFile[]> {
        return Promise.resolve([]);
    }

    public async detect(file: File): Promise<boolean> {
        const ext: string = file.name.split('.').pop().toLowerCase();

        return ext === 'zip';
    }
}

interface MapImage {
    blob: Blob,
    image: HTMLImageElement
}