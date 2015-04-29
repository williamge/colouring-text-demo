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

    function setUpListeners(){
        var inputArea = document.getElementById('text-enter-area');
        inputArea.focus();

        var safeHandler = __addFallbackOnHandler(inputArea, 'keypress', HTML5ContentEditableInputHandler(inputArea), 'keypress');

        inputArea.addEventListener('input', safeHandler);
        
        function HTML5ContentEditableInputHandler (element) {
            return function() {
                var enterArea = element;

                var editDisplayArea = document.getElementById('text-display-area');

                //Remove the old styled elements so we can add the new updatedelements cleanly
                while (editDisplayArea.childNodes.length > 0) {
                    editDisplayArea.removeChild(editDisplayArea.childNodes[0]);
                }

                //Go through each of the input area's children and apply the colours, adding them to the display area after they are wrapped in a style
                f.n(element.childNodes).forEach(function(node) {
                    editDisplayArea.appendChild(_applyColoursRecursively(node));
                });

                //Just the function to determine what colour each word should be, up here in it's own function for visibility and to be easy to change (and to let this be dynamically changed through the page in the future)
                function wrappingMethod(word) {
                    return ColourWrapper.baseSamplers.colourFromWordRandom(word).toCSSString();
                }

                //Recursively goes through an element and its children, wrapping words in an element for styling the colour of the word. Each element is cloned (not just copied or moved or what have you) to be suitable for adding elsewhere in the page
                function _applyColoursRecursively(element) {
                    var clonedElement = element.cloneNode();

                    if (element.childNodes.length == 0) {
                        if (element.data !== undefined) {
                            var mainWrapper = document.createElement('span');
                            element.data.split(/[\s|\u00a0]/g).forEach(function(word, index, context) {
                                var wordWrapper = document.createElement('span');
                                wordWrapper.textContent = word;
                                wordWrapper.style.backgroundColor = wrappingMethod(word);
                                mainWrapper.appendChild(wordWrapper);

                                if (index !== context.length) {
                                    var space = document.createElement('span');
                                    space.textContent = ' ';
                                    mainWrapper.appendChild(space);
                                }
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
            }
        }
    }

    setUpListeners();
})();