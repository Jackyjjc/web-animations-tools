/*
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Polymer('wat-timeditem-inspector', {
  easing: '',
  customEasing: '',
  bezierEasings: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
    'cubic-bezier'],
  stepEasings: ['step-start', 'step-middle', 'step-end', 'steps'],
  presetEasings: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
      'step-start', 'step-middle', 'step-end'],

  observe: {
    'timedItem.specified.easing': 'timedItemEasingChanged',
    '$.targetSelector.selected': 'animationTargetChanged',
  },

  created: function() {
    this.timedItem = new Animation(null, null, 0);
  },
  
  ready: function() {
    this.easing = this.timedItem.specified.easing;

    // Change the value of the input element does not trigger
    // the change event, therefore need to manually fire it.
    this.addEventListener('select-target', function(e) {
      this.showPropertyContainer();
      this.$.animTarget.value = e.detail;
      var e = new CustomEvent('change', null);
      this.$.animTarget.dispatchEvent(e);
    });
  },

  easingChanged: function() {
    if (this.timedItem && this.easing != 'custom') {
      this.timedItem.specified.easing = this.easing;
    } else {
      this.customEasing = '';
    }
  },

  customEasingChanged: function() {
    this.timedItem.specified.easing = this.customEasing;
  },

  timedItemChanged: function() {
    if (this.timedItem) {
      this.easing = this.timedItem.specified.easing;
      this.$['wat-bezier'].timedItem = this.timedItem;
      this.$['wat-step'].timedItem = this.timedItem;
      this.$.targetSelector.selected = this.timedItem.target ?
          this.timedItem.target.id : '';
    } else {
      this.timedItem = new Animation(null, null, 0);
    }
  },

  timedItemEasingChanged: function() {
    if (!this.timedItem) {
      return;
    }
    this.easing = this.timedItem.specified.easing;
    if (this.presetEasings.indexOf(this.timedItem.specified.easing) >= 0) {
      this.easing = this.timedItem.specified.easing;
    } else {
      this.easing = 'custom';
      this.customEasing = this.timedItem.specified.easing;
    }
    this.showAppropriateEasingEditor();
  },
  
  previewFrameChanged: function() {
    var elementSelector = this.$.targetSelector;
    this.previewFrame.addEventListener('load', 
        elementSelector.update.bind(elementSelector));
  },

  animationTargetChanged: function() {
    var doc = this.previewFrame.contentDocument;
    var elem = doc.getElementById(this.$.targetSelector.selected);
    if (!elem) {
      return;
    }
    var oldAnim = this.timedItem;
    var newAnim = new Animation(elem, oldAnim.effect, oldAnim.specified);
    newAnim.name = oldAnim.name;
    if (oldAnim.parent) {
      oldAnim.before(newAnim);
      oldAnim.remove();
    }
    this.timedItem = newAnim;
    this.showPropertyContainer();
  },

  showAppropriateEasingEditor: function() {
    if (this.bezierEasings.indexOf(this.timedItem.specified.easing) >= 0 ||
        this.timedItem.specified.easing.indexOf('cubic-bezier') >= 0) {
      this.$['wat-step'].className = 'hidden';
      this.$['wat-bezier'].className = '';
    } else if (this.stepEasings.indexOf(this.timedItem.specified.easing) >= 0 ||
        this.timedItem.specified.easing.indexOf('steps') >= 0) {
      this.$['wat-bezier'].className = 'hidden';
      this.$['wat-step'].className = '';
   }
  },

  showEasingEditorContainer: function() {
    this.$['property-container'].className = 'hidden';
    this.showAppropriateEasingEditor(); 
    this.$['easing-editor-container'].className = '';
  },

  showElementSelectorContainer: function() {
    this.$['property-container'].className = 'hidden';
    this.$['target-selector-container'].className = '';
    this.$.targetSelector.update();
  },

  showPropertyContainer: function() {
    if (this.presetEasings.indexOf(this.timedItem.specified.easing) >= 0) {
      this.easing = this.timedItem.specified.easing;
    }
    this.$['easing-editor-container'].className = 'hidden';
    this.$['target-selector-container'].className = 'hidden';
    this.$['property-container'].className = '';
  }
});