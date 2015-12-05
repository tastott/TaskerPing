
export interface LocationFix {
	Lat: number;
	Lng: number;
	Time: Date;
	Type:string;
	SpeedMps: number;
}

export class PingResponder { 
	constructor(private getGlobal: (varName: string) => any, 
		private maxAge: number) {

	}

	GetBestLocationFix(): LocationFix {
		var latLngPattern = /([^,]+),(.+)/;

		return [
				{ Type: "GPS", LatLngVar: "%LOC", TimeVar: "%LOCTMS", SpeedVar: "%LOCSPD", Precedence: 1 },
				{ Type: "Network", LatLngVar: "%LOCN", TimeVar: "%LOCNTMS", SpeedVar: null, Precedence: 0 }
			]
			.map(l => {
				var latLngMatch: RegExpMatchArray;
				if (this.getGlobal(l.LatLngVar) && (latLngMatch = this.getGlobal(l.LatLngVar).match(latLngPattern))) {
					var age = this.getGlobal(l.TimeVar) - this.getGlobal("%TIMES");
					return {
						Type: l.Type,
						Lat: parseFloat(latLngMatch[1]),
						Lng: parseFloat(latLngMatch[2]),
						Time: new Date(this.getGlobal(l.TimeVar) * 1000),
						Age: age,
						SpeedMps: l.SpeedVar ? this.getGlobal(l.SpeedVar) : null,
						Precedence: l.Precedence
					};
				}
				else {
					return null;
				}
			})
			.filter(l => !!l)
			.filter(l => l.Age < this.maxAge)
			.sort((a, b) => b.Precedence - a.Precedence)
			.map(lf => ({
				Type: lf.Type,
				Lat: lf.Lat,
				Lng: lf.Lng,
				Time: lf.Time,
				SpeedMps: lf.SpeedMps
			}))
		[0] || null;
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