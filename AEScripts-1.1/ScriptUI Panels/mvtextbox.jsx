//@target aftereffects
var thisScript = this;
thisScript.name = "MV TextBox";

thisScript.buildGUI = function(thisObj) {
    // thisObj.theCopiedKeys = thisObj.prefs.readFromPrefs();
    thisObj.pal = (thisObj instanceof Panel)?
    thisObj: 
    new Window("palette", thisObj.scriptTitle, undefined, {resizeable: true});
    // ----------------------- UI Elements here ---------------------
    var addTextBoxBtn = thisObj.pal.add("button", undefined, "Do the things");
    addTextBoxBtn.onClick = function () {
        thisScript.addTextBox()
    };

    //------------------------ build the GUI ------------------------
    if (thisObj.pal instanceof Window) {
        thisObj.pal.center();
        thisObj.pal.show();
    } else{
        thisObj.pal.layout.layout(true);
    }
}

//---------------------------- functions n shit ---------------------
thisScript.addTextBox = function(boxSize){
    app.beginUndoGroup(thisScript.name);
    var theComp = app.project.activeItem;
    if (!boxSize) {
        boxSize = [theComp.width * 0.8, theComp.height * 10];
    }
    if (theComp ){
        newTextBox = theComp.layers.addBoxText(boxSize);
        newTextBox
    }
    app.endUndoGroup();
}

//---------------------------- ui prefs -----------------------------
thisScript.Preferences = function(scriptName) {
    // look for preferences for this object
    // provide a setPref function to allow values to be stored in AE's preferences
    // scriptName sets the section of the preference file they are saved in.
    this.prefsName = scriptName;
    alert ( this.prefsName);
    parsePref = function(val, prefType) {
        switch (prefType) {
            case "integer":
            case "int":
            return parseInt(val, 10);
            case "float":
            return parseFloat(val);
            case "bool":
            return (val === "true")
            default:
            return val
        }
    }
    
    this.setPref = function(anObject) {
        var currentVal;
        if (anObject.name){
            if(anObject.hasOwnProperty('value')){
                currentVal = anObject.value;
            } else if (anObject instanceof EditText){
                currentVal = anObject.text;
            } else {
                throw("objects must have a 'text' or 'value' property to set preferences")
            }
            
            if (anObject.savedPref !== currentVal) {
                anObject.savedPref = currentVal;
                app.settings.saveSetting(this.scriptName, anObject.name, currentVal);
            }
        }
    }
    
    this.getPref = function(anObject){
        // constructor
        if (anObject.name ){
            if (app.settings.haveSetting(this.scriptName, anObject.name)) {
                // get prefs for UI control     
                if (anObject instanceof Slider){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "float");   
                } else if (anObject instanceof Checkbox || anObject instanceof Radiobutton){
                    anObject.value = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "bool");
                } else if (anObject instanceof EditText ){
                    anObject.text = anObject.savedPref = parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), "string");
                } else {
                    // objects can use specified pref types with the type of the returned result determined by a preftype property
                    // otherwise the default is a string
                    anObject.value = anObject.savedPref = anObject.parsePref(app.settings.getSetting(anObject.prefsName, anObject.name), anObject.prefType); 
                }
            }
        } else {
            throw("objects must have a name to be given prefs.");
        }
        
    }
    
    return this;
}

//--------------------- go ahead and run ----------------------
thisScript.buildGUI(this);
