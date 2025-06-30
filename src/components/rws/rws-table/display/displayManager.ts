import { RWSViewComponent } from "@rws-framework/client";
import type { IDisplayClasses } from "./display.types";

export class DisplayManager {
    private static readonly classes: IDisplayClasses = {
        table: ["table", "table-bordered"],
        thead: ["thead-light"],
        tbody: [],
        tr: [],
        th: [],
        td: [],
        actionsTh: [],
        actionsTd: ["text-right"],
        card: ["card", "card-body"],
        alert: ["alert", "alert-info"],
        button: ["btn", "btn-sm"],
    };

    constructor(private componentClass: typeof RWSViewComponent) {}

    getClass(key: string): string {
        const classes = DisplayManager.classes[key];
        return classes ? classes.join(" ") : "";
    }
}