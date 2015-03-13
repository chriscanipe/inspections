

var map = L.map('chart').setView([38.9608624, -92.3292168], 12);
var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';



L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);


map._initPathRoot()    

var svg = d3.select("#chart").select("svg"),
g = svg.append("g");

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


d3.json("js/como_inspections.json", function(data) {


	var allViolations = data.dataset.row;


	var nested = {};

	var inspectionsArray = [];





	$.each(allViolations, function(i, item) {


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

	
		nested[item.insp_num].violations.push(item);

	});

	$.each(nested, function(i, item) {
		inspectionsArray.push(item);
	});

	inspectionsArray.forEach(function(d) {
		var coord = locations[d.id];
		d.LatLng = new L.LatLng(coord.lat, coord.lon);
	});




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
			d3.select(this).moveToFront()
			var restaurant = d.name;
  			var violationsCount = d.violations.length;
  			d3.select(this).classed("active", true);
  			$(".tt").show();

  		})


		.on("mouseout", function(d) {
			d3.select(this).moveToBack()
			d3.select(this).classed("active", false);
			$(".tt").hide();

		})

.on("mousemove", function(d){
	

});

 function order(a, b) {
    return radius(b) - radius(a);
  }

	map.on("viewreset", update);
	
	update();

	function update() {
		feature.attr("transform", function(d) { 
			return "translate("+ 
			map.latLngToLayerPoint(d.LatLng).x +","+ 
			map.latLngToLayerPoint(d.LatLng).y +")";
		})
	}






console.log(data)




});




