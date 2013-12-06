/*
Copyright 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and

limitations under the License.
*/

Polymer('wat-keyframe-editor', {

  //the keyframe effect object
  effect: null,
  
  //the frames and properties that are currently being edited
  frames: null,
  properties: null,

  //record all known properties to prevent user adding redundant properties
  //can be done by searching through the properties array but this is free
  //as we already generated it on initialization
  found: null,

  //when effect is changed, update the fields to reflect the changes
  effectChanged: function(oldValue, newValue) {

    var frames = this.effect.getFrames();

    //need to loop through all the frames to get all the properties
    //because each frame only have a subset of them
    var found = {};
    var properties = [];

    var i, prop;
    for (i = 0; i < frames.length; i++) {
      for (prop in frames[i]) {
            
        if (found[prop]) {
          continue;
        }

        found[prop] = true;
        properties.push(prop);
      }
    }

    this.frames = frames;
    this.properties = properties;
    this.found = found;
  },
  
  cellValueChanged: function(e) {

    //find the corresponding frame and property of the changing cell
    var frameIndex = e.target.dataset["column"];
    var propIndex = e.target.dataset["row"];

    var prop = this.properties[propIndex];
    var frame = this.frames[frameIndex];

    var value = e.target.value;
    if (prop === "offset") {
      value = parseFloat(value);
    }
    frame[prop] = value;

    this.effect.setFrames(this.frames);
  },

  gainFocus: function(e) {

    //the input element get focus but the parent div get highlighted
    var cell = e.target.parentNode;

    document.timeline.play(
            new Animation(cell, 
                          [{transform:"scale(1)"},
                           {transform:"scale(1.1)"}, 
                           {transform:"scale(1)"}], 
                          0.1)
    );

    cell.style.border = "1px solid blue";
  },

  loseFocus: function(e) {

    //the input element get focus but the parent div get highlighted
    var cell = e.target.parentNode;

    cell.style.border = "1px solid black";
  },

  actionOnFrame: function(e) {
        
    var action = this.getAction(e);
    if (!action) {
      return;
    }

    //get the index of the header on which the action is performing
    var index = parseInt(e.target.dataset["index"]);
    
    if (action === "insert") {
      //insert an empty frame after the current frame
      this.frames.splice(index + 1, 0, {});
    } else if (action === "delete") {
      this.frames.splice(index, 1);
    }

    this.effect.setFrames(this.frames);
  },

  actionOnProperty: function(e) {

    var action = null;
    //13 is the enter key. When enter is pressed, insert the property
    if (e.type === "keyup" && e.keyCode === 13) {
      action = "insert";
    } else {
      action = this.getAction(e);
    }

    if (!action) {
      return;
    }
  
    if (action === "insert") {
      var prop = e.target.value;
      if (this.found[prop]) {
        return;
      }

      this.properties.push(prop);

      //reset the input element back to empty
      e.target.value = "";

    } else if (action === "delete") {
      
      var index = parseInt(e.target.dataset["index"]);
      var prop = this.properties[index];
      
      this.properties.splice(index, 1);
      //remove the property from all the frames
      for(var i = 0; i < this.frames.length; i++) {
        delete this.frames[i][prop];
      }
    }

    this.effect.setFrames(this.frames);
  },

  getAction: function(e) {

    var action = null;

    if (e.type === "click") {
      action = e.target.dataset["action"];

    } else if (e.type === "keyup") {
      switch(e.keyCode) {
        case 45: action = "insert"; break; //45 insert key
        case 46: action = "delete"; break; //46 delete key
        default: break;
      }
    } 

    return action; 
  }
});