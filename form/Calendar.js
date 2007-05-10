//TODO: move out of dijit.form.*?
//TODO: make private unless/until we make this accessible?
dojo.provide("dijit.form.Calendar");

dojo.require("dojo.date.calc");
dojo.require("dojo.date.local");
dojo.require("dojo.date.serial");
dojo.require("dojo.date.util");
dojo.require("dojo.cldr.supplemental");

dojo.require("dijit.base.Widget");
dojo.require("dijit.base.TemplatedWidget");
dojo.require("dijit.base.FormElement");

dojo.declare(
	"dijit.form.Calendar",
	[dijit.base.Widget, dijit.base.TemplatedWidget],
	{
		/*
		summary: 
			A simple GUI for choosing a date in the context of a monthly calendar.

		description:
			It can't be used in a form because it doesn't serialize the date to an
			<input> field.  For a form element, use DateTextbox instead.

			Note that the parser takes all dates attributes passed in the `RFC 3339` format:
			http://www.faqs.org/rfcs/rfc3339.html (2005-06-30T08:05:00-07:00)
			so that they are serializable and locale-independent.
		
		usage: 
			var datePicker = new dijit.Calendar({}, dojo.byId("datePickerNode")); 
		 	-or-
			<div dojoType="DatePicker"></div> 
		*/
		templatePath: dojo.moduleUrl("dijit.form", "templates/Calendar.html"),

		// value: Date
		// the currently selected Date
		value: new Date(),

		// dayWidth: String
		// How to represent the days of the week in the calendar header. See dojo.date.locale
		dayWidth: "narrow",

		setValue: function(/*Date*/ value){
			//summary: set the current date and update the UI
			this.value = new Date(value);
			this.displayMonth = new Date(value);
			this._fillInMonth();
			this.onValueChanged(value);
		},

		_fillInMonth: function(){
			var month = this.displayMonth;
			month.setDate(1);
			var firstDay = month.getDay();
			var daysInMonth = dojo.date.getDaysInMonth(month);
			var daysInPreviousMonth = dojo.date.getDaysInMonth(dojo.date.calc.add(month, dojo.date.calc.parts.MONTH, -1));
			var today = new Date();
			var selected = this.value;

			var weekStartsOn = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);

			// Iterate through dates in the calendar and fill in date numbers and style info
			dojo.query(".calendarDateTemplate").forEach(function(template, i){
				i += weekStartsOn;
				var date = new Date(month);
				var clazz;
				if(i < firstDay){
					date = dojo.date.calc.add(date, dojo.date.calc.parts.MONTH, -1);
					date.setDate(daysInPreviousMonth + i - 1);
					clazz = "previous";
				}else if(i >= (firstDay + daysInMonth)){
					date = dojo.date.calc.add(date, dojo.date.calc.parts.MONTH, 1);
					date.setDate(i - firstDay - daysInMonth + 1);
					clazz = "next";
				}else{
					date.setDate(i - firstDay + 1);
					clazz = "current";
				}

				if(!dojo.date.calc.compare(date, today, dojo.date.calc.types.DATE)){
					clazz = "currentDate " + clazz;
				}

				if(!dojo.date.calc.compare(date, selected, dojo.date.calc.types.DATE)){
					clazz = "selectedDate " + clazz;
				}

				template.className =  clazz + "Month calendarDateTemplate";
				template.dijitDateValue = date.valueOf();
				var label = dojo.query(".calendarDateLabel", template)[0];
				label.innerHTML = date.getDate();
			});

			// Fill in localized month name
			this.monthLabelNode.innerHTML = dojo.date.local.getNames('months', 'wide', 'standAlone', this.lang)[month.getMonth()];

			// Fill in localized prev/current/next years
			var y = month.getFullYear() - 1;
			dojo.forEach(["previous", "current", "next"], function(name){
				this[name+"YearLabelNode"].innerHTML =
					dojo.date.local.format(new Date(y++, 0), {selector:'year', locale:this.lang});
			}, this);
		},

		postCreate: function(){
			dijit.form.Calendar.superclass.postCreate.apply(this);

			var dayLabelTemplate = dojo.query(".dayLabelTemplate")[0];
			var calendarDateTemplate = dojo.query(".calendarDateTemplate")[0];
 			for(var i=1; i<7; i++){
				// clone the day label and calendar day templates to make 7 columns
				dayLabelTemplate.parentNode.appendChild(dayLabelTemplate.cloneNode(true));
				calendarDateTemplate.parentNode.appendChild(calendarDateTemplate.cloneNode(true));
  			}

			// now make 6 rows
			var calendarWeekTemplate = dojo.query(".calendarWeekTemplate")[0];
 			for(var j=1; j<6; j++){
				// clone the day label and calendar day templates to make 7 columns
				calendarWeekTemplate.parentNode.appendChild(calendarWeekTemplate.cloneNode(true));
			}

			// insert localized day names in the header
			var dayNames = dojo.date.local.getNames('days', this.dayWidth, 'standAlone', this.lang);
			var weekStartsOn = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
			dojo.query(".dayLabel").forEach(function(label, i){
				label.innerHTML = dayNames[(i + weekStartsOn) % 7];
			});

			this.setValue(this.value);
		},

		_adjustDate: function(/*String*/part, /*int*/amount){
			this.displayMonth = dojo.date.calc.add(this.displayMonth, part, amount);
			this._fillInMonth();
		},

		_onIncrementMonth: function(/*Event*/evt){
			// summary: handler for increment month event
			evt.stopPropagation();
			this._adjustDate(dojo.date.calc.parts.MONTH, 1);
		},
	
		_onDecrementMonth: function(/*Event*/evt){
			// summary: handler for increment month event
			evt.stopPropagation();
			this._adjustDate(dojo.date.calc.parts.MONTH, -1);
		},

		_onIncrementYear: function(/*Event*/evt){
			// summary: handler for increment year event
			evt.stopPropagation();
			this._adjustDate(dojo.date.calc.parts.YEAR, 1);
		},
	
		_onDecrementYear: function(/*Event*/evt){
			// summary: handler for increment year event
			evt.stopPropagation();
			this._adjustDate(dojo.date.calc.parts.YEAR, -1);
		},

		_onDayClick: function(/*Event*/evt){
			var node = evt.target;
			dojo.stopEvent(evt);
			while(!node.dijitDateValue){
				node = node.parentNode;
			}
			this.setValue(node.dijitDateValue);
		},

		onValueChanged: function(/*Date*/date){
			//summary: the set date event handler
		}
	}
);