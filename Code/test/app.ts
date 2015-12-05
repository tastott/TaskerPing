///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require("chai")
var expect = chai.expect;

import app = require("../app")

describe("Ping Responder", () => {
	it("Should prefer GPS if not old", () => {
		var responder = new app.PingResponder(varName => {
			switch(varName){
				case "%LOC": return "51,1.3";
				case "%LOCTMS": return 9;
				case "%LOCN": return "52,-1.3";
				case "%LOCNTMS": return 8;
				case "%LOCSPD": return 10;
				case "%TIMES": return 0;
				default: throw new Error(`Unrecognized variable name: '${varName}'`);
			}
		}, 10);
		var fix = responder.GetBestLocationFix();
		var expected : app.LocationFix = {
			Type: 'GPS',
			Lat: 51,
			Lng: 1.3,
			Time: new Date(9000),
			SpeedMps: 10
		};
		expect(fix).to.be.deep.equal(expected);
	})
	
	it("Should ignore GPS if old", () => {
		var responder = new app.PingResponder(varName => {
			switch(varName){
				case "%LOC": return "51,1.3";
				case "%LOCTMS": return 11;
				case "%LOCN": return "41,-3";
				case "%LOCNTMS": return 9;
				case "%LOCSPD": return 10;
				case "%TIMES": return 0;
				default: throw new Error(`Unrecognized variable name: '${varName}'`);
			}
		}, 10);
		var fix = responder.GetBestLocationFix();
		var expected : app.LocationFix = {
			Type: 'Network',
			Lat: 41,
			Lng: -3,
			Time: new Date(9000),
			SpeedMps: null
		};
		expect(fix).to.be.deep.equal(expected);
	})
	
	it("Should ignore both if old", () => {
		var responder = new app.PingResponder(varName => {
			switch(varName){
				case "%LOC": return "51,1.3";
				case "%LOCTMS": return 11;
				case "%LOCN": return "41,-3";
				case "%LOCNTMS": return 12;
				case "%LOCSPD": return 10;
				case "%TIMES": return 0;
				default: throw new Error(`Unrecognized variable name: '${varName}'`);
			}
		}, 10);
		var fix = responder.GetBestLocationFix();
		expect(fix).to.be.null;
	})
	
	it('Should compose correct response while moving very slowly', () => {
		var responder = new app.PingResponder(null, 0);
		var fix: app.LocationFix = {
			Type: 'GPS',
			Lat: 1,
			Lng: 2,
			Time: new Date(2015, 1, 1, 12, 13, 43),
			SpeedMps: 0.1
		};
		
		var expected = "At 12:13:43, I'm here: http://maps.google.com/maps?z=12&t=m&q=loc:1+2 . I'm stationary.";
		var response = responder.ComposeReponseFromFix(fix);
		expect(response).to.be.equal(expected);
	})
	
	it('Should compose correct response while moving', () => {
		var responder = new app.PingResponder(null, 0);
		var fix: app.LocationFix = {
			Type: 'GPS',
			Lat: 1,
			Lng: 2,
			Time: new Date(2015, 1, 1, 12, 13, 43),
			SpeedMps: 10
		};
		
		var expected = "At 12:13:43, I'm here: http://maps.google.com/maps?z=12&t=m&q=loc:1+2 . I'm moving at 36kph.";
		var response = responder.ComposeReponseFromFix(fix);
		expect(response).to.be.equal(expected);
	})
	
	it('Should compose correct response while moving', () => {
		var responder = new app.PingResponder(null, 0);
		var expected = "Sorry, unable to get a recent location fix.";
		var response = responder.ComposeReponseFromFix(null);
		expect(response).to.be.equal(expected);
	})
})