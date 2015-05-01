/// <reference path="fn.ts" />
/// <reference path="HSL.ts" />
/// <reference path="ColourModel.ts" />
/// <reference path="ColourWrapper.ts" />

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
                setInterval(
                    function() {
                        handler();
                    },
                    100
                )
            }
        }

        element.addEventListener(detectEventName, function(e) {
            window.setTimeout(detectIfEventHandlerRan, 1000);
            timeoutSet = true;
        });

        return function(e) {
            shouldEventFallbackBeUsed = false;
            handler(e);
        }
    }

    var colourizing = {
        func: function() {
            var enterArea = document.getElementById('text-enter-area');;

            var editDisplayArea = document.getElementById('text-display-area');

            //Remove the old styled elements so we can add the new updatedelements cleanly
            while (editDisplayArea.childNodes.length > 0) {
                editDisplayArea.removeChild(editDisplayArea.childNodes[0]);
            }

            //Go through each of the input area's children and apply the colours, adding them to the display area after they are wrapped in a style
            f.n(enterArea.childNodes).forEach(function(node) {
                editDisplayArea.appendChild(_applyColoursRecursively(node));
            });

            _ensureSizesMatch();

            //Just the function to determine what colour each word should be, up here in it's own function for visibility and to be easy to change (and to let this be dynamically changed through the page in the future)
            function wrappingMethod(word) {
                return colourizing.wrappingMethod(word).toCSSString();
            }

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

            //Recursively goes through an element and its children, wrapping words in an element for styling the colour of the word. Each element is cloned (not just copied or moved or what have you) to be suitable for adding elsewhere in the page
            function _applyColoursRecursively(element) {
                var clonedElement = element.cloneNode();

                if (element.childNodes.length == 0) {
                    if (element.data !== undefined) {
                        var mainWrapper = document.createElement('span');
                        var waitingWhitespace = [];
                        element.data.split(/(\s|\u00a0)/g).forEach(function(word, index, context) {
                            if (word === '' || /^\s|\u00a0$/g.test(word)) {
                                waitingWhitespace.push(word);
                                return;
                            }
                            if (waitingWhitespace.length > 0) {
                                var waitingSpaces = document.createElement('span');
                                waitingSpaces.textContent = waitingWhitespace.join('');
                                waitingSpaces.classList.add('space-wrapper');
                                mainWrapper.appendChild(waitingSpaces);
                                waitingWhitespace = [];
                            }

                            var wordWrapper = document.createElement('span');
                            wordWrapper.textContent = word;
                            wordWrapper.style.backgroundColor = wrappingMethod(word);
                            mainWrapper.appendChild(wordWrapper);
                        });

                        return mainWrapper;
                    } else {
                        return clonedElement;
                    }
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

    function setUpListeners(){
        var inputArea = document.getElementById('text-enter-area');
        inputArea.focus();

        var safeHandler = __addFallbackOnHandler(inputArea, 'keypress', HTML5ContentEditableInputHandler(), 'keypress');

        inputArea.addEventListener('input', safeHandler);
        
        function HTML5ContentEditableInputHandler () {
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
        function _samplerClick(sampler) {
            return function(e) {
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