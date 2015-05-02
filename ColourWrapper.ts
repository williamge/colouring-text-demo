
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />

module ColourWrapper {
    export function randomTermGenerator(seed: number): number {

        var random = Math.sin(seed) * 1000000;
        random = random - Math.floor(random);

        return random;
    }

    export function hslFromSeed(seed: number, colourModel: ColourModel.ColourModel) {
        colourModel = colourModel || new ColourModel.ColourModel();
        var randomTerm = randomTermGenerator(seed);
        return new HSL.HSL(
            colourModel.hue(randomTerm),
            colourModel.saturation(randomTermGenerator(randomTerm)),
            colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm)))
            )
    }

    interface sampler {
        (word: string, index: number, context: any, optional?: any): HSL.HSL;
        title ?: string;
    }

    export var baseSamplers = {
        colourFromWord: <sampler> f.n(
            function(word: string, index: number, context: any, optional: any = {}): HSL.HSL {
                optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;

                var totalHSL = word.split('').reduce(
                    function(current, char) {
                        return current.add(
                            hslFromSeed(char.charCodeAt(0), optional.colourModel)
                            );
                    },
                    new HSL.HSL(0, 0, 0)
                    );

                return totalHSL.scalarDivide(word.split('').length);
            }).annotate({
                title: "Colour a word through average random colours of letters"
            }
        ),
        colourFromWordRandom: <sampler> f.n(
            function(word: string, index: number, context: any, optional: any = {}): HSL.HSL {
                optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;

                var wordSeed = word.split('').reduce(
                    function(current, char) {
                        return current + char.charCodeAt(0);
                    },
                    0
                    );

                return hslFromSeed(wordSeed, optional.colourModel);
            }).annotate({
                title: "Colour a word randomly"
            }
        ),
        colourFromVowelsInWord: <sampler> f.n(
            function(word: string, index: number, context: any, optional: any = {}): HSL.HSL {
                optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;

                var vowelsCount = 0;

                var charCounts = word.split('').reduce(
                    function(counting, char) {
                        if (['a', 'e', 'i', 'o', 'u'].indexOf(char.toLowerCase()) === -1) {
                            return counting;
                        }

                        vowelsCount++;

                        if (counting[char] == null || counting[char] == undefined) {
                            counting[char] = 1
                        } else {
                            counting[char] = counting[char] + 1;
                        }
                        return counting;
                    },
                    {}
                    );

                var totalHSL = Object.keys(charCounts).reduce(
                    function(current, char) {
                        return current.add(
                            hslFromSeed(char.charCodeAt(0), optional.colourModel).scalarMultiply(charCounts[char])
                            );
                    },
                    new HSL.HSL(0, 0, 0)
                    );

                return totalHSL.scalarDivide(vowelsCount);
            }).annotate({
                title: "Colour a word from the vowels in the word"
            }
        ),
        colourFromWordRepeatsWeighted: <sampler> f.n(
            function(word: string, index: number, context: any, optional: any = {}): HSL.HSL {
                optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;

                var totalCount = 0;

                var charCounts = word.split('').reduce(
                    function(counting, char) {
                        if (counting[char] == null || counting[char] == undefined) {
                            totalCount += 1;
                            counting[char] = 1
                        } else {
                            totalCount += counting[char];
                            counting[char] = counting[char] + counting[char];
                        }
                        return counting;
                    },
                    {}
                    );

                var totalHSL = Object.keys(charCounts).reduce(
                    function(current, char) {
                        return current.add(
                            hslFromSeed(char.charCodeAt(0), optional.colourModel).scalarMultiply(charCounts[char])
                            );
                    },
                    new HSL.HSL(0, 0, 0)
                    );

                return totalHSL.scalarDivide(totalCount);
            }).annotate({
                title: "Colour a word through average random colours of letters, with repeat letters weighted higher"
            }
            ),
        lightnessFromLength: <sampler> f.n(
            function(word: string, index: number, context: any, optional: any = {}): HSL.HSL {
                let maxLength = 10;
                if (optional.maxLength != null) {
                    maxLength = optional.maxLength;
                }
                if (maxLength > 0) {
                    var lightness = word.length / maxLength;
                    return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
                } else {
                    var lightness = (maxLength - word.length) / maxLength;
                    return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
                }
            }).annotate({
                title: "Shade a word from the length of the word"
            }
        )
    };
}