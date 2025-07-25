using maintenance as my from '../db/data-model';
service MaintenanceService {
   @readonly
   entity Aircraft as projection on my.Aircraft;
}


annotate MaintenanceService.Aircraft with @(
   UI.LineItem : [
       { Value: tailNumber, Label: 'Tail Number' },
       { Value: model, Label: 'Model' },
       { Value: lastCheck, Label: 'Last Check' },
       { Value: nextCheck, Label: 'Next Check' },
       { Value: flightHours, Label: 'Flight Hours' }
   ]
);
