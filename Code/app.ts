
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
		let latLngPattern = /([^,]+),(.+)/;

		return [
				{ Type: "GPS", LatLngVar: "%LOC", TimeVar: "%LOCTMS", SpeedVar: "%LOCSPD", Precedence: 1 },
				{ Type: "Network", LatLngVar: "%LOCN", TimeVar: "%LOCNTMS", SpeedVar: null, Precedence: 0 }
			]
			.map(l => {
				let latLngMatch: RegExpMatchArray;
				if (this.getGlobal(l.LatLngVar) && (latLngMatch = this.getGlobal(l.LatLngVar).match(latLngPattern))) {
					let age = this.getGlobal(l.TimeVar) - this.getGlobal("%TIMES");
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

	ComposeResponse(): string {
		let fix = this.GetBestLocationFix();
		return this.ComposeReponseFromFix(fix);
	}
	
	ComposeReponseFromFix(bestLocation: LocationFix) {

		if (bestLocation) {
			let hhmmss = bestLocation.Time.toTimeString().split(' ')[0];
			let smsbody = `At ${hhmmss}, I'm here: http://maps.google.com/maps?z=12&t=m&q=loc:${bestLocation.Lat}+${bestLocation.Lng} .` ;
			if(bestLocation.SpeedMps < 0.3) smsbody += " I'm stationary.";
			else { 
				let speedKph = bestLocation.SpeedMps * 3.6;
				smsbody += ` I'm moving at ${speedKph.toFixed(0)}kph.`;
			}
			return smsbody;
		}
		else {
			return "Sorry, unable to get a recent location fix.";
		}
	}
}