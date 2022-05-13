import {Converter} from "./Converter";
import {Package} from "../Package";
import {ConvertedFile} from "../ConvertedFile";
import {Map} from "../Map";
import {Door, Light, Position, Wall} from "../Types";
import {ConverterError} from "../ConverterError";

export class UniversalVTT extends Converter {
    public readonly name: string = 'Universal VTT';

    public async import(file: File): Promise<Package> {
        return Promise.resolve({} as Package);
    }

    public async export(pack: Package): Promise<ConvertedFile[]> {
        const files: ConvertedFile[] = [];

        pack.maps.forEach((map: Map) => {
            console.log(map);

            const fileData: any = {
                version: 0.2
            };

            let size: number;

            if (map.grid) {
                size = map.grid.size;
            } else {
                size = 140;
            }

            fileData.resolution = {
                map_origin: {
                    x: 0,
                    y: 0
                },
                map_size: {
                    x: map.width / size,
                    y: map.height / size
                },
                pixels_per_grid: size
            };

            fileData.line_of_sight = [];
            fileData.portals = [];
            fileData.lights = [];

            if (map.lighting && map.lighting.walls) {
                map.lighting.walls.forEach((wall: Wall) => {
                    fileData.line_of_sight.push(
                        [{
                            x: wall.x1 / size,
                            y: wall.y1 / size
                        }, {
                            x: wall.x2 / size,
                            y: wall.y2 / size
                        }]
                    )
                });
            }

            if (map.lighting && map.lighting.doors) {
                map.lighting.doors.forEach((door: Door) => {
                    const center: Position = {
                        x: (door.x1 + door.x2) / 2,
                        y: (door.y1 + door.y2) / 2
                    };

                    fileData.portals.push({
                        position: {
                            x: center.x / size,
                            y: center.y / size
                        },
                        bounds: [{
                            x: door.x1 / size,
                            y: door.y1 / size
                        }, {
                            x: door.x2 / size,
                            y: door.y2 / size
                        }],
                        closed: door.closed
                    })
                });
            }

            if (map.lighting && map.lighting.lights) {
                map.lighting.lights.forEach((light: Light) => {
                    fileData.lights.push({
                        position: {
                            x: light.x / size,
                            y: light.y / size
                        },
                        range: light.range,
                        intensity: light.intensity,
                        color: light.color.replace('#', 'ff')
                    })
                })
            }

            if (map.medias && map.medias.length) {
                fileData.image = map.medias[0].data;
            }

            const file: ConvertedFile = new ConvertedFile();
            file.title = map.title;
            file.data = new Blob([JSON.stringify(fileData)], {
                type: "application/json"
            });

            files.push(file);
        });

        return files;
    }

    public async detect(file: File): Promise<boolean> {
        const ext: string = file.name.split('.').pop().toLowerCase();

        return ext === 'dd2vtt' || ext === 'df2vtt' || ext === 'uvtt';
    }
}