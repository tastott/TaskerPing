
export class PingResponder {
	constructor(private getGlobal: (varName: string) => any) {

	}


	ComposePingResponse(): string {
		var latLngPattern = /([^,]+),(.+)/;
		var maxAge = 1200; //20 mins

		var bestLocation = [
			{ LatLngVar: "%LOC", TimeVar: "%LOCTMS" },
			{ LatLngVar: "%LOCN", TimeVar: "%LOCNTMS" }
		]
			.map(l => {
				var latLngMatch: RegExpMatchArray;
				if (this.getGlobal(l.LatLngVar) && (latLngMatch = this.getGlobal(l.LatLngVar).match(latLngPattern))) {
					var age = this.getGlobal(l.TimeVar) - this.getGlobal("%TIMES");
					return {
						Lat: latLngMatch[1],
						Lng: latLngMatch[2],
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

		if (bestLocation) {
			var gmapsUrl = `http;//maps.google.com/maps?z=12&t=m&q=loc:${bestLocation.Lat}+${bestLocation.Lng}`;
			return gmapsUrl;
		}
		else {
			return "Unable to get location";
		}
	}
}