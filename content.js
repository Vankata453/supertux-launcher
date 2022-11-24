/*
* This program is free software: you can redistribute it and/or modify  
* it under the terms of the GNU General Public License as published by  
* the Free Software Foundation, version 3.
*
* This program is distributed in the hope that it will be useful, but 
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU 
* General Public License for more details.
*
* You should have received a copy of the GNU General Public License 
* along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

const releasesURL = 'https://api.github.com/repos/SuperTux/supertux/releases';

window.addEventListener('DOMContentLoaded', function() {
    window.general.isOnline().then(isOnline => {
        if (isOnline) {
            return fetch(releasesURL)
            .then(result => result.json())
            .then(response => {
                //Ensure current IP is not being rate limited by GitHub.
                if (response.message == undefined) {
                    //Remove all cached non-Nightly releases from localStorage.
                    for (let i = 1; i <= localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key && key.startsWith("rel")) localStorage.removeItem(key);
                    }
                    //Modify existing versions' data.
                    for (version of response) {
                        if (version.name.includes("0.1.3")) {
                            version.published_at = "2005-06-09";
                        }
                        else if (version.name.includes("0.3.3")) {
                            version.published_at = "2010-02-26";
                        }
                        else if (version.name.includes("0.3.4")) {
                            version.published_at = "2013-07-08";
                        }
                    }
                    const OGDescription = "A jump-and-run game starring Tux the Penguin. (Now lives at http://supertux.lethargik.org/)";
                    response.push({"name":"SuperTux 0.3.0", "published_at":"2006-12-17", "body":OGDescription,
                        "assets":[{"name":"supertux-0.3.0-win32.exe", "browser_download_url":"https://sourceforge.net/projects/super-tux/files/supertux/0.3.0/supertux-0.3.0-win32-setup.exe/download"}]});
                    response.push({"name":"SuperTux 0.1.2", "published_at":"2004-08-25", "body":OGDescription,
                        "assets":[{"name":"supertux-0.1.2-setup.exe", "browser_download_url":"https://sourceforge.net/projects/super-tux/files/supertux/0.1.2/supertux-0.1.2-setup.exe/download"}]});
                    response.push({"name":"SuperTux 0.1.1", "published_at":"2004-05-11", "body":OGDescription,
                        "assets":[{"name":"supertux-0.1.1-setup.exe", "browser_download_url":"https://sourceforge.net/projects/super-tux/files/supertux/0.1.1/supertux-0.1.1-setup.exe/download"}]});
                    // Sort versions by release date.
                    response.map((version) => version.published_at = new Date(version.published_at));
                    response.sort((a, b) => b.published_at - a.published_at);

                    for (var i = 0; i < response.length; i++) {
                        var currRelease = response[i];
                        var currReleaseName = currRelease.name;
                        if (currRelease.name == "" && currRelease.tag_name !== "") {
                            currReleaseName = currRelease.tag_name;
                        }
                        else if (currRelease.name == "" && currRelease.tag_name == "") {
                            continue;
                        }

                        const currReleaseAssets = currRelease.assets;
                        var currReleaseDownloads = [];
                        //Check if a release has any assets.
                        if (currReleaseAssets != undefined) {
                            for (var y = 0; y < currReleaseAssets.length; y++) {
                                const currReleaseName = currReleaseAssets[y].name;
                                //Accept releases with Windows installation files.
                                if (currReleaseName.includes(".msi") || currReleaseName.includes(".exe")) {
                                    currReleaseDownloads.push(currReleaseAssets[y].browser_download_url);
                                }
                            }
                        }

                        localStorage.setItem("rel" + (i + 1), new Array(currReleaseName, currRelease.published_at.toLocaleDateString(), currRelease.body,
                            currReleaseDownloads, currRelease.prerelease).join("-|||-"));
                    }
                    printReleases();
                }
                else if (response.message.includes("rate limit")) {
                    alert("Currently rate limited by GitHub. Couldn't update releases information.");
                    printReleases();
                }
            })
            .catch(err => {
                console.error(err);
                alert("A problem occured in the launcher! Check console for more info!\r\n\r\n" + err);
            });
        }
        else {
            alert("No internet connection. Couldn't update releases information.");
            printReleases();
        }
    });
});

function printReleases() {
    const sortedNightlies = Object.keys(localStorage).filter((key) => key.startsWith("nightly"))
      .sort(function(a, b) {
        return b.localeCompare(a, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });
    const sortedReleases = Object.keys(localStorage).filter((key) => key.startsWith("rel"))
      .sort(function(a, b) {
        return a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: 'base'
        });
      });
    const sortedKeys = [...sortedNightlies, ...sortedReleases];
    for (key of sortedKeys) {
        var currRelease = localStorage.getItem(key).split("-|||-");
        const isPreRelease = currRelease[4];
        const isNightly = key.startsWith("nightly");
        if (isPreRelease != undefined) {
            newRow(key, isPreRelease);
        }
        else {
            newRow(key);
        }
        for (var y = 0; y < currRelease.length - 1; y++) {
            var classToSet = null;
            var newCell = true;
            switch (y) {
                case 0:
                    classToSet = "ver-name";
                    break;
                case 1:
                    classToSet = "ver-description";
                    break;
                case 2:
                    classToSet = "ver-description-content";
                    if (currRelease[y] == "") {
                        currRelease[y] = "<i>No description provided.</i>";
                    }
                    newCell = false;
                    break;
                case 3:
                    classToSet = "ver-play";
                    if (currRelease[3].length > 0 || isNightly) {
                        let button = addButton("Loading...", classToSet, "release-btn", `${key}Button`, false);
                        button.setAttribute("isNightly", isNightly ? "true" : "false");
                    }
                    else {
                        addButton("Not<br>available", classToSet, "release-btn", null, true);
                    }
                    continue;
            }
            addElement(currRelease[y], classToSet, newCell);
        }
    }
    initialPageConfiguration();
}
