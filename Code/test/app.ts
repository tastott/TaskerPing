///<reference path="../typings/mocha/mocha.d.ts" />
///<reference path="../typings/chai/chai.d.ts" />
import chai = require("chai")
var expect = chai.expect;

import app = require("../app")

describe("Example app tests", () => {
	it("Should do stuff", () => {
		var responder = new app.PingResponder(varName => {
			switch(varName){
				case "%LOC": return "51,1.3";
				case "%LOCTMS": return 12345678;
				case "%LOCN": return "53,-1.3";
				case "%LOCNTMS": return 12345679;
				case "%LOCSPD": return 10;
				case "%TIMES": return 12345677;
				default: throw new Error(`Unrecognized variable name: '${varName}'`);
			}
		});
		var response = responder.ComposePingResponse();
	})
})