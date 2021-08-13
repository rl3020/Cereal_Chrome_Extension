from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
import json
import requests
from bs4 import BeautifulSoup 
import sys

app = Flask(__name__)

@app.route('/')
def home(): 
    return render_template("questions.html")

@app.route('/comparison1')
def comparison1():
    return render_template("comparison_screen1.html")

@app.route('/comparison2')
def comparison2():
    return render_template("comparison_screen2.html")

@app.route('/comparison3')
def comparison3():
    return render_template("comparison_screen3.html")

class Airbnb: 
    def __init__(self, soup):
        self.soup = soup
    
    def get_single_listing(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        # Get title
        title = self.soup.findAll("h1", "_fecoyn4") 
        title = title[0].text if len(title) > 0 else None
        titles.append(title)

        # Get price
        price = self.soup.findAll("span", "_me8w3a0")
        price = price[0].text if len(price) > 0 else None
        prices.append(price)

        data = {
            "titles": titles, 
            "prices": prices
        }

        pretty(data)
        return data
        
    def get_multiple_listings(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)                 
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        listings = self.soup.findAll("div", "_8ssblpx")
        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        for listing in listings: 
            # Get the title
            listing_title = listing.findAll("span", "_1whrsux9")
            if len(listing_title) > 0: listing_title = listing_title[0].text
            else: listing_title = None

            # Get the price
            price = listing.findAll("span", "_krjbj")
            if len(price) > 0: price = price[0].text
            else: price = None

            # Get the rating
            rating = listing.findAll("span", "_10fy1f8")
            if len(rating) > 0: rating = rating[0].text
            else: rating = None

            # Get the amenities
            amenities = [amen.text for amen in listing.findAll("span", "_3hmsj") if ("·" not in amen.text)]
            amenities = [amen for amen in amenities if amen != ""]

            # Get image URLs
            img = listing.findAll("img","_6tbg2q")
            if len(img) > 0: 
                img = img[0]
                img = img["src"]
            else: 
                img = None

            # Get links for individual listings
            link = listing.findAll("a", "_mm360j")
            if len(link) > 0: link = link[0]["href"]
            else: link = None


            # Append items to lists
            images.append(img)
            titles.append(listing_title)   
            prices.append(price)
            amenities_list.append(amenities)
            ratings.append(rating)
            listing_links.append(link)
            
        data = {
            "images": images,
            "titles": titles, 
            "prices": prices, 
            "amenities": amenities_list, 
            "ratings": ratings,
            "listing_links": listing_links
        }

        pretty(data)
        
        return data

class Booking: 
    def __init__(self, soup):
        self.soup = soup
    
    def get_single_listing(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        # Get image URLs
        img = self.soup.findAll("a","data-thumb-url")
        print("---------------------------")
        if len(img) > 0: 
            img = img[0]
            img = img["href"]
        else: 
            img = None
        images.append(img)

        # Get title
        title = self.soup.findAll("h2", "hp__hotel-name") 
        title = title[0].text if len(title) > 0 else None
        titles.append(title)

        # Get price
        price = self.soup.findAll("div", "bui-price-display__value prco-inline-block-maker-helper prco-f-font-heading ")
        price = price[0].text if len(price) > 0 else None
        prices.append(price)

        # Get ratings
        rating = self.soup.findAll("div", "e5a32fd86b")
        rating = rating[0].text if len(rating) > 0 else None
        ratings.append(rating)

        # Get the amenities
        amenities = [amen.text for amen in self.soup.findAll("div", "important_facilities")] #self.soup.findall("div", "important_facilities ")
        amenities = [amen for amen in amenities if amen != ""]
        amenities_list.append(amenities)


        data = {
            "images": images,
            "titles": titles, 
            "prices": prices, 
            "amenities": amenities_list, 
            "ratings": ratings
        }

        pretty(data)
        return data
        
    def get_multiple_listings(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)                 
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        listings = self.soup.findAll("div", "sr_item")
        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        for listing in listings: 
            # Get the title
            listing_title = listing.findAll("span", "sr-hotel__name")
            if len(listing_title) > 0: listing_title = listing_title[0].text
            else: listing_title = None

            # Get the price
            price = listing.findAll("div", "bui-price-display__value")
            if len(price) > 0: price = price[0].text
            else: price = None

            # Get the rating
            rating = listing.findAll("div", "bui-review-score__badge")
            if len(rating) > 0: rating = rating[0].text
            else: rating = None

            # Get the amenities
            amenities = [amen.text for amen in listing.findAll("div", "sr_room_reinforcement")]
            amenities = [amen for amen in amenities if amen != ""]

            # Get image URLs
            img = listing.findAll("img","hotel_image")
            if len(img) > 0: 
                img = img[0]
                img = img["src"]
            else: 
                img = None

            # Get links for individual listings
            link = listing.findAll("a", "bui-link")
            if len(link) > 0: link = link[0]["href"]
            else: link = None


            # Append items to lists
            images.append(img)
            titles.append(listing_title)   
            prices.append(price)
            amenities_list.append(amenities)
            ratings.append(rating)
            listing_links.append(link)
            
        data = {
            "images": images,
            "titles": titles, 
            "prices": prices, 
            "amenities": amenities_list, 
            "ratings": ratings,
            "listing_links": listing_links
        }

        pretty(data)
        
        return data

class VRBO: 
    def __init__(self, soup):
        self.soup = soup
    
    def get_single_listing(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        # Get image URLs
        img = self.soup.findAll("a","data-thumb-url")
        print("---------------------------")
        if len(img) > 0: 
            img = img[0]
            img = img["href"]
        else: 
            img = None
        images.append(img)

        # Get title
        title = self.soup.findAll("h2", "hp__hotel-name") 
        title = title[0].text if len(title) > 0 else None
        titles.append(title)

        # Get price
        price = self.soup.findAll("div", "bui-price-display__value prco-inline-block-maker-helper prco-f-font-heading ")
        price = price[0].text if len(price) > 0 else None
        prices.append(price)

        # Get ratings
        rating = self.soup.findAll("div", "e5a32fd86b")
        rating = rating[0].text if len(rating) > 0 else None
        ratings.append(rating)

        # Get the amenities
        amenities = [amen.text for amen in self.soup.findAll("div", "important_facilities")] #self.soup.findall("div", "important_facilities ")
        amenities = [amen for amen in amenities if amen != ""]
        amenities_list.append(amenities)


        data = {
            "images": images,
            "titles": titles, 
            "prices": prices, 
            "amenities": amenities_list, 
            "ratings": ratings
        }

        pretty(data)
        return data
        
    def get_multiple_listings(self):
        def pretty(d, indent=0):
            for key, value in d.items():
                print('\t' * indent + str(key) + " (length: " + str(len(value)) + " )")
                if isinstance(value, dict):
                    pretty(value, indent+1)                 
                else:
                    print('\t' * (indent+1) + str(value))
                    print("\n")


        listings = self.soup.findAll("div", "sr_item  sr_item_new sr_item_default sr_property_block sr_flex_layout         ")
        titles = []
        prices = []
        ratings = []
        amenities_list = []
        images = []
        listing_links = []

        for listing in listings: 
            # Get the title
            listing_title = listing.findAll("div", "hp__hotel-name")
            if len(listing_title) > 0: listing_title = listing_title[0].text
            else: listing_title = None

            # Get the price
            price = listing.findAll("div", "bui-price-display__value prco-inline-block-maker-helper ")
            if len(price) > 0: price = price[0].text
            else: price = None

            # Get the rating
            rating = listing.findAll("div", "bui-review-score__badge")
            if len(rating) > 0: rating = rating[0].text
            else: rating = None

            # Get the amenities
            amenities = [amen.text for amen in listing.findAll("div", "sr_room_reinforcement") if ("·" not in amen.text)]
            amenities = [amen for amen in amenities if amen != ""]

            # Get image URLs
            img = listing.findAll("img","hotel_image")
            if len(img) > 0: 
                img = img[0]
                img = img["src"]
            else: 
                img = None

            # Get links for individual listings
            link = listing.findAll("a", "_mm360j")
            if len(link) > 0: link = link[0]["href"]
            else: link = None


            # Append items to lists
            images.append(img)
            titles.append(listing_title)   
            prices.append(price)
            amenities_list.append(amenities)
            ratings.append(rating)
            listing_links.append(link)
            
        data = {
            "images": images,
            "titles": titles, 
            "prices": prices, 
            "amenities": amenities_list, 
            "ratings": ratings,
            "listing_links": listing_links
        }

        pretty(data)
        
        return data
    
    

@app.route('/scrape_website_html/', methods=["POST"])
@cross_origin()
def scrape_website_html(): 
    print("\n\n============ Getting Data From HTML =============\n")
    api_request = request.get_json()
    print("\nAPI REQUEST: ", api_request.keys(), "\nwebsite: ", api_request["website"], "\ntype: ", api_request["type"])

    # parse through the API request
    website = api_request["website"]
    type_of_listing = api_request["type"]
    html = api_request["html"]

    soup = BeautifulSoup(html, "html.parser")
    data = soup

    # STEP 1: determine which website it is from!
    if website =="airbnb": 
        data = Airbnb(soup)

        # STEP 2: determine which type of listing it is
        if type_of_listing == "single": 
            data = data.get_single_listing()
        else: 
            data = data.get_multiple_listings()
    elif website == "booking": 
        data = Booking(soup)

        # STEP 2: determine which type of listing it is
        if type_of_listing == "single": 
            data = data.get_single_listing()
        else: 
            data = data.get_multiple_listings()
    elif website == "VRBO": 
        data = VRBO(soup)

        # STEP 2: determine which type of listing it is
        if type_of_listing == "single": 
            data = data.get_single_listing()
        else: 
            data = data.get_multiple_listings()


    #print("returning data: ", data)
    return jsonify(data = data)
