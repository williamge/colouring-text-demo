/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="ColourWrapper.ts" />

module Page {

    interface Colourizing {
        func: () => void;
        wrappingMethod: ColourWrapper.sampler;
    }

    (function init() {

        /* IE does not support a nice contentEditable event ('input') that lets us know when a contenteditable element has changed, 
         * as a result we need a fallback. This fallback detects if the normal handler has run a little bit after the keypress event on 
         * the same element has fired, if the event has not fired then we switch to this callback, if it has then we just remove this
         * fallback listener and move on with our lives.
         */
        function __addFallbackOnHandler(element: Element, eventName: string, handler: Function, detectEventName: string): (event: Event) => any {

            var timeoutSet = false;
            var shouldEventFallbackBeUsed = true;

            function detectIfEventHandlerRan() {
                if (shouldEventFallbackBeUsed) {
                    setInterval(
                        function() {
                            handler();
                        },
                        100
                        )
                }
            }

            element.addEventListener(detectEventName, function(e) {
                if (!timeoutSet) {
                    window.setTimeout(detectIfEventHandlerRan, 1000);
                    timeoutSet = true;
                }
            });

            return function(e) {
                shouldEventFallbackBeUsed = false;
                handler(e);
            }
        }


        //Just an object to hold the function to be run when the colouring process (why did I use the word colourizing instead? I blame startup and app names) should be 
        //started (i.e. on input change). 
        // - 'func' is the function to run to start colouring the input
        // - 'wrappingMethod' is the function of the Sampler interface (refer to the ColourWrapper module) to be run in the above function
        var colourizing: Colourizing = {
            func: function() {
                //Element where text is entered in to by the user
                var enterArea = document.getElementById('text-enter-area');
                //Element where the text entered in to the enterArea is displayed
                var editDisplayArea = document.getElementById('text-display-area');

                //Remove the old styled elements so we can add the new updatedelements cleanly
                while (editDisplayArea.childNodes.length > 0) {
                    editDisplayArea.removeChild(editDisplayArea.childNodes[0]);
                }

                //Go through each of the input area's children and apply the colours, adding them to the display area after they are wrapped in a style
                f.n(enterArea.childNodes).forEach(function(node) {
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
                function _applyColoursRecursively(element: Element|CharacterData) {
                    let clonedElement = element.cloneNode();

                    //Leaf node, work on the text and terminate this branch of recursion
                    if (element.childNodes.length == 0) {
                        if (element instanceof CharacterData && element.data != undefined) {
                            let mainWrapper = document.createElement('span');
                            let waitingWhitespace = [];

                            //Splits up all of the text in this element by whitespace, with a capturing group so we can also work with the whitespace (instead of it being 
                            //stripped out)
                            let operatingList = element.data.split(/(\s|\u00a0)/g);

                            operatingList.forEach(function(word, index, context) {
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
                        } else {
                            return clonedElement;
                        }
                    //Not a leaf node, keep looking for the leaf nodes so we can colour the text.
                    } else {
                        f.n(element.childNodes).forEach(function(node) {
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
                return function() {
                    colourizing.func();
                }
            }

            document.getElementById('fill-in-text').addEventListener('click',
                function() {
                    inputArea.textContent = document.getElementById('sample-text').textContent;
                    setTimeout(function() {
                        colourizing.func();
                    }, 10);
                });
        }

        function showSamplerOptions() {
            function _samplerClick(sampler: ColourWrapper.sampler): (Event) => any {
                return function(e: Event) {
                    colourizing.wrappingMethod = sampler;
                    setTimeout(function() {
                        colourizing.func();
                    }, 10);
                };
            }

            var element = document.getElementById('sampler-list');

            Object.keys(ColourWrapper.baseSamplers).forEach(
                function(sampler) {
                    var samplerElem = document.createElement('li');
                    samplerElem.textContent = ColourWrapper.baseSamplers[sampler].title;
                    samplerElem.addEventListener('mouseover', _samplerClick(ColourWrapper.baseSamplers[sampler]));

                    element.appendChild(samplerElem);
                }
            )
        }

        setUpListeners();
        showSamplerOptions();
    })();

}