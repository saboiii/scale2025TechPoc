using { db as my } from '../db/data-model.cds';

@path : '/service/flightStatus'
service flightStatus {

  entity flightStatus as projection on my.flightStatus;

  // Action to trigger smart scheduling logic
  action checkAndSchedule(flightNumber: String) returns String;
}
