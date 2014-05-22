/*  Skura functionality for 3.3.9       */
/*  File version            0.1         */
/*  Last modified           21/06/13    */
/*  Last modified by        Andy Twine  */
/*                          Big Pink    */

// Run any required code on start up
function Framework_onLoad() {
    // Diagnostic line to help in case of issues
    console.log('Running for version 3.3.9');
}

// Exit to the presentation library
function Framework_exitPresentation() {
    if (navigator.userAgent.match(/iPad/i)) {
        // If an iPad, navigate to the appropriate place
        window.location = window.location.href.substr(0, window.location.href.indexOf("Documents/")) + "/SkuraWebBrowser.app/scpWorkingDir/webapps/viewer/viewer.html";
    } else {
        // If not an iPad, navigate back to the viewer
        // This is to allow testing in the web viewer through a web browser
        window.location.href = '/viewer/viewer.html';
    }
}

// Track the view of the path in the framework
function Framework_track(path) {
    if (path != '') {
        // Log the tracking for diagnostic purposes
        console.log('Framework_track(' + path + ');');
        if (typeof window.parent.virtualScene === "function") {
            // If the virtualScene function is available, call it
            top.virtualScene(path);
        }
    }
}