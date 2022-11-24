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

var table = null;
var currRow = null;

function addElement(text, classToSet, newCell) {
    if (newCell) {
        const cell = document.createElement("td");
        cell.innerHTML = text;
        cell.className = classToSet;

        currRow.appendChild(cell);
    }
    else {
        const newText = document.createElement("p");
        newText.innerHTML = text;
        newText.className = classToSet;

        currRow.lastChild.appendChild(newText);
    }
}

function addButton(text, cellClassToSet, classToSet, idToSet, setDisabled = false, type = "secondary") {
    const cell = document.createElement("td");
    cell.className = cellClassToSet;

    const button = document.createElement("button");
    button.innerHTML = text;
    button.setAttribute("type", "button");
    if (setDisabled) {
        button.setAttribute("disabled", "");
        button.classList.add("btn", "btn-danger", classToSet);
    }
    else {
        button.classList.add("btn", `btn-${type}`, "btn-lg", classToSet);
    }
    if (idToSet != null) button.id = idToSet;
    
    cell.appendChild(button);
    currRow.appendChild(cell);

    return button;
}

function addDropdown(text, buttonClass, elements, releaseId, buttonSmall) {
    const cell = document.createElement("td");
    cell.classList.add("ver-dropdown");
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = text;
    toggleButton.classList.add("btn", buttonClass, "dropdown-toggle");
    if (buttonSmall) toggleButton.classList.add("btn-sm");
    toggleButton.id = `${releaseId}Dropdown`
    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("data-bs-toggle", "dropdown");
    toggleButton.setAttribute("aria-expanded", "false");

    const dropdown = document.createElement("ul");
    dropdown.classList.add("dropdown-menu");
    dropdown.setAttribute("aria-labelledby", `${releaseId}Dropdown`);
    elements.forEach(function(element) {
        const dropdownElement = document.createElement("li");
        if (element.divider) {
            dropdownElement.classList.add("dropdown-divider");
        }
        else {
            dropdownElement.innerHTML = element.name;
            if (element.action) dropdownElement.addEventListener("click", function() {window.stManagement[element.action](getVersionName(getVersionData(releaseId)))});
            dropdownElement.classList.add("dropdown-item");
            if (element.class) dropdownElement.classList.add(element.class);
        }
        dropdown.appendChild(dropdownElement);
    })

    cell.appendChild(toggleButton);
    cell.appendChild(dropdown);
    document.getElementById(releaseId).appendChild(cell);
}

function newRow(rowId, preRelease = "false") {
    if (table === null) table = document.getElementById("release-table");
    currRow = table.insertRow();
    currRow.id = rowId;
    if (preRelease.toLowerCase() == "true") {
        currRow.className = "pre-release";
    }
}
