
// Handle user interaction
let closeButton = document.getElementById("close-button");
closeButton.addEventListener("click", function(){
    var currWindow = window.self; 
    currWindow.close();
});

let refreshButton = document.getElementById("refresh-button");
refreshButton.addEventListener("click", function(){
    location.href="./popup2.html";
});

let backArrow = document.getElementById("back-arrow"); 
backArrow.addEventListener("click", function(){
    location.href = "./popup1.html"; 
})


var get_complete_listing_data = function(links){
    console.log("Sending message with links");
    const message = {message: "scrape_links", links: links};
    chrome.runtime.sendMessage(message, function(response){ 
        console.log("Response after scrape_links: ", response); 
    });
};


var links = {}; 
var elementsToProcess = {};
let doneButton = document.getElementById("done-button");
doneButton.addEventListener("click", function(){
    var linksToProcess = []; 
    var success = false;

    // Get data from local storage. Use to transfer data between js files.
    if(localStorage.getItem("clickedElements") !== null){
        elementsToProcess = JSON.parse(localStorage.getItem("clickedElements"));

        if(localStorage.getItem("elementLinks") !== null){
            links = JSON.parse(localStorage.getItem("elementLinks"));
            success = true;
        }
    }

    //if both links and elements to process were passed successfully, 
    //check which links need to be loaded.
    if (success){ 
        var keys = Object.keys(elementsToProcess);
        for(let i = 0; i < keys.length; i++){
            var wasSelected = elementsToProcess[keys[i]]; 
            if(wasSelected === true){ //if it was a selected entry
                linksToProcess.push(links[keys[i]]);
            }
        }
    }


    console.log("Link array to process: ", linksToProcess);
    //call API to PROCESS ALL LINKS 
    get_complete_listing_data(linksToProcess);

});
