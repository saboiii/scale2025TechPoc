namespace maintenance;
entity Aircraft {
 key tailNumber          : String(10);
     model               : String(50);
     lastCheck           : Date;
     nextCheck           : Date;
     flightHours         : Integer;
}
