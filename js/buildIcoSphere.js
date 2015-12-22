var gr = (1+Math.sqrt(5))/2; //golden ratio
var dimensions = 3; //3d space...add time at some point
var originZero = {"x":0,"y":0,"z":0};
var tollernace = 1.35;
var simuls = 3000;




function createPoints(color,mode){
	var points=[];//holds all points
	var sqrDim=Math.pow(dimensions-1,2);
	mode=Math.round(mode);//make sure its an integer 
	
	if(mode){
		if(mode<4){
			alert("3d Objects need at least 4 points")
		} else if (mode < 7){//between 4 and 6
			var preset = [
			[{"x":0.5,"y":0.433,"z":0},{"x":-0.5,"y":0.433,"z":0},{"x":0,"y":-0.433,"z":0.5},{"x":0,"y":-0.433,"z":-0.5}],
			[{"x":-0.866,"y":0,"z":0.8},{"x":-0.866,"y":0,"z":-0.8},{"x":1,"y":0,"z":0},
			{"x":0,"y":1,"z":0},{"x":0,"y":-1,"z":0}],
			[{"x":1,"y":0,"z":0},{"x":-1,"y":0,"z":0},{"x":0,"y":1,"z":0},
			{"x":0,"y":0,"z":-1},{"x":0,"y":0,"z":1},{"x":0,"y":-1,"z":0}]
			];
			points=preset[mode-4];
			for(var i=0,c=points.length;i<c;i++){
				points[i].color=color();
			}
		} else {
			points = runSimulation(mode, simuls, color);
		}
	} else {
		//create base pattern
		for (var i=0;i<dimensions;i+=1){
			var point = [1,1,1];//create base point
			point[i]=0; //set one dimension to origin
			point[((i+dimensions-1)%dimensions)]=gr;//set other dimension to gr
			var jump=0;
			var pos=0;
			for (var j=0;j<sqrDim;j++){
				pos=(j+jump)%dimensions;//convert step to position in array
				if(pos==i){ //if position is at the blocked orgin point jump 1 forward
					jump+=1;
					pos=(j+jump)%dimensions;//recalculate position
				}
				point[pos]*=-1;
				points.push({"x":point[0],"y":point[1],"z":point[2]});//add point to array
				if(color){
					points[points.length-1].color=color();
				}			
			}
		}
	}

	//console.log(points);
	return points;
}

//calculate the distance between two points in a 3d space
//todo change to nd instead of 3d
function calcDistance(p1,p2){

	return Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2)+Math.pow(p1.z-p2.z,2));
}
//order all points by their distance poting the smallest distance in front and the larger distances in the back
function minDistance (p1,p2) {
	if(p1.distance>p2.distance){
		return 1;
	} else if(p1.distance<p2.distance){
		return -1;
	} else {
		return 0;
	}
}

function runSimulation(nPoints,simulations,color){
	var points = [];
	var vectors = [];
	var vector;
	var distance;
	var point;
	var i,j,k;
	for(var i = 0; i < nPoints; i+=1){
		point = {"x":Math.random(),"y":Math.random(),"z":Math.random(),"color":color()};
		points.push(scalePoint(point));
	}

	for(i = 0; i < simulations; i+=1){
		//create main direction Vector
		for(j = 0; j < nPoints; j+=1){
			vectors[j]={"x":0,"y":0,"z":0};
			for(k = 0;k < nPoints;k+=1){
				if(k == j){
					continue;
				}
				vector = {"x":points[j].x-points[k].x,"y":points[j].y-points[k].y,"z":points[j].z-points[k].z};
				distance = getRadius(vector); //radius is the same as the distance in this case
				vector=scalePoint(vector,forceFormula(distance));
				vectors[j]=addVector(vectors[j], vector);
			}
		}
		//apply direction vector to each point and scale to radius which is one
		for(j = 0;j<nPoints;j+=1){
			points[j]=scalePoint(addVector(points[j],vectors[j]));
		}

	}

	return points;
}

function addVector(v1,v2){
	v1.x+=v2.x;
	v1.y+=v2.y;
	v1.z+=v2.z;

	return v1;
}

function forceFormula(distance,simNr){
	//console.log("scale force",forceScale);
	var  force;
	force = -0.5*Math.log(distance+0.313)+0.4192;
	force/=simNr;
	return force;
}


//remove point refrences that we don't need
function clipPoints(item){
	//console.log("tollerance",tollernace);
	for(var i=0,c=item.length;i<c;i+=1){
		if(item[i].distance>item[0].distance*tollernace){//build in a tollernace for non perfect cuts of 15 %
			item.splice(i,c-i);
			return;
		}
	}
}

function getUniquePointPairs(points){
	var pd = getDistanceFromPoints(points);
	var pairs = [];
	for(var i = 0, c = pd.length;i<c;i+=1){
		for(var j = 0, d = pd[i].length;j<d;j+=1){
			if(i<pd[i][j].point){ //always only connect points that have a bigger number then the point id it self, that way we can never connect the same pair twice.
				pairs.push([points[i],points[pd[i][j].point]]);
			} 
		}
	}
	console.log(pairs);
	return pairs;
}

function divideSphere(pairs, points, colorFunc){
	var radius = getRadius(points[0]);
	var point,p1,p2,scale;
	for(i=0,c=pairs.length;i<c;i+=1){
		p1=pairs[i][0];
		p2=pairs[i][1];
		point={"x":(p1.x+p2.x)/2,
		"y":(p1.y+p2.y)/2,
		"z":(p1.z+p2.z)/2
		};

		points.push(scalePoint(point,radius));//add point to array
		if(colorFunc){
			points[points.length-1].color=colorFunc();
		}
	}
	console.log(points);
	return points;
}

function scalePoint(point,radius){
	radius = radius || 1;
	//how much shorter then the radius?
	scale=radius/calcDistance(point,originZero);	

	point.x*=scale;
	point.y*=scale;
	point.z*=scale;

	return point;
}

function getDistanceFromPoints(points){
	var px = [];

	for(var i=0,c=points.length;i<c;i+=1){
		px.push([]);
		for(var j=0;j<c;j+=1){
			if(j==i){//skip distance of same point as it's always zero
				continue;
			}
			var val = calcDistance(points[i],points[j]);
			px[i].push({"point":j,"distance":val});
		}
		px[i]=px[i].sort(minDistance)
		clipPoints(px[i]);
	}
	return px;
}

function getDistanceFromSinglePoint(points,point){
	var px = [];

	for(var i=0,c=points.length;i<c;i+=1){		
			px.push({"point":i,"distance":calcDistance(point,points[i])});
	}
	px=px.sort(minDistance)
	//clipPoints(px[i]);

	return px;
}

//use three points to get the middle point and hence get the radius (bonous)
function getCenterPointRadius(points,pointDistance){
	//start with a point
	var p0=pointDistance[0];
	//get one ajecent pint
	var p1=pointDistance[p0[0].point];
	var p2;

	//search for a point that is ajacent to both p0 and p1 and is not p0;
	for(var i=1,c=p0.length;i<c;i+=1){
		for(var j=0;j<c;j+=1){
			if(p1[j].point!=0 && p1[j].point==p0[i].point){
				p2=points[p0[i].point];
				p1=points[p0[0].point];
				p0=points[0];
				i=c; //break parent loop
				break;
			}
		}
	}
	//calculate center of the triangle
	var midPoint={"x":((p0.x+p1.x+p2.x)/3),"y":((p0.y+p1.y+p2.y)/3),"z":((p0.z+p1.z+p2.z)/3)}
	
	//calculate distance(radius) from orgin
	return Math.sqrt(Math.pow(midPoint.x,2)+Math.pow(midPoint.y,2)+Math.pow(midPoint.z,2));

}

function getRadius(point){
	if(point){
		//calc distacne to origin
		return Math.sqrt(Math.pow(point.x,2)+Math.pow(point.y,2)+Math.pow(point.z,2));
	} else {
		//asume default mode of icosahedron
		return Math.sqrt(Math.pow(gr,2)+1);
	}	
}

var p=createPoints();
var pd=getDistanceFromPoints(p);

//console.log(pd);

console.log("radius is equal to: "+getRadius());
console.log("radius is equal to: "+getCenterPointRadius(p,pd));

/*
http://stackoverflow.com/questions/9600801/evenly-distributing-n-points-on-a-sphere
http://freeciv.wikia.com/wiki/Buckyball
http://web.archive.org/web/20120421191837/http://www.cgafaq.info/wiki/Evenly_distributed_points_on_sphere
http://mathcircle.berkeley.edu/BMC6/ps0405/geodesic.pdf
http://www.designcoding.net/construction-of-icosahedron/
http://donhavey.com/blog/tutorials/tutorial-3-the-icosahedron-sphere/
http://donhavey.com/blog/tutorials/tutorial-1-more-than-one-way-to-skin-a-sphere/
http://www.bitstorm.it/blog/en/2011/05/3d-sphere-html5-canvas/
*/