var f;
(function (f) {
    var _fn = (function () {
        function _fn(obj) {
            this._target = obj;
        }
        _fn.prototype.forEach = function (cb) {
            return Array.prototype.forEach.call(this._target, cb);
        };
        _fn.prototype.map = function (cb) {
            return Array.prototype.map.call(this._target, cb);
        };
        _fn.prototype.some = function (cb) {
            return Array.prototype.some.call(this._target, cb);
        };
        _fn.prototype.constructAPI = function () {
            return Array.prototype.reduce.call(this._target, function (api, currentWidget) {
                Object.keys(currentWidget.modifiers).forEach(function (currentModifier) {
                    api[currentModifier] = currentWidget.modifiers[currentModifier];
                });
                return api;
            }, {});
        };
        _fn.prototype.annotate = function (annotations) {
            var _this = this;
            Object.keys(annotations).forEach(function (_annotation) {
                _this._target[_annotation] = annotations[_annotation];
            });
            return this._target;
        };
        return _fn;
    })();
    function n(obj) {
        return new _fn(obj);
    }
    f.n = n;
})(f || (f = {}));
var HSL;
(function (HSL_1) {
    var HSL = (function () {
        function HSL(hue, saturation, lightness) {
            this.hue = hue;
            this.saturation = saturation;
            this.lightness = lightness;
        }
        HSL.prototype.toCSSString = function () {
            return "hsl(" + this.hue + ", " + this.saturation + "%, " + this.lightness + "%)";
        };
        HSL.prototype.add = function (HSLtoAdd) {
            this.hue += HSLtoAdd.hue;
            this.saturation += HSLtoAdd.saturation;
            this.lightness += HSLtoAdd.lightness;
            return this;
        };
        HSL.prototype.scalarDivide = function (scalar) {
            this.hue = this.hue / scalar;
            this.saturation = this.saturation / scalar;
            this.lightness = this.lightness / scalar;
            return this;
        };
        HSL.prototype.scalarMultiply = function (scalar) {
            this.hue = this.hue * scalar;
            this.saturation = this.saturation * scalar;
            this.lightness = this.lightness * scalar;
            return this;
        };
        return HSL;
    })();
    HSL_1.HSL = HSL;
})(HSL || (HSL = {}));
var ColourModel;
(function (ColourModel_1) {
    function changeRange(value, originalRange, newRange) {
        newRange = newRange || [0, 1];
        var baselineValue = (value - originalRange[0]) / (originalRange[1] - originalRange[0]);
        return (newRange[1] - newRange[0]) * baselineValue + newRange[0];
    }
    ColourModel_1.changeRange = changeRange;
    var ColourModel = (function () {
        function ColourModel(mappings) {
            mappings = mappings || {};
            if (mappings.hue) {
                this.hue = mappings.hue;
            }
            if (mappings.saturation) {
                this.saturation = mappings.saturation;
            }
            if (mappings.lightness) {
                this.lightness = mappings.lightness;
            }
        }
        ColourModel.prototype.hue = function (term) {
            return changeRange(term, [0, 1], [0, 360]);
        };
        ColourModel.prototype.saturation = function (term) {
            return changeRange(term, [0, 1], [0, 100]);
        };
        ColourModel.prototype.lightness = function (term) {
            return changeRange(term, [0, 1], [0, 100]);
        };
        return ColourModel;
    })();
    ColourModel_1.ColourModel = ColourModel;
    ColourModel_1.baseColourModels = {
        plain: new ColourModel({
            hue: function (term) {
                return changeRange(term, [0, 1], [0, 360]);
            },
            saturation: function (term) {
                return changeRange(term, [0, 1], [35, 45]);
            },
            lightness: function (term) {
                return changeRange(term, [0, 1], [75, 85]);
            }
        }),
        greyscale: new ColourModel({
            hue: function (term) {
                return changeRange(term, [0, 1], [0, 0]);
            },
            saturation: function (term) {
                return changeRange(term, [0, 1], [0, 0]);
            },
            lightness: function (term) {
                return changeRange(term, [0, 1], [0, 100]);
            }
        })
    };
})(ColourModel || (ColourModel = {}));
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
var ColourWrapper;
(function (ColourWrapper) {
    function randomTermGenerator(seed) {
        var random = Math.sin(seed) * 1000000;
        random = random - Math.floor(random);
        return random;
    }
    ColourWrapper.randomTermGenerator = randomTermGenerator;
    function hslFromSeed(seed, colourModel) {
        colourModel = colourModel || new ColourModel.ColourModel();
        var randomTerm = randomTermGenerator(seed);
        return new HSL.HSL(colourModel.hue(randomTerm), colourModel.saturation(randomTermGenerator(randomTerm)), colourModel.lightness(randomTermGenerator(randomTermGenerator(randomTerm))));
    }
    ColourWrapper.hslFromSeed = hslFromSeed;
    ColourWrapper.baseSamplers = {
        colourFromWord: f.n(function (word, index, context, optional) {
            if (optional === void 0) { optional = {}; }
            optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;
            var totalHSL = word.split('').reduce(function (current, char) {
                return current.add(hslFromSeed(char.charCodeAt(0), optional.colourModel));
            }, new HSL.HSL(0, 0, 0));
            return totalHSL.scalarDivide(word.split('').length);
        }).annotate({
            title: "Colour a word through average random colours of letters"
        }),
        colourFromWordRandom: f.n(function (word, index, context, optional) {
            if (optional === void 0) { optional = {}; }
            optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;
            var wordSeed = word.split('').reduce(function (current, char) {
                return current + char.charCodeAt(0);
            }, 0);
            return hslFromSeed(wordSeed, optional.colourModel);
        }).annotate({
            title: "Colour a word randomly"
        }),
        colourFromVowelsInWord: f.n(function (word, index, context, optional) {
            if (optional === void 0) { optional = {}; }
            optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;
            var vowelsCount = 0;
            var charCounts = word.split('').reduce(function (counting, char) {
                if (['a', 'e', 'i', 'o', 'u'].indexOf(char.toLowerCase()) === -1) {
                    return counting;
                }
                vowelsCount++;
                if (counting[char] == null || counting[char] == undefined) {
                    counting[char] = 1;
                }
                else {
                    counting[char] = counting[char] + 1;
                }
                return counting;
            }, {});
            var totalHSL = Object.keys(charCounts).reduce(function (current, char) {
                return current.add(hslFromSeed(char.charCodeAt(0), optional.colourModel).scalarMultiply(charCounts[char]));
            }, new HSL.HSL(0, 0, 0));
            return totalHSL.scalarDivide(vowelsCount);
        }).annotate({
            title: "Colour a word from the vowels in the word"
        }),
        colourFromWordRepeatsWeighted: f.n(function (word, index, context, optional) {
            if (optional === void 0) { optional = {}; }
            optional.colourModel = optional.colourModel || ColourModel.baseColourModels.plain;
            var totalCount = 0;
            var charCounts = word.split('').reduce(function (counting, char) {
                if (counting[char] == null || counting[char] == undefined) {
                    totalCount += 1;
                    counting[char] = 1;
                }
                else {
                    totalCount += counting[char];
                    counting[char] = counting[char] + counting[char];
                }
                return counting;
            }, {});
            var totalHSL = Object.keys(charCounts).reduce(function (current, char) {
                return current.add(hslFromSeed(char.charCodeAt(0), optional.colourModel).scalarMultiply(charCounts[char]));
            }, new HSL.HSL(0, 0, 0));
            return totalHSL.scalarDivide(totalCount);
        }).annotate({
            title: "Colour a word through average random colours of letters, with repeat letters weighted higher"
        }),
        lightnessFromLength: f.n(function (word, index, context, optional) {
            if (optional === void 0) { optional = {}; }
            var maxLength = 10;
            if (optional.maxLength != null) {
                maxLength = optional.maxLength;
            }
            if (maxLength > 0) {
                var lightness = word.length / maxLength;
                return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
            }
            else {
                var lightness = (maxLength - word.length) / maxLength;
                return new HSL.HSL(0, 0, Math.max(0, Math.min(100 * lightness, 100)));
            }
        }).annotate({
            title: "Shade a word from the length of the word"
        })
    };
})(ColourWrapper || (ColourWrapper = {}));
/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="ColourWrapper.ts" />
var Page;
(function (Page) {
    (function init() {
        /* IE does not support a nice contentEditable event ('input') that lets us know when a contenteditable element has changed,
         * as a result we need a fallback. This fallback detects if the normal handler has run a little bit after the keypress event on
         * the same element has fired, if the event has not fired then we switch to this callback, if it has then we just remove this
         * fallback listener and move on with our lives.
         */
        function __addFallbackOnHandler(element, eventName, handler, detectEventName) {
            var timeoutSet = false;
            var shouldEventFallbackBeUsed = true;
            function detectIfEventHandlerRan() {
                if (shouldEventFallbackBeUsed) {
                    setInterval(function () {
                        handler();
                    }, 100);
                }
            }
            element.addEventListener(detectEventName, function (e) {
                if (!timeoutSet) {
                    window.setTimeout(detectIfEventHandlerRan, 1000);
                    timeoutSet = true;
                }
            });
            return function (e) {
                shouldEventFallbackBeUsed = false;
                handler(e);
            };
        }
        //Just an object to hold the function to be run when the colouring process (why did I use the word colourizing instead? I blame startup and app names) should be 
        //started (i.e. on input change). 
        // - 'func' is the function to run to start colouring the input
        // - 'wrappingMethod' is the function of the Sampler interface (refer to the ColourWrapper module) to be run in the above function
        var colourizing = {
            func: function () {
                //Element where text is entered in to by the user
                var enterArea = document.getElementById('text-enter-area');
                //Element where the text entered in to the enterArea is displayed
                var editDisplayArea = document.getElementById('text-display-area');
                //Remove the old styled elements so we can add the new updatedelements cleanly
                while (editDisplayArea.childNodes.length > 0) {
                    editDisplayArea.removeChild(editDisplayArea.childNodes[0]);
                }
                //Go through each of the input area's children and apply the colours, adding them to the display area after they are wrapped in a style
                f.n(enterArea.childNodes).forEach(function (node) {
                    editDisplayArea.appendChild(_applyColoursRecursively(node));
                });
                //Since one of the elements is absolutely positioned and the other is relatively positioned, only one of the two can have any effect on the rest of the page's
                //sizing, unfortunately it's also the one that appears to be less likely to expand nicely. As a result we just have a function here to make sure they are both
                //forced to be equal sizes every time we render the colouring.
                function _ensureSizesMatch() {
                    enterArea.style.width = '';
                    enterArea.style.height = '';
                    editDisplayArea.style.width = '';
                    editDisplayArea.style.height = '';
                    var maxWidth = Math.max(enterArea.clientWidth, editDisplayArea.clientWidth);
                    var maxHeight = Math.max(enterArea.clientHeight, editDisplayArea.clientHeight);
                    enterArea.style.width = maxWidth.toString();
                    enterArea.style.height = maxHeight.toString();
                    editDisplayArea.style.width = maxWidth.toString();
                    editDisplayArea.style.height = maxHeight.toString();
                }
                _ensureSizesMatch();
                //Just the function to determine what colour each word should be, up here in it's own function for visibility and to be easy to change (and to let this be dynamically changed through the page in the future)
                function wrappingMethod(word, index, context) {
                    return colourizing.wrappingMethod(word, index, context).toCSSString();
                }
                //Recursively goes through an element and its children, wrapping words in an element for styling the colour of the word. Each element is cloned (not just copied or moved or what have you) to be suitable for adding elsewhere in the page
                function _applyColoursRecursively(element) {
                    var clonedElement = element.cloneNode();
                    //Leaf node, work on the text and terminate this branch of recursion
                    if (element.childNodes.length == 0) {
                        if (element instanceof CharacterData && element.data != undefined) {
                            var mainWrapper = document.createElement('span');
                            var waitingWhitespace = [];
                            //Splits up all of the text in this element by whitespace, with a capturing group so we can also work with the whitespace (instead of it being 
                            //stripped out)
                            var operatingList = element.data.split(/(\s|\u00a0)/g);
                            operatingList.forEach(function (word, index, context) {
                                //This regex should always be pegged to the one used above to split the text, except this should always operate on the whole line (use ^ and $)
                                //and does not need a capturing group. If they are out of sync then there can be a mismatch in spacing/display between the input elements and
                                //the coloured elements.
                                if (word === '' || /^\s|\u00a0$/g.test(word)) {
                                    waitingWhitespace.push(word);
                                    return;
                                }
                                //Whitespace should not be considered parts of a word, so instead we buffer it up until we hit a non-whitespace word and we can dump it out
                                //in to one element before the word to preserve whitespace while also not having it not be coloured.
                                if (waitingWhitespace.length > 0) {
                                    var waitingSpaces = document.createElement('span');
                                    waitingSpaces.textContent = waitingWhitespace.join('');
                                    waitingSpaces.classList.add('space-wrapper');
                                    mainWrapper.appendChild(waitingSpaces);
                                    waitingWhitespace = [];
                                }
                                //The element for the actual word to be coloured.
                                var wordWrapper = document.createElement('span');
                                wordWrapper.textContent = word;
                                wordWrapper.style.backgroundColor = wrappingMethod(word, index, context);
                                mainWrapper.appendChild(wordWrapper);
                            });
                            return mainWrapper;
                        }
                        else {
                            return clonedElement;
                        }
                    }
                    else {
                        f.n(element.childNodes).forEach(function (node) {
                            clonedElement.appendChild(_applyColoursRecursively(node));
                        });
                        return clonedElement;
                    }
                }
            },
            wrappingMethod: ColourWrapper.baseSamplers.colourFromWordRandom
        };
        //Sets up the main event listeners on the page
        function setUpListeners() {
            var inputArea = document.getElementById('text-enter-area');
            inputArea.focus();
            var safeHandler = __addFallbackOnHandler(inputArea, 'keypress', HTML5ContentEditableInputHandler(), 'keypress');
            inputArea.addEventListener('input', safeHandler);
            function HTML5ContentEditableInputHandler() {
                return function () {
                    colourizing.func();
                };
            }
            document.getElementById('fill-in-text').addEventListener('click', function () {
                inputArea.textContent = document.getElementById('sample-text').textContent;
                setTimeout(function () {
                    colourizing.func();
                }, 10);
            });
        }
        function showSamplerOptions() {
            function _samplerClick(sampler) {
                return function (e) {
                    colourizing.wrappingMethod = sampler;
                    setTimeout(function () {
                        colourizing.func();
                    }, 10);
                };
            }
            var element = document.getElementById('sampler-list');
            Object.keys(ColourWrapper.baseSamplers).forEach(function (sampler) {
                var samplerElem = document.createElement('li');
                samplerElem.textContent = ColourWrapper.baseSamplers[sampler].title;
                samplerElem.addEventListener('mouseover', _samplerClick(ColourWrapper.baseSamplers[sampler]));
                element.appendChild(samplerElem);
            });
        }
        setUpListeners();
        showSamplerOptions();
    })();
})(Page || (Page = {}));
/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="ColourWrapper.ts" />
/// <reference path="page.ts" /> 
//# sourceMappingURL=main.js.map