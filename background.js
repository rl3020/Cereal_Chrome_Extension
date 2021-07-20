//list of currently allowed domains
const allowed_domains = ["booking.com", "airbnb.com"]; 



// Functions for loading listings to popupUI 
var request_data = async function(tab){ 
    //use fetch to scrape the data off html 
    async function scrape_listings(html, website, type){
        var api_url = "http://localhost:5000/scrape_website_html/"; 

        //Use this to communicate with the API 
        var payload = {
            "website": website,
            "type": type,
            "html": html 
        }

        console.log("Making HTTP POST Request with payload:\n", payload);
        const settings = {
            method: "POST", 
            mode: 'cors',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        var response = await fetch(api_url, settings); 
        response = await response.json();
        console.log("returned data: ", response["data"]);
        return response["data"];
                        
    };

    var type_of_listing = function(url){ 
        var start = url.indexOf("www") + 4;
        var websiteName = "";
        var typeOfListing = "single";
        for(let i = start; i < url.length; i ++){
            if(url[i] !== "."){
                websiteName += url[i];
            }else{
                break; 
            }
        }

        //for Airbnb scraping
        if(websiteName.includes("airbnb")){
            start = url.indexOf(".com") + 5;
            
            var remainingListingURL = "";
            for(let i = 0; i < 5; i ++){
                remainingListingURL += url[start + i];
            }

            if(remainingListingURL.includes("room")){
                typeOfListing = "single";
            }
            else{
                typeOfListing = "multiple";
            }

        }

        var result = {
            website: websiteName, 
            type: typeOfListing
        }; 


        return result; 

    }

    //get the html of the current webpage
    var get_html = async function(tab){
        //use this to get the html of the current page.
        function  get_inner_html(){
            var html = document.querySelector("body").innerHTML; 
            return html; 
        };

        //options for executing script on chrome tab
        var queryOptions = {
            target: {tabId: tab.id}, 
            function: get_inner_html,
        };

        //execute script on chrome tab
        var [html] = await chrome.scripting.executeScript(queryOptions); // callback function after code returns 

        
        return html.result; 
    };


    var requestedData = await get_html(tab);
    var webURL = String(tab.url);
    var inspectWebsite = type_of_listing(webURL); 
    var website = inspectWebsite["website"];
    var listingType = inspectWebsite["type"];
    requestedData = await scrape_listings(requestedData, website, listingType); 
    return requestedData;

};

var check_if_allowed = function(tab) {
    var allowed = false; 
    for(let i = 0; i < allowed_domains.length; i++){
        if(tab.url.includes(allowed_domains[i])){
            allowed = true; 
            break; 
        }
    }
    return allowed; 
};

async function get_current_tab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    //console.log("tab currently on after await : ", tab);
    return tab;
};

//needed to load HTML
var windowsCreated = [];
var linksToParse = [];
async function create_window_for_each_link(link){
    var windowOptions = {
        url: "https://www.airbnb.com" + link,
        //state: "minimized"
    };
    var newWindow = await chrome.windows.create(windowOptions);
    windowsCreated.push(newWindow);
    console.log("created window object: ", newWindow);
    linksToParse.shift();
};

// handle incoming messages
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
        var get_listings = async function(sendResponse){

            if(request.message == "get_listings"){
                var tab = await get_current_tab();
                console.log("checking if url is allowed: ", tab.url);
                var allowed = check_if_allowed(tab);
                
                if (allowed){
                    console.log("requesting scraped data ...");
                    const returnData = await request_data(tab); 
                    const response = {
                        success: true, 
                        data: returnData
                    }
                    sendResponse(response);
                }
                else{
                    sendResponse({correct: false, data:{}})
                }
            } // end of "if the message is get_listings"

            else if(request.message == "scrape_links" ){
                linksToParse = request.links;
                if(linksToParse.length > 0){
                    await create_window_for_each_link(linksToParse[0]);
                }else{
                    sendResponse({message: "no_links"});
                }
            }
        }

        get_listings(sendResponse);
        return true;
    }
);

async function get_html_for_loaded_page(tabId){
    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }

    var get_html_for_page = function(){
        return document.querySelector("body").innerHTML;
    }

    sleep(2000);
    const html = await chrome.scripting.executeScript(
        {
            target: {tabId: tabId},
            function: get_html_for_page
        }); 
    
    //access the html from the returned JS object
    return html[0].result; 
};

async function scrape_data_from_html_single_listing(html, website, type){
    async function scrape_listings(html, website, type){
        var api_url = "http://localhost:5000/scrape_website_html/"; 

        //Use this to communicate with the API 
        var payload = {
            "website": website,
            "type": type,
            "html": html 
        }

        console.log("Making HTTP POST Request with payload:\n", payload);
        const settings = {
            method: "POST", 
            mode: 'cors',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        }

        var response = await fetch(api_url, settings); 
        response = await response.json();
        var returnedData = response["data"];
        return returnedData;
    };

    var returnedData = await scrape_listings(html, website, type);
    return returnedData

};


//listen for updated window
var loadedTabsQueue = [];
var loadedTabs = [];
chrome.tabs.onUpdated.addListener(function(tabId , changeInfo, tab){

    var check_updated_tab = async function(tabId , changeInfo, tab){
        var success = false; 
        var latest_tab;
        if(windowsCreated.length > 0){
            latest_tab = windowsCreated[0].tabs[0].id;
        }

        if(latest_tab){
            var retrievedTab = await chrome.tabs.get(latest_tab);
            if( tabId == latest_tab &&  retrievedTab.status === "complete"){
                console.log("Tab finished loading: ", tabId, " \nTab:",  tab);
                success = true; 
            }
            else if (changeInfo.status === "complete" && !(tabId == latest_tab)){
                loadedTabsQueue.push(tabId);
                success = false;
            }
        }

        return success; 
    };


    var perform_scrape_steps = async function(tab){
        var type_of_listing = function(url){ 
            var start = url.indexOf("www") + 4;
            var websiteName = "";
            var typeOfListing = "single";
            for(let i = start; i < url.length; i ++){
                if(url[i] !== "."){
                    websiteName += url[i];
                }else{
                    break; 
                }
            }
    
            //for Airbnb scraping
            if(websiteName.includes("airbnb")){
                start = url.indexOf(".com") + 5;
                
                var remainingListingURL = "";
                for(let i = 0; i < 5; i ++){
                    remainingListingURL += url[start + i];
                }
    
                if(remainingListingURL.includes("room")){
                    typeOfListing = "single";
                }
                else{
                    typeOfListing = "multiple";
                }
    
            }
    
            var result = {
                website: websiteName, 
                type: typeOfListing
            }; 
    
    
            return result;
        }

        // Step 1: Get html from FULLY loaded page
        const html = await get_html_for_loaded_page(tab.id);
        console.log("STEP 1: Chrome loaded the html..."); 

        // Step 2: Determine Website name and type of listing 
        var currURL = String(tab.url); 
        var listingType = type_of_listing(currURL);
        var websiteName = listingType.website;
        var typeOfListing = listingType.type;
        console.log("STEP 2: Determined type of listing/website: ", listingType); 

        // Step 3: Scrape website and get data 
        const scrapedData = await scrape_data_from_html_single_listing(html, websiteName, typeOfListing); 
        console.log("Step 3: Got data back: ", scrapedData);

        // Step 4: push scraped data to database

        // Step 5: close window
        await chrome.windows.remove(windowsCreated[0].id);
        windowsCreated.shift();

        // Step 6: continue to open windows until we run through all links
        if(linksToParse.length > 0){
            await create_window_for_each_link(linksToParse[0]);
        }

    };


    var allSteps = async function(tabId , changeInfo, tab){
        var successful = await check_updated_tab(tabId , changeInfo, tab);
        if(successful && !(loadedTabs.includes(tabId))){
            loadedTabs.push(tabId);
            perform_scrape_steps(tab);
        }
    }

    // Start of listening function 
    allSteps(tabId , changeInfo, tab);

});





