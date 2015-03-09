



//Create a Leaflet map in the chart div.
//Leaflet requires the target div to have an ID, so I've added the ID #chart to the html markup.
//Set view sets the center point and initial zoom level for the map.
var map = L.map('chart').setView([38.9608624, -92.3292168], 12);
var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

	// Variable for the tooltips:



//This sets the tile layer. We're using Open Street Map, which is a 
// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

/* Initialize the SVG layer */
map._initPathRoot()    

/* We simply pick up the SVG from the map object */
var svg = d3.select("#chart").select("svg"),
g = svg.append("g");


/* ------------------------- */
/* moveToFront and moveToBack:
/* ------------------------- */
//This is a bit of code that lets us move elements forward and backward in the view.
//If we don't do that, our circles look like they're under other circles when we mouse over them.
//These are called by adding ".moveToFront()" or ".moveToBack()" to the end of a selection.
//More info here: http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};

/* ------------------------- */





d3.json("js/como_inspections.json", function(data) {

	//Violations are nested in an object, so we set up a new variable to get righ to it.
	var allViolations = data.dataset.row;

	//Blank object to hold our inspection lookup.
	var nested = {};

	//Empty array to hold our list of inspections.
	var inspectionsArray = [];



	//Here, we loop through our violations and nest them each under the inspeciton ID.

	$.each(allViolations, function(i, item) {

		//If the inspection ID doesn't exist in our object, create it.
		//Notice the violations array. That's where we'll push our individual violations.
		if (!nested[item.insp_num]) {
			nested[item.insp_num] = {
				"id" : item.insp_num,
				"name" : item.est_name,
				"est_type" : item.est_type,
				"date" : item.insp_date,
				"insp_type" : item.insp_type,
				"address" : item.st_number+" "+item.st_dir+" "+item.st_name+" "+item.st_suffix+" "+item.township+", Missouri "+item.zip_code,
				"violations" : []
			}
		}

		//Push the violations into the respective inspection ID array.
		nested[item.insp_num].violations.push(item);

	});

	//Now, with all of our inspections accounted for in the nested object,
	//We need to push each inspection into an array in order to plot our circle.
	//When we chart things, we generally chart from an array. 
	$.each(nested, function(i, item) {
		inspectionsArray.push(item);
	});



	//I went ahead and did a batch geocode on all of the addresses.
	//Basically, I outputted all of the addresses in the console log,
	//Then fed them to an online batch geocoder:
	//http://www.findlatitudeandlongitude.com/batch-geocode/
	//"locations" is a variable I defined in the file "locations.js"
	//It's loaded from the index page, right along with script.js.
	//Each address is listed by inspection ID.
	/* Add a LatLng object to each item in the dataset */
	inspectionsArray.forEach(function(d) {
		var coord = locations[d.id];
		d.LatLng = new L.LatLng(coord.lat, coord.lon);
	});

	var dispEst = est_name.data



	//Add circles to the map.
	var feature = g.selectAll("circle")
		.data(inspectionsArray)
		.enter().append("circle")
		.attr("class", "circle")
		.style("stroke", "black")  
		.style("opacity", .6) 
		.style("fill", "red")
		.attr("r", function(d) {
			var violations = d.violations.length;
			return violations * 5;
		})
		.on("mouseover", function(d) {
			//Move circle to front on mouseover.
			d3.select(this).moveToFront();
			// Right here is where the tooltip goes, right?
			$(".tt").html(
				"<div class='estname'>"+dispEst+"</div>")
			d3.select(this).classed("active", true);
			$(".tt").show();

		})	


		.on("mouseout", function(d) {
			//Move it to back on mouseout.
			d3.select(this).moveToBack()
			d3.select(this).classed("active", false);
			$(".tt").hide();

		})

// this function orders the smaller dots on top. It's hard to actually navigate to these dots without zooming, because the bigger ones get selected and hover over the smaller ones as you move your mouse toward them, but it adds a good level of color to the graphic. 

 function order(a, b) {
    return radius(b) - radius(a);
  }

	map.on("viewreset", update);
	
	update();

	//Update moves our circles everytime the map zooms or pans.
	function update() {
		feature.attr("transform", function(d) { 
			return "translate("+ 
			map.latLngToLayerPoint(d.LatLng).x +","+ 
			map.latLngToLayerPoint(d.LatLng).y +")";
		})
	}

});




