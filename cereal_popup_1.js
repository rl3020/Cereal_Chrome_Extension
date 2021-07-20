

//Use JavaScript object to determine which listings have been clicked
var elementsDisplayed = {};

//Get ALL links
var elementLinks = {};

// Handle user interaction
let nextButton = document.getElementById("next-button");
nextButton.addEventListener("click", function(){
    localStorage.setItem("clickedElements", JSON.stringify(elementsDisplayed));
    localStorage.setItem("elementLinks", JSON.stringify(elementLinks));
    location.href = "./popup2.html";
}); 

let closeButton = document.getElementById("close-button");
closeButton.addEventListener("click", function(){
    var currWindow = window.self; 
    currWindow.close();
});

let refreshButton = document.getElementById("refresh-button");
refreshButton.addEventListener("click", function(){
    location.href="./popup1.html";
});


async function onLoad(){
    
    var add_event_listener = (element) => {
        element.addEventListener("click", function(){ 
            var elementId = String(element.id);

            if(!(elementId in elementsDisplayed)){
                elementsDisplayed[elementId] = true;
            }   
            else if((elementId in elementsDisplayed) && (elementsDisplayed[elementId] === false)){
                elementsDisplayed[elementId] = true;
            }
            else{
                elementsDisplayed[elementId] = false;
                var toDelete = document.getElementById(elementId);
                toDelete = toDelete.getElementsByClassName("clicked");
                console.log("to delete: ", toDelete);
                toDelete = toDelete[0];
                toDelete.remove();
                return ;
            }
            
            var clickedWrapper = document.createElement("div");
            clickedWrapper.className = "clicked screen";
            
            //var img = document.createElement("img"); 
            //img.src = "img/hotel-card@2x.svg"; 
            //img.className = "hotel-card-2z6rz6"; 

            var checkboxGroup = document.createElement("div"); 
            checkboxGroup.className = "group-1-2z6rz6";

            var checkbox = document.createElement("div"); 
            checkbox.className = "checkbox-3kHkEd";

            var circle = document.createElement("div"); 
            circle.className = "akar-iconscheck-3kHkEd";

            var imgGroup = document.createElement("img");
            imgGroup.className = "group-Sc0DT7";
            imgGroup.src = "img/group@2x.svg";

            //organize the dynamically generated elements
            circle.appendChild(imgGroup);
            checkboxGroup.appendChild(checkbox);
            checkboxGroup.appendChild(circle);
            //clickedWrapper.appendChild(img);
            clickedWrapper.appendChild(checkboxGroup);
            element.appendChild(clickedWrapper);

        });

    };

    var load_listings_to_DOM = (data)=> {
        console.log("loading listings to DOM");
        var titles = data["titles"]; 
        var images = data["images"]; 
        var prices = data["prices"];
        var links = data["listing_links"];
        var size_of_place = data["amenities"];

        const scrapedItems = document.getElementById("scraped-items-list");
        var startTopOffset = 44;
        for(let i= 0; i < 4; i ++){
            var listing = document.createElement("div");
            listing.id = `element-${i}`;
            listing.className = "scraped-listing";
            listing.style.cssText = " top: " + String(startTopOffset) + "px;"; //NEED To ADJUST 
            startTopOffset += 110;

            var hotel_card = document.createElement("div");
            hotel_card.className = "hotel-card-8YzNcj";

            var img = document.createElement("img");
            img.src = images[i];
            img.className = "hotel-image-8YzNcj"; 

            var title = document.createElement("p");
            title.className = "title-8YzNcj valign-text-middle notosans-medium-abbey-15px";
            var actualTitle = "";
            if(String(titles[i]).length > 29){
                for(let k = 0; k < 24; k ++){
                    actualTitle += String(titles[i][k]);
                }
                actualTitle += "...";

            }else{
                actualTitle = String(titles[i]);
            }
            var titleText = document.createTextNode(actualTitle);
            title.appendChild(titleText); 

            var location = document.createElement("div");
            location.className = "kulaniapia-hawaii-8YzNcj valign-text-middle notosans-normal-abbey-11px"; 
            var locationText = document.createTextNode(actualTitle);
            location.appendChild(locationText); 

            var amenities = document.createElement("p");
            amenities.className = "private-suite-2-king-1-sofa-bed-8YzNcj valign-text-bottom notosans-medium-abbey-10px";
            var aboutPlace = [];
            for(let j = 0; j < 4; j++){
                aboutPlace.push(size_of_place[i][j]);
            }
            var amenitiesText = String(aboutPlace[0]) + ", " + String(aboutPlace[1]) +  ", " + String(aboutPlace[2]);
            amenitiesText = document.createTextNode(amenitiesText);
            amenities.appendChild(amenitiesText); 

            var priceWrapper = document.createElement("div");
            priceWrapper.className = "x186night-8YzNcj valign-text-bottom notosans-medium-abbey-15px";
            var span0 = document.createElement("span");
            var span1 = document.createElement("span");
            span1.className = "span0-gHupJm notosans-medium-abbey-15px"; 


            var currPrice = String(prices[i]); 
            var actualPrice = "";
            for(let k = 0; i < currPrice.length; k ++){
                if(currPrice[k] !== " "){
                    actualPrice += currPrice[k];
                }
                else{
                    break;
                }
            }
            var priceText = document.createTextNode(actualPrice);
            span1.appendChild(priceText);

            var span2 = document.createElement("span");
            span2.className = "span1-gHupJm notosans-normal-abbey-10px";
            var perNight = document.createTextNode("/night");
            span2.appendChild(perNight);

            span0.appendChild(span1);
            span0.appendChild(span2);
            priceWrapper.appendChild(span0);

            //APPEND ALL ELEMENTS TO SCRAPED-ITEMS
            listing.appendChild(hotel_card);
            listing.appendChild(img);
            listing.appendChild(title);
            listing.appendChild(location);
            listing.appendChild(amenities);
            listing.appendChild(priceWrapper);
            add_event_listener(listing);
            elementLinks[String(listing.id)] = links[i];
            scrapedItems.appendChild(listing);
            
        }
    };

    //display failure notice
    var display_failed = function(){
        var htag = document.createElement("h3");
        htag.style.cssText = "color: red; padding-top: 44px; padding-left: 13px;";
        var text = document.createTextNode("Sorry, we don't support this page :( ");
        htag.appendChild(text);
        document.getElementById("scraped-items-list").append(htag);
    }
    
    var load_listings = async function(){
        const message = {message: "get_listings"}; 

        chrome.runtime.sendMessage(message, function(response){ 
            console.log("Response after API call: ", response); 
            if(response.success){

                load_listings_to_DOM(response.data);


            }else{
                display_failed();
            }

            
        });

    };
    
    await load_listings(); 
    
};

//start function
onLoad();



