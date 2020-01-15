// code taken from https://jira.atlassian.com/browse/JSWSERVER-9236 and modified for the extension

var stateMouseDown = false;
var mouseStartX = 0;
var jiraStartWidth, jiraHeaderWidth;
var currentStylesheet;
var detailView;
var headerGroup;
var defaultHeaderWidth;
var defaultDetailWidth;

function startJiraDrag(ev) {
  jiraStartWidth = detailView.clientWidth;
  jiraHeaderWidth =
    defaultHeaderWidth - (jiraStartWidth - defaultDetailWidth);
  detailView.style.width = jiraStartWidth + "px";
  headerGroup.style.width = jiraHeaderWidth + "px";
  if (currentStylesheet) {
    document.body.removeChild(currentStylesheet);
  }
  stateMouseDown = true;
  mouseStartX = ev.pageX;
  document.addEventListener("mousemove", continueJiraDrag, false);
  document.addEventListener("mouseup", endJiraDrag, false);
}
function continueJiraDrag(ev) {
  var pX = ev.pageX;
  detailView.style.width = jiraStartWidth + mouseStartX - pX + "px";
  headerGroup.style.width = jiraHeaderWidth - mouseStartX + pX + "px";
}
function endJiraDrag() {
  currentStylesheet = document.createElement("style");
  currentStylesheet.innerHTML =
    "#ghx-detail-view { width: " + detailView.style.width + " !important;} ";
  document.body.insertBefore(currentStylesheet, document.body.childNodes[0]);
  localStorage.setItem("jiraWidth", detailView.style.width);
  document.removeEventListener("mousemove", continueJiraDrag, false);
  document.removeEventListener("mouseup", endJiraDrag, false);
}

function jiraResizeWait() {
  setTimeout(() => {
    if(!document.getElementById("ghx-detail-head")) {
      jiraResizeWait();
      return;
    }
    let dragBar = document.getElementById("ghx-detail-head");
    detailView = document.getElementById("ghx-detail-view");
    headerGroup = document.getElementById("ghx-column-header-group");
    defaultHeaderWidth = headerGroup.clientWidth;
    defaultDetailWidth = detailView.clientWidth;
    let controlGroup = document.getElementById("ghx-detail-head");
    let tmpElem = document.createElement("div");
    tmpElem.innerHTML =
      '<span style="display: block;" id="js-sizer" class="ghx-sizer ui-resizable-handle ui-resizable-w" data-tooltip="Resize Detail View" original-title=""><span class="ghx-icon ghx-icon-sizer"></span></span>';
    var dragElem = tmpElem.childNodes[0];
    controlGroup.insertBefore(dragElem, controlGroup.childNodes[0]);
    let currentWidth = localStorage.getItem("jiraWidth") || "400px";
    currentStylesheet = document.createElement("style");
    currentStylesheet.innerHTML = `
      #ghx-detail-view {
          width: ${currentWidth} !important;
      }
      #ghx-column-header-group {
          width: calc(${defaultHeaderWidth}px - ${currentWidth} + ${defaultDetailWidth}px) !important;
      }
    `;
    document.body.insertBefore(currentStylesheet, document.body.childNodes[0]);
    dragBar.addEventListener("mousedown", startJiraDrag, false);
  }, 100);
}

jiraResizeWait();
