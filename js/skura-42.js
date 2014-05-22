/*  Skura functionality for 4.2.1       */
/*  File version            1.1         */
/*  Last modified           08/07/13    */
/*  Last modified by        Andy Twine  */
/*                          Big Pink    */

// Run any required code on start up
function Framework_onLoad() {
    // Diagnostic line to help in case of issues
    console.log('Running for version 4.2.1');
}

// Exit to the presentation library
function Framework_exitPresentation() {
    window.exitPresentation();
}

// Track the view of the path in the framework
function Framework_track(path) {
    if (path != '') {
        // Log the tracking for diagnostic purposes
        console.log('Framework_track(' + path + ');');
        if (typeof window.virtualScene === "function") {
            // If the virtualScene function is available, call it
            window.virtualScene(path);
        }
    }
}