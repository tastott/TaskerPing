
export interface LocationFix {
	Lat: number;
	Lng: number;
	Time: Date;
	Age: number;
}

export class PingResponder { 
	constructor(private getGlobal: (varName: string) => any, 
		private maxAge: number) {

	}

	GetBestLocationFix(): LocationFix {
		var latLngPattern = /([^,]+),(.+)/;
		var maxAge = 1200; //20 mins

		return [
				{ LatLngVar: "%LOC", TimeVar: "%LOCTMS" },
				{ LatLngVar: "%LOCN", TimeVar: "%LOCNTMS" }
			]
			.map(l => {
				var latLngMatch: RegExpMatchArray;
				if (this.getGlobal(l.LatLngVar) && (latLngMatch = this.getGlobal(l.LatLngVar).match(latLngPattern))) {
					var age = this.getGlobal(l.TimeVar) - this.getGlobal("%TIMES");
					return {
						Lat: parseFloat(latLngMatch[1]),
						Lng: parseFloat(latLngMatch[2]),
						Time: new Date(this.getGlobal(l.TimeVar) * 1000),
						Age: age
					};
				}
				else {
					return null;
				}
			})
			.filter(l => !!l)
			.filter(l => l.Age < maxAge)
			.sort((a, b) => a.Age - b.Age)
		[0];
	}

	ComposePingResponse(): string {
		var bestLocation = this.GetBestLocationFix();

		if (bestLocation) {
			var gmapsUrl = `http;//maps.google.com/maps?z=12&t=m&q=loc:${bestLocation.Lat}+${bestLocation.Lng}`;
			return gmapsUrl;
		}
		else {
			return "Unable to get location";
		}
	}
}