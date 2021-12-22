// @target aftereffects
// Connect Point to Mask Vertex
// An After Effects (CS3 or later) script
// to aid in the animating of 2-dimensional properties
// by linking them to individual mask vertices.
// Requested by Eric Deren
// version 1 -- based in large part on "Connect Vertex to Point" script.
// by CR Green
// based in part on other works by Dan Ebberts, Alejandro Perez, Juan Corcoles
// Thanks to them, and as always, thanks to creativecow.net and aenhancers.com
/*
Note:


*/
var theComp = null;
var aiPixelAR = 1;
var preCheckOK = false;
var vGuide = undefined;

var guideName = "vertex guide";
var pal = new Window('palette', '',[300,100,620,284]);
var theMask = null;
var otherProp = null;
var workingVertexIndex = 0;
var seMaskLayer = null;
var sePropLayer = null;

var palette = mainGUIWindo();
if (palette != null) {
	palette.show();
}
////////////////////////////////////////////
function moveGuideClick() {
	mainPreCheck();
	if (preCheckOK) {
		if (theComp.layer(guideName) != undefined) {
			moveGuideToV();
		}
	}
}
////////////////////////////////////////////
function moveGuideBackClick() {
	mainPreCheck();
	if (preCheckOK) {
		if (theComp.layer(guideName) != undefined) {
			moveGuideToVBack();
		}
	}
}
////////////////////////////////////////////
function moveGuideToV() {
	if (! theComp.layer(guideName).enabled) {theComp.layer(guideName).enabled = true;}
	
	var maskProperty = theMask.property("ADBE Mask Shape");
	var myShape = maskProperty.value;
	var vertexLimit = myShape.vertices.length;
	
	if (workingVertexIndex == 0) {
		workingVertexIndex = vertexLimit;
	}
	workingVertexIndex--;
	v = myShape.vertices[workingVertexIndex];
	theComp.layer(guideName).Position.setValue(v);
	reportStuff("\"" + otherProp.name + "\" of layer \"" + sePropLayer.name + 
		"\"\n" + "Mask \"" + theMask.name + "\" of layer \"" + seMaskLayer.name + "\", vertex " + workingVertexIndex);
}
////////////////////////////////////////////
function moveGuideToVBack() {
	if (! theComp.layer(guideName).enabled) {theComp.layer(guideName).enabled = true;}
	
	var maskProperty = theMask.property("ADBE Mask Shape");
	var myShape = maskProperty.value;
	var vertexLimit = (myShape.vertices.length - 1);
	
	if (workingVertexIndex == vertexLimit) {
		workingVertexIndex = -1;
	}
	workingVertexIndex++;
	v = myShape.vertices[workingVertexIndex];
	theComp.layer(guideName).Position.setValue(v);
	reportStuff("\"" + otherProp.name + "\" of layer \"" + sePropLayer.name + 
		"\"\n" + "Mask \"" + theMask.name + "\" of layer \"" + seMaskLayer.name + "\", vertex " + workingVertexIndex);
}
////////////////////////////////////////////
function linkClick() {
	mainPreCheck();
	if (preCheckOK) {
		if (theComp.layer(guideName) != undefined) {
			app.beginUndoGroup("Link Point to Vertex");
			//linkVertexToProp();
			linkPropToVertex();
			app.endUndoGroup();
		} else {
			alert("You have to create a vertex guide layer first.");  
		}
	}
}

////////////////////////////////////////////
function linkPropToVertex() {
	var myIn = seMaskLayer.inPoint;
	var myOut = seMaskLayer.outPoint;
	var f = Math.round(myIn/theComp.frameDuration); // frame counter
	
	var maskProperty = theMask.property("ADBE Mask Shape");
	var myShape = maskProperty.value;
	
	var t,p,vv;
	
	while (f <= Math.round(myOut/theComp.frameDuration)){
		pal.progArea.text = ("Setting keyframe " + f);
		pal.hide();//these two lines now needed to fix ae7
		pal.show();//these two lines now needed to fix ae7
		t = f*theComp.frameDuration;
		
		p = otherProp.valueAtTime(t,false);
		
		myShape = maskProperty.valueAtTime(t,true);
		
		vv = myShape.vertices;
		//vv[workingVertexIndex] = [p[0], p[1]];
		
		myShape.vertices = vv;
		
		//maskProperty.setValueAtTime(t,myShape);
		
		otherProp.setValueAtTime(t,myShape.vertices[workingVertexIndex]);
		//alert(myShape.vertices[workingVertexIndex]);
		
		f++;
	}
	// now we get the selection back to where it was
	theMask.selected = false;//mask shape gets selected when adding keyframes, so we deselect the whole mask first
	theMask.selected = true;//then select just the mask
	otherProp.selected = true;
	///////////////////////////
	//reportStuff("vertex " + workingVertexIndex + " of mask \"" + theMask.name + "\" of layer \"" + seMaskLayer.name + 
		//"\"\n    connected to\n" + 
		//"\"" + otherProp.name + "\" of layer \"" + sePropLayer.name + "\".");
	
		reportStuff("\"" + otherProp.name + "\" of layer \"" + sePropLayer.name + "\"\n    connected to\n" + 
		"vertex " + workingVertexIndex + " of mask \"" + theMask.name + "\" of layer \"" + seMaskLayer.name + 
		".");
		
	if (theComp.layer(guideName) != null) {theComp.layer(guideName).enabled = false;}
}
////////////////////////////////////////////
function mainGUIWindo() {
	if (pal != null) {
		pal.mainPnl = pal.add('panel', [10,1,309,111], 'the vertex linker');
		pal.progArea = pal.add("statictext", [21,15,255,111], 'Click \"Make Guide\" first,\nmove the guide layer with the \"<\" and \">\" buttons, then click \"Apply\".', {multiline:true} );
		
		pal.guideBtn = pal.add('button', [10,120,99,138], 'Make Guide', {name:'guide'});
		pal.huhBtn = pal.add('button', [10,148,99,166], 'Help', {name:'huh'});
		pal.backVBtn = pal.add('button', [108,120,202,138], '< Prev. Vertex', {name:'backV'});
		pal.nextVBtn = pal.add('button', [210,120,309,138], 'Next Vertex >', {name:'nextV'});
		pal.applyBtn = pal.add('button', [108,148,202,166], 'Apply', {name:'apply'});
		pal.stopBtn = pal.add('button', [210,148,309,166], 'Close', {name:'stop'});
		
		pal.stopBtn.onClick = function () {this.parent.close(1)};
		pal.guideBtn.onClick = newGuideClick;
		pal.backVBtn.onClick = moveGuideBackClick;
		pal.nextVBtn.onClick = moveGuideClick;
		pal.applyBtn.onClick = linkClick;
		pal.huhBtn.onClick = function() {alert('Helpful Hints:\n The weirdest part of this is selecting just a mask and an appropriate property.\n\n'
				+ ' You must only select a mask and a point property (like position).\n\n If you keep getting an annoying message'
				+ ' about not having the right stuff selected, you should deselect everything (menu: "Edit" item: "DeSelect All"), '
				+ 'then click on a mask (NOT a mask property) and command-click (Windows: control-click) the point property you want to link the mask vertex to.'
				+ '\n\n Usually, you can also deselect everything by clicking on the timeline area below all the layers.')
		;
		alert('Part 2:\n After the vertex guide is created, you can delete it, or you can keep it and change the look of it (change the '
			+ 'color, mask, etc.) if that suits you.\n Always use the vertex guide to keep track of the "selected" vertex.'
			+ '\n If the vertex guide is not showing up, it may be targeting an off-screen vertex, so click the < or > buttons to target a'
			+ ' visible vertex.');
		alert('IMPORTANT:\n This is meant to be used with a mask layer whose dimensions match the comp. Also, The geometrics '
			+ '(scale, rotation, position, etc.) of the mask layer should be their default values; if these values have been changed, '
			+ 'the vertex guide will be off, and you will get bad results.');
		};
	}
	return pal;
}
////////////////////////////////////////////
function putMaskInLayer(theLayer, theVerts, mMode) {
	var crossHair = theLayer.mask.addProperty("ADBE Mask Atom");
	var theShape = new Shape();
	theShape.vertices = theVerts;
	crossHair.maskShape.setValue(theShape);
	crossHair.maskMode = mMode;
}
////////////////////////////////////////////
function newGuideClick() {
	mainPreCheck();
	if (preCheckOK) {
		if (theComp.layer(guideName) == undefined) {
			app.beginUndoGroup("Vertex Guide Creation");
			makeNewVGuide();
			app.endUndoGroup();
		} else {
			if (! theComp.layer(guideName).enabled) {theComp.layer(guideName).enabled = true;}
		}
	}
}
////////////////////////////////////////////
function makeNewVGuide() {
	var guideColor = [1, 0, 0];
	var crossHairVertsHoriz = [ [0,49],[0,52],[101,52],[101,49] ];
	var crossHairVertsVerti = [ [52,0],[49,0],[49,101],[52,101] ];
	var guideSize = 101;
	// Create a solid
	vGuide = theComp.layers.addSolid(guideColor, guideName, guideSize, guideSize, aiPixelAR);
	// Make it a guide layer
	vGuide.guideLayer = true;
	putMaskInLayer(vGuide, crossHairVertsHoriz, MaskMode.DIFFERENCE);
	putMaskInLayer(vGuide, crossHairVertsVerti, MaskMode.DIFFERENCE);
	moveGuideToV();
	///////////////// in ae7, the selection gets killed when creating the vertex guide, so we deselect guide and reselect mask and point:
	vGuide.selected = false;
	theMask.selected = true;
	otherProp.selected = true;
	/////////////////
	reportStuff("\"" + otherProp.name + "\" of layer \"" + sePropLayer.name + 
		"\"\n" + "Mask \"" + theMask.name + "\" of layer \"" + seMaskLayer.name + "\"");
	
}
////////////////////////////////////////////
function reportStuff(stuffToReport) {
	pal.progArea.text = (stuffToReport);
}
////////////////////////////////////////////
function mainPreCheck() {
	preCheckOK = false;
	
	if (app.project != null) {
		if (app.project.activeItem != null) {
			if (app.project.activeItem instanceof CompItem) {
				
				var propSel = app.project.activeItem.selectedProperties;
				var selLength = propSel.length;
				
				if (selLength < 2) {//might want to add || selLength > 2
					
					alert("Please select one mask and one other property.");
					
				} else {
					
					theComp = app.project.activeItem;
					
					for (var thisSelectedProp = 0; thisSelectedProp <= selLength; thisSelectedProp++) {
						if (propSel[thisSelectedProp].matchName == "ADBE Mask Atom") { 
							theMask = propSel[thisSelectedProp];// grab first mask encountered
							
							//get its layer (um ... is this the easiest/most efficient way? i was hoping something like property.layer would work)
							deepness=propSel[thisSelectedProp].propertyDepth;
							d = propSel[thisSelectedProp];
							for (var i=1;i<=deepness;i++) {
								d=d.parentProperty;
							}
							seMaskLayer = d;
							break;
						} 
					}
					/////////////////
					if (theMask != null) {
						for (var selPropIndex = 0; selPropIndex <= selLength; selPropIndex++) {
							thisProp = propSel[selPropIndex];
							if (thisProp.constructor.name == "Property") { 
								// okay, it's a property, now look for a 2D array (might want to include numbers and 3D arrays if this fails ... )
								if (thisProp.value.constructor == Array) {
									// it's an array, now how many dimensions?
									propDim = thisProp.value.length;
									if (propDim >1) { //for now, we'll just accept 2 or greater D properties
										//now, make sure these are numbers:
										if ( (thisProp.value[0].constructor == Number) && (thisProp.value[1].constructor == Number) ) {
											otherProp = thisProp;
											
											//get its layer
											deepness=thisProp.propertyDepth;
											d = thisProp;
											for (var i=1;i<=deepness;i++) {
												d=d.parentProperty;
											}
											sePropLayer = d;
											
											break;
										}
									}
								}
							} 
						}
						if (otherProp != null) {
							preCheckOK = true; // huzzah!
						} else {
							alert("No appropriate property selected.");
						}
					} else {
						alert("No mask selected.");
					}
				}// if (app.project.activeItem.selectedProperties.length != 2)
			}
		}
	}
}
