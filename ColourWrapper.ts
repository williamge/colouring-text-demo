
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

    function annotateFunction(func, annotations: Object): Function {
        let _func = func;
        for (var _annotation in annotations) {
            if (Object.prototype.hasOwnProperty.call(annotations, _annotation)) {
                _func[_annotation] = annotations[_annotation];
            }
        }

        return _func;
    }

    export var baseSamplers = {
        colourFromWord: annotateFunction(
            function(word: string, optional ?: any): HSL.HSL {
                optional = optional || {};
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
            }, {
                title: "Colour a word through average random colours of letters"
            }
        ),
        colourFromWordRandom: annotateFunction(
            function(word: string, optional ?: any): HSL.HSL {
                optional = optional || {};
                optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;

                var wordSeed = word.split('').reduce(
                    function(current, char) {
                        return current + char.charCodeAt(0);
                    },
                    0
                    );

                return hslFromSeed(wordSeed, optional.colourModel);
            }, {
                title: "Colour a word randomly"
            }
        ),
        colourFromVowelsInWord: annotateFunction(
            function(word: string, optional ?: any): HSL.HSL {
                optional = optional || {};
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
            }, {
                title: "Colour a word from the vowels in the word"
            }
        ),
        colourFromWordRepeatsWeighted: annotateFunction(
            function(word: string, optional ?: any): HSL.HSL {
                optional = optional || {};
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
            }, {
                title: "Colour a word through average random colours of letters, with repeat letters weighted higher"
            }
        ),
        lightnessFromLength: annotateFunction(
            function(word: string, maxLength ?: any): HSL.HSL {
                if (maxLength == null) {
                    maxLength = 10;
                }
                if (maxLength > 0) {
                    var lightness = word.length / maxLength;
                    return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
                } else {
                    var lightness = (maxLength - word.length) / maxLength;
                    return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
                }
            }, {
                title: "Shade a word from the length of the word"
            }
        )
    };
}