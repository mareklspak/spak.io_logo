            var colors = [
                [81,26,19],
                [220,186,149],
                [153,38,19],
                [50,44,106],
                [21,72,93],
                [81,160,119],
                [220,126,37],
                [169,174,114],
                [106,20,45],
                [197,182,147],
                [129,118,81],
                [145,185,187],
                [106,64,96]
            ];
         
      
            var rotation = {"x":1,"y":1,"z":1};
            var distance = 1;
            var mouseRotationSpeed = 0.01;
            var geodesicV = 1;
            var sphere = createPoints(getColor,4);
            var cameraDistance = 80.0;
            var manualRota = false;
            var pairs = getUniquePointPairs(sphere);
    
            var sphRad = getRadius();
            var sphRad2x = sphRad*2;
            var origin = {"x":0,"y":0};

            var maxLightGray = 140;

            function divideSphereClick(){
                console.log("dividing sphere!!!");
                var input = document.getElementById("divi").value;
                if(geodesicV<input){
                    geodesicV+=1;
                    sphere=divideSphere(pairs,sphere,getColor);
                    pairs=getUniquePointPairs(sphere);
                }
                writeStats(sphere,pairs,{"x":0,"y":0});
            }

            function rotateX(point, radians) {
                var y = point.y;
                point.y = (y * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
                point.z = (y * Math.sin(radians)) + (point.z * Math.cos(radians));
            }
            
            function rotateY(point, radians) {
                var x = point.x;
                point.x = (x * Math.cos(radians)) + (point.z * Math.sin(radians) * -1.0);
                point.z = (x * Math.sin(radians)) + (point.z * Math.cos(radians));
            }

            function rotateZ(point, radians) {
                var x = point.x;
                point.x = (x * Math.cos(radians)) + (point.y * Math.sin(radians) * -1.0);
                point.y = (x * Math.sin(radians)) + (point.y * Math.cos(radians));
            }

            function projection(xy, z, xyOffset, zOffset, distance) {
                return ((distance * xy) / (z - zOffset)) + xyOffset;
            }

            function render() {
                var canvas = document.getElementById("sphere3d");
                var width = canvas.getAttribute("width");
                var height = canvas.getAttribute("height");
                var ctx = canvas.getContext('2d');
                

                
                
                ctx.save();
                ctx.clearRect(0, 0, width, height);
            

                ctx.globalCompositeOperation = "lighter";
                //console.log(sphere);

                //draw all lines
                transformShape(pairs,ctx,width,height);

                //draw funky balls on top
                transformShape(sphere,ctx,width,height);
                

                ctx.restore();
                ctx.fillStyle = "rgb(150,150,150)";
                
                var varRota=3.6*document.getElementById("rota").value+1;

                //use automatic rotation if no manual rotation is used
                if(!manualRota){               
                    rotation.x += Math.PI/varRota;
                    rotation.y += Math.PI/varRota;
                    rotation.z += Math.PI/varRota;
                }       

                if(distance < 1000) {
                    distance += 10;
                }
                
            }

            function writeStats(points,lines){
                var tag=document.getElementById("stats");
                var lineLength = {};
                var temp;

                //calculate how many diffrent line length there are

                for(var i=0,c=lines.length;i<c;i+=1){
                    temp = calcDistance(lines[i][0],lines[i][1]).toFixed(3);
                    if(lineLength[temp]){
                        lineLength[temp]+=1;
                    } else {
                        lineLength[temp]=1;
                    }
                }
                temp = "";
                for(var i in lineLength){
                    if(lineLength.hasOwnProperty(i)){
                        temp+= i+"x"+lineLength[i]+", ";
                    }
                }
                lineLength = temp;
                //TODO Add StDev here... in loop above

                //closest points
                temp = getDistanceFromSinglePoint(sphere,{"x":origin.x,"y":origin.y,"z":100});
                sphere[temp[0].point].color = "rgba(255,0,0,1)"//get closest (temp[0]) point id (.point) and set that point to red

                tag.innerHTML= "Points: "+points.length+"<br/>\n"+
                "Lines: "+lines.length+"<br/>\n"+
                "Faces: "+lines.length*2/3+"<br/>\n"+
                "Position X: "+origin.x+", Position Y:"+origin.y+"<br/>\n"+
              
                "Line Length: "+lineLength+"<br/>\n"+
                "Closest Point: "+lines.length*2/3+"<br/>\n"+
                "Face Points: "+lines.length*2/3+"<br/>\n";
            }

            function transformShape(points,ctx,width,height){
                var varDis = distance * document.getElementById("dist").value;
                var varSiz = document.getElementById("siz").value;
                var x, y,line,depth;

                if(points[0].length==2){
                    line=true;
                }

                for(i = 0, c=points.length; i < c; i+=1) {
                    var p;
                    if(line){
                        p=transformPoint(points[i][0]);

                        x = {"x":projection(p.x, p.z, width/2.0, cameraDistance, varDis)};
                        x.y = projection(p.y, p.z, height/2.0, cameraDistance, varDis);

                        depth=p.z; //safe old p until depth calc

                        p=transformPoint(points[i][1]);

                        y = {"x":projection(p.x, p.z, width/2.0, cameraDistance, varDis)};
                        y.y = projection(p.y, p.z, height/2.0, cameraDistance, varDis);

                        //debth calc
                        depth=[(depth+sphRad)/sphRad2x,(p.z+sphRad)/sphRad2x];
                        

                    } else {
                        p=transformPoint(points[i]);

                        x = projection(p.x, p.z, width/2.0, cameraDistance, varDis);
                        y = projection(p.y, p.z, height/2.0, cameraDistance, varDis);
                    }
                    
                    //if not outside of canvas
                    if(line){
                        if(x.x>=0 && y.x>=0 && x.x<width && y.x < width && x.y >=0 && y.y >=0 && x.y < height && y.y < height){
                            drawLine(ctx,x,y,depth);
                        }                        
                    } else {
                        if((x >= 0) && (x < width)) {
                            if((y >= 0) && (y < height)) {                            
                                    drawPoint(ctx, x, y, (((p.z+sphRad)/sphRad2x)+1)*varSiz, (p.color)?p.color:getColor());
                            }
                        }
                    }                  
                }
            }

            function transformPoint(point){
                var p = {};
                p.x = point.x;
                p.y = point.y;
                p.z = point.z;
                p.color = point.color;

                rotateX(p, rotation.x);
                rotateY(p, rotation.y);
                rotateZ(p, rotation.z);

                return p;
            }
            
            function drawPoint(ctx, x, y, size, color) {
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = color;
                ctx.arc(x, y, size, 0, 2*Math.PI, true);
                ctx.fill();
                ctx.restore();
            }

            function drawLine(ctx, p1, p2, depth, size, color) {
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = color || "rgb(20,20,20)";                
                
                //console.log(depth);

                if(depth){
                    var gray;
                    var grd = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    
                    //first gray
                    gray = maxLightGray-Math.round(maxLightGray*depth[0])+30;
                    gray = [gray,gray,gray];
                    grd.addColorStop(0, "rgb("+gray.join(",")+")");
                    //second gray
                    gray = maxLightGray-Math.round(maxLightGray*depth[1])+30;
                    gray = [gray,gray,gray];
                    grd.addColorStop(1, "rgb("+gray.join(",")+")");

                    //overwrite style
                    ctx.strokeStyle=grd;
                    
                }

                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x,p2.y)
                ctx.lineWidth = size || 1;
                ctx.stroke();
                ctx.restore();
            }

            function getColor(){
                var num = Math.round(Math.random()*colors.length);
                if(num==colors.length){
                    num-=1;
                }
                return "rgba("+colors[num].join(",")+",1)";
            }

            function resetColor(){
                for(var i=0,c=sphere.length;i<c;i+=1){
                    sphere[i].color=getColor();
                }
            }

            function init(){
                // Set framerate to 30 fps
                setInterval(render, 1000/24);
                setInValue('dist');
                setInValue('rota');
                setInValue('siz');
                document.body.ondblclick = moveByMouse;
                document.getElementById("sphere3d").onmousemove = function(e){
                    //console.log(e);
                    origin.x = e.offsetX;
                    origin.y = e.offsetY;
                    writeStats(sphere,pairs,origin);
                };
                controlInitSize();
                writeStats(sphere,pairs,origin);
            }

            function controlInitSize(){
                var rad = document.getElementsByName("radSize");
                for(var i = 0,c = rad.length;i<c;i+=1){
                    rad[i].onclick = function(){
                        switch(this.value){
                            case "4": sphere = createPoints(getColor,4); break;
                            case "5": sphere = createPoints(getColor,5); break;
                            case "6": sphere = createPoints(getColor,6); break;
                            case "12": sphere = createPoints(getColor); break;
                            case "custom": sphere = createPoints(getColor,document.getElementById("cust").value); break;
                            default : sphere = createPoints(getColor); 
                        }
                        pairs=getUniquePointPairs(sphere);
                        writeStats(sphere,pairs,origin);
                    }
                }
            }

            function setInValue(n,name){
                if(name){
                    document.getElementById('cus').click();
                } else {
                   document.getElementById(n+'Val').innerHTML = document.getElementById(n).value; 
               }                
            }


            function moveByMouse(e){
                console.log("found you",e);
                manualRota=!manualRota;
                if(manualRota){
                    origin.x=e.x;
                    origin.y=e.y;
                    document.onmousemove = function(e){                        
                            rotation.z+=mouseRotationSpeed*(e.x-origin.x);
                            rotation.x+=mouseRotationSpeed*(e.y-origin.y);
                            origin.x=e.x;
                            origin.y=e.y;                        
                    };
                } else {
                    document.onmousemove = null;
                }
                
            }