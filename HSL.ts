module HSL {
    export class HSL{
        hue: number;
        saturation: number;
        lightness: number;
        constructor(hue, saturation, lightness) {
            this.hue = hue;
            this.saturation = saturation;
            this.lightness = lightness;
        }

        toCSSString(): string {
            return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        }

        add(HSLtoAdd: HSL): HSL {
            this.hue += HSLtoAdd.hue;
            this.saturation += HSLtoAdd.saturation;
            this.lightness += HSLtoAdd.lightness;

            return this;
        }

        scalarDivide(scalar: number): HSL {
            this.hue = this.hue / scalar;
            this.saturation = this.saturation / scalar;
            this.lightness = this.lightness / scalar;

            return this;
        }

        scalarMultiply(scalar: number): HSL {
            this.hue = this.hue * scalar;
            this.saturation = this.saturation * scalar;
            this.lightness = this.lightness * scalar;

            return this;
        }
    }   
}
