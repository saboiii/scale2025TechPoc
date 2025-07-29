sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("project1.controller.Overview", {
        scheduleQueue: [],

        flightStatusList: [],

        onInit: function () {
            // Always load mock data from local JSON
            var oMockModel = new sap.ui.model.json.JSONModel("model/maintenance-Aircraft.json");
            this.getView().setModel(oMockModel);
        },

        onSchedulePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var sTailNumber = oButton.data("TailNumber");
            var oModel = this.getView().getModel();
            var aAircraft = oModel.getProperty("/Aircraft");
            var oAircraft = aAircraft.find(function (item) { return item.tailNumber === sTailNumber; });
            // Check if a flightStatus entity with SCHEDULED status already exists for this aircraft
            var alreadyScheduled = this.flightStatusList.some(function(fs) {
                return fs.aircraft === sTailNumber && fs.status === "SCHEDULED";
            });
            if (oAircraft && !alreadyScheduled) {
                // Create flightStatus entity for this aircraft
                var flightStatus = {
                    flightNumber: "FLIGHT-" + sTailNumber + "-" + Date.now(),
                    aircraft: sTailNumber,
                    departure: "TBD",
                    arrival: "TBD",
                    status: "SCHEDULED"
                };
                this.flightStatusList.push(flightStatus);
                // Add to schedule queue
                this.scheduleQueue.push(flightStatus);
                // Mark aircraft as scheduled for button disabling
                oAircraft._scheduled = true;
                oModel.setProperty("/Aircraft", aAircraft);
                // Log the queue BEFORE processing
                console.log("Schedule Queue (before processing):", this.scheduleQueue);
                MessageToast.show("Aircraft " + sTailNumber + " added to scheduling queue!");
                // Pop and process the next item in the queue
                this.processQueue();
            }
        },

        processQueue: function () {
            if (this.scheduleQueue.length > 0) {
                var nextFlight = this.scheduleQueue.shift();
                console.log("Processing flight:", nextFlight);
                // Call BPA API (replace with your endpoint)
                fetch("https://your-bpa-api/schedule", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tailNumber: nextFlight.aircraft, status: nextFlight.status })
                })
                    .then(function (response) { return response.json(); })
                    .then(function (data) { console.log("BPA API response:", data); })
                    .catch(function (err) { console.error("BPA API error:", err); });
            }
        }
    });
});